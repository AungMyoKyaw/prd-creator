/**
 * Get current date and time in a readable format for LLM context
 * @returns Formatted string with current date and time
 */
export function getCurrentDateTime(): string {
  const now = new Date();
  
  // Format: "Tuesday, January 21, 2025 at 3:45 PM PST"
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  };
  
  return now.toLocaleString('en-US', options);
}

/**
 * Get ISO 8601 formatted date and time
 * @returns ISO formatted date string
 */
export function getISODateTime(): string {
  return new Date().toISOString();
}

/**
 * Create a context header with current date/time for LLM prompts
 * @returns Formatted context string
 */
export function getContextHeader(): string {
  return `[Current Date & Time: ${getCurrentDateTime()}]\n\n`;
}
