import { z } from "zod";

export const modeSchema = z.enum(["chat", "research", "compare", "documents", "coding", "writing"]);
export const attachmentSchema = z.object({ id: z.string().uuid().or(z.literal("demo-sample")), name: z.string().max(160), mimeType: z.string().max(100).optional() });
export const brainRequestSchema = z.object({
  message: z.string().trim().min(1).max(12_000),
  attachments: z.array(attachmentSchema).max(20).default([]),
  selectedModel: z.string().max(100).default("auto"),
  selectedMode: modeSchema.default("chat"),
  webSearchEnabled: z.boolean().default(false),
  memoryEnabled: z.boolean().default(false),
  projectId: z.string().uuid().optional(),
});
export const idSchema = z.string().uuid();
