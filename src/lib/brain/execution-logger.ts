export interface SafeExecutionLog { requestId: string; userId: string; provider: string; model: string; workflow: string; durationMs: number; status: string; }
export function logExecution(event: SafeExecutionLog): void {
  // Deliberately excludes prompts, response text, file names, and credentials.
  console.info(JSON.stringify({ scope: "omnibrain.execution", ...event }));
}
