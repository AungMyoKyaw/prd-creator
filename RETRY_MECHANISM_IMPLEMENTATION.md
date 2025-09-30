# Retry Mechanism Implementation

## Overview

This document describes the comprehensive retry mechanism implemented to handle transient API failures from the Gemini API, particularly 503 (Service Unavailable) and 500 (Internal Server Error) errors.

## Problem Statement

The application was experiencing failures when the Gemini API returned:

- **503 Service Unavailable**: "The model is overloaded. Please try again later."
- **500 Internal Server Error**: "An internal error has occurred."

These are transient errors that can often be resolved by retrying the request after a short delay.

## Solution Architecture

### 1. Retry Utility (`src/lib/retry.ts`)

A reusable retry utility with exponential backoff strategy:

**Key Features:**

- **Exponential Backoff**: Delay increases exponentially with each retry attempt
- **Jitter**: Random variation (±25%) to prevent thundering herd problem
- **Configurable**: Customizable retry count, delays, and status codes
- **Smart Detection**: Automatically identifies retryable errors by status code and message
- **Logging Support**: Optional callback for retry notifications

**Default Configuration:**

```typescript
{
  maxRetries: 3,
  initialDelayMs: 1000,      // Start with 1 second
  maxDelayMs: 30000,         // Cap at 30 seconds
  backoffMultiplier: 2,      // Double delay each time
  retryableStatusCodes: [408, 429, 500, 502, 503, 504]
}
```

**Retry Timeline Example:**

- Attempt 1: Immediate
- Attempt 2: ~1000ms delay (1s with jitter)
- Attempt 3: ~2000ms delay (2s with jitter)
- Attempt 4: ~4000ms delay (4s with jitter)

**Jitter Explanation:**
Jitter adds random variation to prevent all clients from retrying simultaneously, which could cause another overload. Each delay is randomized between 75% and 125% of the calculated exponential delay.

### 2. API Integration

All three API endpoints now use retry logic:

#### `src/app/api/generate-prd/route.ts`

- Wraps `generateContentStream` with `withApiRetry`
- Handles streaming PRD generation with resilience
- Provides specific error messages for 503 overload scenarios

#### `src/app/api/refine-section/route.ts`

- Wraps `generateContent` with `withApiRetry`
- Protects section refinement operations
- Maintains same error handling patterns

#### `src/app/api/generate-inputs/route.ts`

- Wraps `generateContent` with `withApiRetry`
- Ensures input generation reliability
- Consistent error messaging across APIs

### 3. Enhanced Error Handling

All APIs now provide specific, user-friendly error messages:

| Status Code | Error Message                                                                                                                                  | Description                                       |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 503         | "The AI model is currently overloaded. We attempted multiple retries but the service is still unavailable. Please try again in a few moments." | Service temporarily unavailable after all retries |
| 500         | Handled by retry logic                                                                                                                         | Internal server errors are retried automatically  |
| 429         | "API rate limit exceeded. Please wait a moment and try again."                                                                                 | Rate limiting                                     |
| 404         | "The configured Gemini model is unavailable. Update GEMINI_MODEL or choose a supported model."                                                 | Model not found                                   |

## Technical Details

### Retry Logic Flow

```
┌─────────────────┐
│  API Call       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Try Execute    │
└────────┬────────┘
         │
         ├──Success──→ Return Result
         │
         ├──Error
         │
         ▼
┌─────────────────┐
│ Is Retryable?   │
└────────┬────────┘
         │
         ├──No──→ Throw Error Immediately
         │
         ├──Yes
         │
         ▼
┌─────────────────┐
│ Retries Left?   │
└────────┬────────┘
         │
         ├──No──→ Throw Last Error
         │
         ├──Yes
         │
         ▼
┌─────────────────┐
│ Calculate Delay │
│ (Exponential +  │
│     Jitter)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Sleep(delay)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Log Retry      │
└────────┬────────┘
         │
         └──→ Loop back to "Try Execute"
```

### Retryable Error Detection

An error is considered retryable if:

1. **Status Code Match**: The error's status/code is in the retryable list (408, 429, 500, 502, 503, 504)
2. **Message Pattern**: The error message contains keywords:
   - "overloaded"
   - "unavailable"
   - "timeout"
   - "temporary"
   - "try again"

This dual approach ensures we catch both structured API errors and message-based transient failures.

### Exponential Backoff Calculation

```typescript
exponentialDelay = initialDelay × (multiplier ^ attemptNumber)
cappedDelay = min(exponentialDelay, maxDelay)
jitter = cappedDelay × (0.75 + random(0, 0.5))
finalDelay = floor(jitter)
```

**Example with defaults:**

- Attempt 0: 1000 × 2^0 = 1000ms → 750-1250ms jitter
- Attempt 1: 1000 × 2^1 = 2000ms → 1500-2500ms jitter
- Attempt 2: 1000 × 2^2 = 4000ms → 3000-5000ms jitter
- Attempt 3: 1000 × 2^3 = 8000ms → 6000-10000ms jitter (capped at 10000ms for API calls)

## Benefits

1. **Resilience**: Automatically handles transient failures without user intervention
2. **User Experience**: Most temporary issues resolve without user awareness
3. **Load Distribution**: Jitter prevents synchronized retry storms
4. **Transparency**: Retry attempts are logged for debugging
5. **Configurability**: Easy to adjust retry behavior per use case
6. **Reusability**: Single utility function used across all APIs

## Testing

### Manual Testing

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Test each feature:
   - Generate inputs from an idea
   - Generate a PRD
   - Refine a section

### Monitoring Retries

Watch the server console for retry logs:

```
[Retry] Gemini PRD generation failed (attempt 1). Retrying in 1234ms... Error: Service Unavailable
[Retry] Gemini PRD generation failed (attempt 2). Retrying in 2567ms... Error: Service Unavailable
```

### Simulating Failures (Development)

To test retry behavior, you can temporarily modify the retry configuration in specific routes:

```typescript
const response = await withRetry(
  async () => {
    /* ... */
  },
  {
    maxRetries: 5, // Increase retries
    initialDelayMs: 500, // Shorter initial delay
    onRetry: (attempt, error, delay) => {
      console.log(`Test: Retry ${attempt} after ${delay}ms`);
    }
  }
);
```

## Future Enhancements

1. **Circuit Breaker Pattern**: Temporarily stop requests if failure rate is too high
2. **Request Queuing**: Queue requests during high load periods
3. **Fallback Models**: Automatically switch to alternative AI models if primary fails
4. **User Notifications**: Show retry progress in the UI
5. **Metrics Collection**: Track retry rates and success rates for monitoring
6. **Adaptive Retry**: Adjust retry strategy based on error patterns

## Configuration

### Environment Variables

```env
# Gemini API Configuration
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash  # or gemini-pro, etc.
```

### Customizing Retry Behavior

Edit `src/lib/retry.ts` to adjust default retry parameters:

```typescript
const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 3, // Number of retry attempts
  initialDelayMs: 1000, // Starting delay
  maxDelayMs: 30000, // Maximum delay
  backoffMultiplier: 2, // Exponential growth factor
  retryableStatusCodes: [
    // Which HTTP codes to retry
    408, 429, 500, 502, 503, 504
  ]
};
```

## Troubleshooting

### Issue: "Still getting 503 errors after retries"

**Solution**: The service might be experiencing prolonged outage. The retry mechanism has exhausted all attempts. Wait a few minutes and try again.

### Issue: "Retries taking too long"

**Solution**: Reduce `maxRetries` or `maxDelayMs` in the retry configuration for faster failures.

### Issue: "Not seeing retry logs"

**Solution**: Check that console.warn is not filtered in your terminal/console settings.

### Issue: "Getting rate limited (429) frequently"

**Solution**: The retry mechanism will handle this, but you may need to increase delays or reduce concurrent requests.

## Performance Impact

- **Typical Success Case**: No overhead (single attempt succeeds)
- **Transient Failure**: Additional latency of 1-10 seconds (depending on retry count)
- **Persistent Failure**: ~15 seconds total before giving up (3 retries with exponential backoff)
- **Memory**: Negligible (single promise chain, no queuing)

## Security Considerations

- API keys are never logged in retry operations
- Error messages sanitized to avoid exposing sensitive information
- Retry logic cannot be exploited for DoS (fixed retry count with exponential backoff)

## Conclusion

This retry mechanism significantly improves the reliability of the PRD Creator application by gracefully handling transient API failures. The implementation follows industry best practices with exponential backoff, jitter, and comprehensive error handling.

The system is production-ready and requires no additional configuration for typical use cases. All APIs are now resilient to temporary service disruptions from the Gemini API.
