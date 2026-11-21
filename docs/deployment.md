# Deployment

## Vercel preview or production

1. Link the repository or upload this project to the existing OmniBrain Vercel project.
2. Set the production Node.js runtime to a version supported by Next.js 16 (Node.js 20.9 or newer).
3. Add environment variables through Vercel's encrypted environment settings:
   - DEMO_MODE=true for a safe preview, or false after Auth is configured.
   - NEXT_PUBLIC_APP_URL with the deployed origin.
   - NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
   - GEMINI_API_KEYS as a server-only secret containing newly rotated keys.
   - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for shared production rate limits.
   - OMNIBRAIN_ADMIN_USER_IDS only if an operator needs the restricted admin status page.
4. Add the deployed /auth/callback URL to Supabase's allowed Auth redirect URLs.
5. Deploy a preview and verify its build output before promoting it.

Do not put Gemini credentials in client-visible variables. The application does not need a Supabase service-role key. Without Upstash, authenticated production AI routes fail closed.

## Local production build

Run pnpm install, pnpm typecheck, pnpm lint, pnpm test, pnpm test:e2e, and pnpm build. Use DEMO_MODE=true unless you have configured Supabase Auth and new Gemini credentials.

The Supabase schema is versioned under supabase/migrations. Apply later migrations through the Supabase CLI or the connected Supabase project workflow, then regenerate src/lib/supabase/database.types.ts.
