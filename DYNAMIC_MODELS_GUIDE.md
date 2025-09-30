# 🔄 Dynamic Model Selection - Implementation Guide

## Overview

The AI PRD Creator now fetches available Gemini models dynamically from Google's API, ensuring you always have access to the latest models!

---

## ✨ Features

### 1. **Real-Time Model Discovery**
- Fetches models directly from Google API
- Always up-to-date with latest releases
- No manual updates needed

### 2. **Smart Model Loading**
- Auto-fetches when API key is entered
- Debounced API calls (1-second delay)
- Shows loading indicator
- Fallback to static list if API fails

### 3. **Enhanced Model Information**
- Model name and display name
- Description
- Input/Output token limits
- Supported generation methods

### 4. **Intelligent Sorting**
- Experimental models first (2.0-exp)
- Latest versions prioritized
- Pro models before Flash
- Stable models at the end

---

## 🛠️ Implementation Details

### API Endpoint: `/api/models`

**Request:**
```json
POST /api/models
{
  "apiKey": "your-google-api-key"
}
```

**Response:**
```json
{
  "models": [
    {
      "value": "gemini-2.0-flash-exp",
      "label": "Gemini 2.0 Flash (Experimental)",
      "description": "Latest experimental model with cutting-edge capabilities.",
      "displayName": "Gemini 2.0 Flash Experimental",
      "inputTokenLimit": 1000000,
      "outputTokenLimit": 8192,
      "supportedGenerationMethods": ["generateContent"]
    },
    ...
  ]
}
```

### Model Filtering

Only models that support text generation are included:
- Must have `generateContent` in `supportedGenerationMethods`
- Or contain "gemini" in the name
- Excludes embedding models and other non-generative models

### Priority Sorting

```typescript
Priority Order:
0 - Gemini 2.0 Experimental (2.0 + exp)
1 - Gemini 2.0 Stable
2 - Gemini 1.5 Latest (1.5 + latest)
3 - Gemini 1.5 Pro
4 - Gemini 1.5 Flash
5 - Other models
```

---

## 📱 User Experience

### When Opening Settings:
1. User opens settings modal
2. Enters or pastes API key
3. After 1-second delay, models are fetched automatically
4. Loading indicator appears
5. Dropdown updates with latest models
6. Token limits displayed below selection

### Error Handling:
- **Invalid API Key**: Shows error, falls back to static list
- **Network Error**: Shows warning, uses cached/static models
- **Empty Response**: Uses default model list

### Visual Indicators:
- 🔄 **Loading**: Spinning icon + "Fetching models..."
- ✓ **Success**: Green check + "X models loaded"
- ⚠️ **Warning**: Yellow banner with fallback message

---

## 🎯 Benefits

### For Users:
- ✅ Always see latest available models
- ✅ Access new experimental models immediately
- ✅ See token limits for each model
- ✅ Better informed model selection

### For Developers:
- ✅ No manual model list maintenance
- ✅ Automatic updates as Google releases models
- ✅ Reduced technical debt
- ✅ Better user experience

---

## 🔧 Technical Architecture

### Files Created/Modified:

1. **`src/app/api/models/route.ts`** (NEW)
   - Fetches models from Google API
   - Filters and formats model data
   - Sorts by priority
   - Returns JSON response

2. **`src/components/settings-modal.tsx`** (MODIFIED)
   - Added model fetching logic
   - Loading states
   - Error handling
   - Debounced API calls

3. **`src/lib/models.ts`** (EXISTING)
   - Static fallback list
   - Used when API fails
   - Default model selection

---

## 💡 Usage Example

```typescript
// Automatic fetching when API key changes
const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newKey = e.target.value;
  setApiKey(newKey);
  
  // Auto-fetch models after 1 second
  if (newKey.trim().length > 20) {
    setTimeout(() => {
      fetchModels(newKey);
    }, 1000);
  }
};

// Fetch models function
const fetchModels = async (key: string) => {
  setLoadingModels(true);
  
  const response = await fetch('/api/models', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: key }),
  });
  
  const data = await response.json();
  setModels(data.models);
  setLoadingModels(false);
};
```

---

## 🎨 UI Components

### Loading State:
```tsx
{loadingModels && (
  <span className="text-xs text-indigo-400 flex items-center">
    <SpinnerIcon />
    Fetching models...
  </span>
)}
```

### Success State:
```tsx
{models.length > GEMINI_MODELS.length && (
  <span className="text-xs text-green-400">
    ✓ {models.length} models loaded
  </span>
)}
```

### Error State:
```tsx
{modelsError && (
  <div className="text-xs text-yellow-400 bg-yellow-900/20">
    {modelsError}
  </div>
)}
```

---

## 🔍 Model Information Display

### Dropdown Option:
- Shows formatted model name
- Example: "Gemini 2.0 Flash (Experimental)"

### Below Dropdown:
- **Description**: Model capabilities
- **Token Limit**: Input token limit (if available)
- Example: "Input limit: 1,000,000 tokens"

---

## 🚀 API Details

### Google API Endpoint:
```
https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}
```

### Response Format:
```json
{
  "models": [
    {
      "name": "models/gemini-2.0-flash-exp",
      "displayName": "Gemini 2.0 Flash Experimental",
      "description": "...",
      "inputTokenLimit": 1000000,
      "outputTokenLimit": 8192,
      "supportedGenerationMethods": ["generateContent"]
    }
  ]
}
```

---

## 🛡️ Error Handling

### Scenarios:

1. **Invalid API Key**
   - Error: "Failed to fetch models"
   - Action: Show warning, use static list
   - UX: Yellow banner with message

2. **Network Timeout**
   - Error: "Request timeout"
   - Action: Use cached/static models
   - UX: Warning banner

3. **Empty Model List**
   - Error: "No models available"
   - Action: Use default GEMINI_MODELS
   - UX: Fallback message

4. **Rate Limiting**
   - Error: "Rate limit exceeded"
   - Action: Use cached list
   - UX: Info message to wait

---

## 📊 Model Name Formatting

### Special Cases:
```typescript
"gemini-2.0-flash-exp" → "Gemini 2.0 Flash (Experimental)"
"gemini-1.5-pro-latest" → "Gemini 1.5 Pro (Latest)"
"gemini-exp-1206" → "Gemini Experimental 1206"
```

### Default Formatting:
```typescript
"gemini-1-5-flash" → "Gemini 1 5 Flash"
// Splits by hyphen, capitalizes each word
```

---

## 🎯 Best Practices

### For Users:
1. Enter valid API key
2. Wait for models to load
3. Select appropriate model for your use case
4. Check token limits before generating

### For Developers:
1. Always provide fallback models
2. Show loading states
3. Handle errors gracefully
4. Cache successful responses
5. Debounce API calls

---

## 🔄 Caching Strategy

### Current:
- Fetches on every settings modal open
- Debounced by 1 second
- Falls back to static list

### Future Enhancement Ideas:
- Cache models in localStorage
- TTL of 24 hours
- Refresh button
- Background sync

---

## 📱 Mobile Considerations

### Responsive Design:
- Full-width dropdown on mobile
- Touch-friendly select
- Clear loading indicators
- Easy-to-read token limits

### Performance:
- Debounced API calls
- Minimal re-renders
- Efficient state management

---

## 🎉 Summary

**What You Get:**
✅ Real-time model discovery
✅ Always latest models
✅ Token limit information
✅ Smart sorting and filtering
✅ Graceful error handling
✅ Loading indicators
✅ Fallback to static list
✅ No maintenance required

**API Endpoint:**
- `POST /api/models`
- Requires: `apiKey`
- Returns: Array of formatted models

**User Flow:**
1. Open settings
2. Enter API key
3. Models fetch automatically
4. Select from latest list
5. See token limits
6. Save and use!

---

## 🔗 Related Files

- `/api/models/route.ts` - API endpoint
- `src/components/settings-modal.tsx` - UI component
- `src/lib/models.ts` - Static fallback
- `DYNAMIC_MODELS_GUIDE.md` - This file

---

**Your model selection is now always up-to-date! 🚀✨**
