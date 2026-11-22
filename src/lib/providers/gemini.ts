import { createGoogle, google as defaultGoogle } from "@ai-sdk/google";
import { config, hasGeminiConfig } from "../config";

let keyCursor = 0;
export function getGeminiProvider() {
  return createGoogle({ apiKey: () => {
    const keys = config.geminiKeys;
    if (!keys.length) throw new Error("Gemini provider is not configured.");
    const key = keys[keyCursor % keys.length];
    keyCursor = (keyCursor + 1) % keys.length;
    return key;
  } });
}
export function getGeminiSearchTools() {
  return { google_search: defaultGoogle.tools.googleSearch({}), url_context: defaultGoogle.tools.urlContext({}) };
}
export function getProviderReadiness() {
  return { id: "dist", name: "Dist Engine", status: hasGeminiConfig() ? "connected" : "not_configured", configuredKeyCount: config.geminiKeys.length, models: ["Dist Flash", "Dist Pro", "Dist Flash Lite"] };
}
