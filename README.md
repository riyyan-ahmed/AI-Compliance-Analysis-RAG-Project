# Compliance Document Analyzer

A full-stack AI application for analyzing workplace health and safety compliance documents. Upload PDFs, get instant AI-generated summaries, ask questions in plain English, and run side-by-side gap analyses between company procedures and regulatory standards.

---

## What it does

- **PDF upload** — drag-and-drop with real-time progress tracking
- **AI summarization** — Claude reads each document and produces a plain-English summary plus 6–8 concrete key obligations
- **Semantic Q&A** — ask questions about a document; answers are grounded in the most relevant sections (retrieved via ChromaDB vector search, not the full text)
- **GPT-style chat threads** — each document has its own chat history with named threads, persisted in localStorage; threads are named automatically from your first question
- **Streaming responses** — answers stream word-by-word in real time via Server-Sent Events; markdown formatting (headers, bullet lists, code blocks) renders correctly
- **Gap analysis** — compare any two documents and get a structured compliance report: overall score (0–100), severity-rated gaps (Critical / Major / Minor), strengths, and priority recommendations
- **Gap analysis caching** — results are stored in SQLite so re-running the same comparison is instant, no extra API cost
- **Per-user document library** — each user sees only their own uploads, isolated at the database level
- **Landing page** — public-facing marketing page before login
- **Session-based auth** — Bearer token sessions stored in SQLite; credentials configured via environment variable

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Material UI v5, Vite |
| Backend | Node.js, Express, TypeScript |
| AI | Anthropic Claude (`claude-sonnet-4-6`) with prompt caching |
| Vector search | ChromaDB — local semantic search using `all-MiniLM-L6-v2` embeddings |
| PDF parsing | `pdf-parse` |
| Database | SQLite via `better-sqlite3` (WAL mode) |
| Markdown | `react-markdown` + `remark-gfm` |

---

## Project Structure

```
compliance-analyzer/
├── backend/
│   ├── src/
│   │   ├── controllers/    # HTTP handlers (auth, documents, analysis)
│   │   ├── services/       # Business logic (Claude, RAG, ChromaDB, analysis)
│   │   ├── middleware/     # Auth token validation, multer file upload
│   │   ├── routes/         # Express route definitions
│   │   ├── store/          # SQLiteStore — users, sessions, documents, gap cache
│   │   └── types/          # Shared TypeScript interfaces
│   └── tests/              # Jest unit tests with mocked dependencies
├── frontend/
│   └── src/
│       ├── components/     # ChatBox, ChatSidebar, DocumentCard, GapAnalysisPanel...
│       ├── pages/          # Landing, Login, Dashboard, DocumentPage
│       ├── context/        # AuthContext — user state shared across the app
│       ├── hooks/          # useStreamingChat (SSE), useChatThreads (localStorage)
│       ├── services/       # Axios API client
│       └── types/          # TypeScript types mirroring backend responses
└── chroma-data/            # ChromaDB vector store (gitignored, created at runtime)
```

---

## How the RAG pipeline works

1. User uploads a PDF
2. `ParserService` extracts plain text using `pdf-parse`
3. `RagService` splits the text into overlapping chunks — **600 characters each, 100-character overlap**
4. `AnalysisService` runs Claude summarization and ChromaDB indexing in parallel
5. ChromaDB embeds chunks locally using `all-MiniLM-L6-v2` (no external embedding API)
6. On each Q&A question, ChromaDB retrieves the **top 4 most semantically relevant chunks** via cosine similarity
7. Those chunks (not the full document) are passed to Claude as context

This keeps Claude's input small and answers grounded in what the document actually says.

---

## Prerequisites

- Node.js 18+
- Python 3.8+ with pip

---

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd compliance-analyzer
```

### 2. Install ChromaDB and start the server

ChromaDB handles vector embeddings and similarity search. It needs to be running before you start the backend.

```bash
pip install chromadb
chroma run --path ./chroma-data --host localhost --port 8000
```

Keep this terminal open. Vector data is stored in `./chroma-data/` (gitignored).

### 3. Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=3001
CLAUDE_API_KEY=your_claude_api_key_here
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=20
NODE_ENV=development
DB_PATH=./data/compliance.db
CHROMA_URL=http://localhost:8000
MOCK_USERS=admin:admin123,demo:demo2024
```

Start the dev server:

```bash
npm run dev
```

Runs on `http://localhost:3001`.

### 4. Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:3000`.

### 5. Demo credentials

| Username | Password |
|---|---|
| admin | admin123 |
| demo | demo2024 |

---

## Running Tests

```bash
cd backend
npm test
```

Tests cover document chunking, RAG behavior, document service CRUD, access control, and Claude response parsing — all with mocked external dependencies.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns session token |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/documents` | List user's documents |
| POST | `/api/documents/upload` | Upload a PDF |
| GET | `/api/documents/:id` | Get document details |
| POST | `/api/documents/:id/analyze` | Trigger AI analysis |
| DELETE | `/api/documents/:id` | Delete a document |
| POST | `/api/analysis/:id/qa` | Streaming Q&A (SSE) |
| POST | `/api/analysis/gap` | Gap analysis between two documents |

---

## Key Design Decisions

**ChromaDB for local semantic search** — Chunks are embedded using `all-MiniLM-L6-v2` running locally inside ChromaDB, so there's no external embedding API or per-query cost. Q&A retrieves only the top 4 chunks by cosine similarity, keeping Claude's context window small and answers accurate.

**Parallel analysis and indexing** — When a document is analyzed, Claude summarization and ChromaDB chunk indexing run in parallel via `Promise.all`. This cuts analysis time roughly in half.

**Gap analysis on summaries, not raw text** — Rather than sending full document text to Claude (which can exceed token limits on large files), gap analysis uses the AI-generated summaries, extracted key points, and a 4,000-character excerpt from each document. This scales to documents of any size and produces more structured, consistent results.

**Gap analysis result caching** — Completed gap analyses are stored in SQLite with an order-independent key (`sorted docIds joined with ::`). Re-running the same comparison returns the cached result instantly — no API call, no cost.

**Prompt caching** — All three Claude call types (summarize, Q&A, gap analysis) use `cache_control: { type: "ephemeral" }` on their system prompts. After the first call, Anthropic caches the system prompt, reducing input token costs by up to 90% on repeated calls.

**GPT-style chat threads** — Each document has independent named conversation threads stored in `localStorage` under `chat_threads_{docId}`. Threads are named automatically from the user's first question. State updates use the functional form of `setState` to avoid stale-closure bugs during streaming.

**Streaming markdown** — Q&A responses stream token-by-token via Server-Sent Events and render using `react-markdown` with `remark-gfm`. Markdown syntax (headers, bullet lists, bold, code blocks) is preserved and styled correctly in the chat UI.

**Smart document sampling** — When a document exceeds the token budget, `sampleText()` takes the first 50% and last 50% of the allowed characters rather than cutting from the end. Regulatory standards often put the most specific requirements near the end, so this gives a more representative view.

**Background analysis** — After upload, the API returns immediately and analysis runs async. The frontend polls every 3 seconds for status changes, so the user isn't blocked waiting for a 10–20 second analysis to finish.

**SQLite with WAL mode** — `better-sqlite3` with WAL journaling allows concurrent reads without blocking. All document metadata, user records, session tokens, and gap analysis cache entries persist across server restarts.

---

## Sharing via ngrok

To share the app with someone outside your local network (or test from a mobile device), expose both the backend and frontend through ngrok. You'll need two tunnels — either two terminal sessions or a [paid ngrok plan](https://ngrok.com/pricing).

### Step 1 — Expose the backend

```bash
ngrok http 3001
```

Copy the HTTPS URL (e.g. `https://abc123.ngrok-free.app`).

### Step 2 — Point the frontend at the ngrok backend

Create or update `frontend/.env.local`:

```env
VITE_API_URL=https://abc123.ngrok-free.app
```

Restart the frontend dev server (`npm run dev` in the `frontend/` folder).

### Step 3 — Expose the frontend

Open a second terminal:

```bash
ngrok http 3000
```

Share the HTTPS URL ngrok provides. That's the link your client opens to use the app.

> **Note:** Free ngrok accounts support one tunnel at a time. For a quick local network test (same WiFi), you can skip ngrok and just run `npm run dev -- --host` in the frontend directory — Vite will print your local IP address that any device on your network can reach.

---

## Live Demo

> Add your ngrok or deployed URL here once running:
> `https://your-ngrok-url.ngrok-free.app`
