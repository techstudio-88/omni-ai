export const config = {
  demoMode: process.env.DEMO_MODE === "true",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  geminiKeys: getGeminiKeys(),
  fastModel: process.env.GEMINI_MODEL_FAST ?? "gemini-3.5-flash-lite",
  reasoningModel: process.env.GEMINI_MODEL_REASONING ?? "gemini-3.1-pro-preview",
  visionModel: process.env.GEMINI_MODEL_VISION ?? "gemini-3.1-pro-preview",
  redisUrl: process.env.UPSTASH_REDIS_REST_URL,
  redisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
} as const;

function getGeminiKeys(): string[] {
  const collected = [
    ...(process.env.GEMINI_API_KEYS ?? "").split(/[\n,;]/),
    ...Array.from({ length: 10 }, (_, index) => process.env[`GEMINI_API_KEY_${index + 1}`] ?? ""),
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
  ];
  return [...new Set(collected.map((key) => key.trim()).filter(Boolean))];
}

export function hasSupabaseConfig(): boolean {
  return Boolean(config.supabaseUrl && config.supabasePublishableKey);
}

export function hasGeminiConfig(): boolean {
  return config.geminiKeys.length > 0;
}
