# Security notes

- Keep model keys in ignored `.env.local` or Vercel Secret variables. Never use `NEXT_PUBLIC_` for provider keys.
- Rotate any provider keys pasted into chat before adding them to the environment.
- Supabase uses only the publishable client key in the browser; table and Storage access are restricted by RLS.
- Uploaded documents use private storage, size/type validation, per-user paths, and prompt-injection isolation. A malware scanner is not included.
- External actions are not executed. Tools that could send, delete, pay, publish, or mutate data remain disabled until a real integration exists.
- Code execution is disabled because no isolated execution sandbox is configured.
- Production rate limiting requires Upstash credentials. Without them, production AI routes fail closed; local demo mode is clearly marked.
- The admin role is stored in the database and cannot be self-edited through the client.
