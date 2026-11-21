export function isRetryableProviderError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /429|rate.?limit|503|502|504|temporar|unavailable|timeout/i.test(message);
}
export function safeProviderError(): string {
  return "The selected model is unavailable right now. Check its provider configuration or retry shortly.";
}
