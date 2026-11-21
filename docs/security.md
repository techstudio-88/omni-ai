# Security notes

- Keep model keys in ignored `.env.local` or Vercel Secret variables. Never use `NEXT_PUBLIC_` for provider keys.
- Rotate any provider keys pasted into chat before adding them to the environment.
- Supabase uses only the publishable client key in the browser; table and Storage access are restricted by RLS.
- Uploaded documents use private storage, size/type validation, per-user paths, and prompt-injection isolation. A malware scanner is not included.
- External actions are not executed. Tools that could send, delete, pay, publish, or mutate data remain disabled until a real integration exists.
- Code execution is disabled because no isolated execution sandbox is configured.
- Production rate limiting requires Upstash credentials. Without them, production AI routes fail closed; local demo mode is clearly marked.
- Admin access is restricted to user IDs in the server-only OMNIBRAIN_ADMIN_USER_IDS environment variable. The client cannot change this allowlist.
- Supabase row-level security is enabled for all exposed application tables, including usage events and shared-link records. Membership helper functions live in a non-exposed schema.
- Production AI endpoints fail closed when shared Upstash rate limiting is not configured.
