# Troubleshooting

- **Chat shows demo replies:** expected while `DEMO_MODE=true` or no Gemini keys are configured.
- **Gemini unavailable:** add a newly rotated key to `GEMINI_API_KEYS`; restart the local server. The UI only shows connected/not connected and never reveals key values.
- **Login link does not arrive:** configure the Supabase Auth site URL, redirect URL, and production SMTP settings in Supabase.
- **Document upload is disabled:** configure Supabase, apply the migration, and authenticate.
- **Rate limit configuration error in production:** set Upstash REST URL and token as secret environment variables.
- **Deployment is protected:** the existing Vercel project has SSO protection enabled; use authenticated preview access.
