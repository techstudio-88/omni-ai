# OmniBrain

OmniBrain is a personal AI workspace that routes requests through an inspectable workflow. It starts with a Gemini provider adapter and an honest demo mode; provider credentials stay on the server and are never stored in chat history.

## Project location

`D:\Personal Projects One\chatgpt usage\projects\omni ai`

## Local setup

1. Install Node.js 20.9+ and pnpm.
2. Copy `.env.example` to `.env.local`.
3. Keep `DEMO_MODE=true` to use labelled sample data without model calls. For authenticated mode, configure Supabase URL/publishable key and set `DEMO_MODE=false`.
4. Add only newly rotated Gemini keys to `GEMINI_API_KEYS` in `.env.local`; comma-separate values. Never commit `.env.local`.
5. Run `pnpm install`, `pnpm dev`, and open `http://localhost:3000`.

## Implementation plan

1. Responsive landing/workspace shell, demo chat, and Git checkpoint.
2. Gemini adapter pool, request analysis, workflow routing, streaming, fallback, and safe tools.
3. Supabase Auth, PostgreSQL schema/RLS, private document storage, and user-controlled memory.
4. Research, model comparison, assistants/prompts, usage limits, and admin surfaces.
5. Unit/browser tests, docs, production build, preview deployment.

## Integration boundaries

- Demo mode is sample data and does not call a model or write user data.
- Gemini is the first live provider. Other provider cards remain unavailable until their adapters and credentials are configured.
- Supabase Auth and private storage require the included migration and project environment values.
- Research uses Google Search grounding when Gemini credentials are configured.
- Billing, Sentry, PostHog, and external side-effect tools are not live integrations in this first release; label them clearly.

See `docs/architecture.md`, `docs/security.md`, `docs/api.md`, and `docs/troubleshooting.md`.
