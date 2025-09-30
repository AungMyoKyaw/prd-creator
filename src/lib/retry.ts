/**
 * Retry utility with exponential backoff for handling transient API failures
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

export interface RetryableError extends Error {
  status?: number;
  code?: number;
}

const DEFAULT_RETRYABLE_STATUS_CODES = [
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504 // Gateway Timeout
];

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableStatusCodes: DEFAULT_RETRYABLE_STATUS_CODES
};

/**
 * Sleep for a specified number of milliseconds
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate delay with exponential backoff and jitter
 */
const calculateDelay = (
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number
): number => {
  const exponentialDelay = initialDelay * Math.pow(multiplier, attempt);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  // Add jitter (random variation of ±25%) to prevent thundering herd
  const jitter = cappedDelay * (0.75 + Math.random() * 0.5);

  return Math.floor(jitter);
};

/**
 * Check if an error is retryable based on status code
 */
const isRetryableError = (
  error: unknown,
  retryableStatusCodes: number[]
): boolean => {
  if (!error) return false;

  const err = error as RetryableError;
  const statusCode = err.status ?? err.code;

  if (typeof statusCode === 'number') {
    return retryableStatusCodes.includes(statusCode);
  }

  // Check error message for common transient error patterns
  const message = err.message?.toLowerCase() || '';
  return (
    message.includes('overloaded') ||
    message.includes('unavailable') ||
    message.includes('timeout') ||
    message.includes('temporary') ||
    message.includes('try again')
  );
};

/**
 * Execute a function with retry logic and exponential backoff
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function execution
 * @throws The last error if all retries are exhausted
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   async () => await apiCall(),
 *   {
 *     maxRetries: 3,
 *     initialDelayMs: 1000,
 *     onRetry: (attempt, error, delay) => {
 *       console.log(`Retry attempt ${attempt} after ${delay}ms: ${error.message}`);
 *     }
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry if this is the last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error, config.retryableStatusCodes)) {
        throw error; // Non-retryable error, throw immediately
      }

      // Calculate delay for this attempt
      const delayMs = calculateDelay(
        attempt,
        config.initialDelayMs,
        config.maxDelayMs,
        config.backoffMultiplier
      );

      // Call retry callback if provided
      if (options.onRetry) {
        options.onRetry(attempt + 1, lastError, delayMs);
      }

      // Wait before retrying
      await sleep(delayMs);
    }
  }

  // All retries exhausted, throw the last error
  throw lastError!;
}

/**
 * Wrapper for withRetry that provides default retry behavior with logging
 * Useful for API calls in Next.js API routes
 */
export async function withApiRetry<T>(
  fn: () => Promise<T>,
  operationName: string = 'API call'
): Promise<T> {
  return withRetry(fn, {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    onRetry: (attempt, error, delayMs) => {
      console.warn(
        `[Retry] ${operationName} failed (attempt ${attempt}). ` +
          `Retrying in ${delayMs}ms... Error: ${error.message}`
      );
    }
  });
}
