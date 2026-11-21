# OmniBrain

OmniBrain is a personal AI workspace for chat, research, documents, and reusable project context. The first live model adapter is Gemini. A clearly labelled demo works without provider credentials.

## Project location

D:\Personal Projects One\chatgpt usage\projects\omni ai

## Run the demo

1. Install Node.js 20.9 or newer and pnpm.
2. Open a terminal in the project folder and run pnpm install.
3. Keep DEMO_MODE=true in .env.local.
4. Run pnpm dev and open http://localhost:3000.

The demo uses sample workspace, document, memory, prompt, and conversation data. It does not call a model or save user data. Its sample responses are labelled.

## Enable authenticated Gemini use

1. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.
2. Set DEMO_MODE=false.
3. Add newly rotated Gemini keys to GEMINI_API_KEYS in .env.local, separated by commas. Never add provider keys to a NEXT_PUBLIC_ variable or commit them.
4. In Supabase Auth, enable email sign-in and allow the app URL with the /auth/callback path.
5. Production requests use a Supabase-backed shared rate limiter. Upstash Redis can be added as an optional faster rate-limit backend.

The OmniBrain schema and security hardening migrations have already been applied to the linked Supabase project. The private documents bucket and pgvector-backed chunk table are included. The local migration files are the source of truth for future changes.

## What is implemented

- Responsive landing page, sign-in screen, authenticated workspace shell, conversation history, and streamed chat.
- Request analysis, workflow planning, model selection, Gemini Search grounding, citation checks, deterministic calculator, provider key rotation, and demo responses.
- Supabase Auth helpers, a default workspace, private document storage with signed direct-to-storage uploads (up to 50 MB per file on the current bucket), multi-file chat attachments, PDF/DOCX/text/Markdown/CSV extraction, chunking, optional Gemini embeddings, semantic retrieval, and lexical fallback. Uploaded images are passed to Gemini Vision in chat.
- User-controlled memory, projects, assistants, reusable prompts, feedback, usage tracking, and daily free-message limits.
- Row-level security on workspace and user tables. Supabase's security advisor reported no security findings after the hardening migration.
- Unit and browser tests, generated Supabase TypeScript types, API/security/architecture notes, and deployment guidance.

## Integration boundaries

- Gemini is the only live model provider. Other provider entries are marked as not connected.
- Billing, subscriptions, Sentry, PostHog, shared conversation links, code execution, and external side-effect tools are not connected.
- Admin access uses the server-only OMNIBRAIN_ADMIN_USER_IDS allowlist. Global admin reporting is not enabled because this app does not use a Supabase service-role key.
- Document text extraction and retrieval are implemented. Image attachments can be analyzed by Gemini Vision in chat; OCR indexing and malware scanning are not connected.
- In demo mode, workspace changes are temporary examples. Authenticated project, prompt, assistant, memory, and document records use Supabase.

## Checks

Run pnpm typecheck, pnpm lint, pnpm test, pnpm test:e2e, and pnpm build from this folder.

See docs/architecture.md, docs/security.md, docs/api.md, docs/deployment.md, and docs/troubleshooting.md.
