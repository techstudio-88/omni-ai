# Architecture

```mermaid
flowchart LR
  U[User] --> UI[Next.js workspace]
  UI --> API[Validated API routes]
  API --> A[Request analyser]
  A --> R[Intent router]
  R --> M[Model selector]
  R --> D[Document and memory retrieval]
  M --> P[Gemini adapter pool]
  P --> E[Response and citation checks]
  E --> S[Streamed response]
  API --> DB[(Supabase Postgres with RLS)]
  DB --> V[(pgvector document chunks)]
  DB --> F[(Private Supabase Storage)]
  API --> RL[Upstash rate limiter, optional]
```

The server owns provider credentials, model selection, usage accounting, document retrieval, and tool permissions. The client receives response text, citations, and safe progress metadata only. User memory is opt-in. Demo mode uses labelled sample data and bypasses live model and database operations by design.

## Brain pipeline

`validate -> analyse intent/language/complexity -> retrieve consented memory and permitted document chunks -> choose workflow/model -> execute allowlisted tools -> generate -> evaluate/citation-check -> stream -> record usage`

No hidden reasoning is stored or displayed. Evaluation checks response shape and citation references; it does not claim to prove factual correctness.
