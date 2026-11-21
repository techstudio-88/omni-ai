# API overview

All private routes require an authenticated Supabase session, validate input, apply rate limits, and return sanitized errors. Demo routes return clearly labelled sample data.

| Route | Method | Purpose |
| --- | --- | --- |
| /api/brain/analyse | POST | Classify a request without calling a provider |
| /api/brain/plan | POST | Return a workflow, model selection, and tool plan |
| /api/brain/run | POST | Run a structured, non-streaming brain request |
| /api/brain/stream | POST | Stream a chat response and store the conversation |
| /api/brain/compare | POST | Run the same prompt across available Gemini models |
| /api/brain/research | POST | Research through Gemini Search grounding |
| /api/models | GET | List available model capabilities |
| /api/providers | GET | Report provider readiness without exposing credentials |
| /api/conversations | GET/POST | List or create conversations |
| /api/conversations/[id] | GET/DELETE | Read or soft-delete an owned conversation |
| /api/documents | GET | List owned documents |
| /api/documents/upload | POST | Validate, privately store, extract, chunk, and optionally embed a document |
| /api/documents/query | POST | Search permitted document chunks |
| /api/documents/[id] | DELETE | Remove an owned document and its private object |
| /api/memories | GET/POST | List or explicitly save user memories |
| /api/memories/[id] | PATCH/DELETE | Update, disable, or delete a memory |
| /api/projects | GET/POST | List or create projects |
| /api/assistants | GET/POST | List or create custom assistants |
| /api/assistants/[id] | PATCH/DELETE | Update or delete an assistant |
| /api/prompts | GET/POST | List starter and user prompts or create a prompt |
| /api/prompts/[id] | DELETE | Delete an owned prompt |
| /api/feedback | POST | Save a rating and optional comment |
| /api/tools/confirm | POST | Record explicit confirmation; no external action is executed |
| /api/usage | GET | Read message and private storage usage |
| /api/admin/overview | GET | Verify access for an allow-listed administrator |
| /api/auth/signout | POST | End the current Supabase session |

The non-streaming brain response includes selected provider/model, workflow, citations, usage, warnings, and execution status. Streamed chat uses the AI SDK UI message protocol and never sends private model reasoning to the browser.
