# API overview

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/brain/analyse` | POST | Deterministic request classification |
| `/api/brain/plan` | POST | Safe execution plan |
| `/api/brain/run` | POST | Structured brain result |
| `/api/brain/stream` | POST | Stream a chat response |
| `/api/brain/compare` | POST | Compare selected configured models |
| `/api/brain/research` | POST | Research with Google Search grounding when configured |
| `/api/models` | GET | Model capabilities |
| `/api/providers` | GET | Provider readiness without credentials |
| `/api/usage` | GET | Usage and plan state |
| `/api/documents/upload` | POST | Validate, extract, embed, and store a document |
| `/api/documents/query` | POST | Search permitted document chunks |
| `/api/documents/[id]` | DELETE | Delete a user's document and stored file |
| `/api/memories` | GET/POST | List or explicitly save user memories |
| `/api/memories/[id]` | PATCH/DELETE | Edit or delete a memory |
| `/api/feedback` | POST | Record response feedback |
| `/api/tools/confirm` | POST | Validate confirmation for allowlisted actions |
| `/api/assistants` | GET/POST | List or create assistants |
| `/api/assistants/[id]` | PATCH/DELETE | Edit or delete an assistant |

All request bodies are validated with Zod. Live requests require a Supabase-authenticated user; demo mode uses isolated sample data. Provider errors are sanitized before returning to the client.
