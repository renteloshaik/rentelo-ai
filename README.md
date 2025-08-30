# Rentelo FAQ AI (End-to-End Project)

An offline, self-contained **FAQ chatbot** for Rentelo that gives **correct answers** to your policy/FAQ questions using **semantic search (TF‑IDF cosine similarity)**—no external APIs or keys required.

## What you get
- **backend/**: FastAPI app with a local FAQ knowledge base and semantic search.
- **frontend/**: Vite + React + Tailwind chat UI (clean, responsive).
- **docker-compose.yml**: One command to run both services.

## Run locally (no Docker)

### 1) Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```
Backend will be on http://localhost:8000

### 2) Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will be on http://localhost:5173 (Vite default). It calls the backend at `http://localhost:8000`.

## Run with Docker
```bash
docker compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## API
- `POST /ask` — Body: `{ "question": "Your text" }` → returns best matching answer and metadata.
- `GET /faqs` — List all FAQ entries (title, tags).

## How it works
- The backend loads FAQ data from `data/faqs.json` (Q/A + tags).
- Builds a TF‑IDF vector space using **both questions and answers** to improve recall.
- Computes cosine similarity between your query and the knowledge base.
- Returns the top answer. (Optional: supports `top_k`.)

## Edit/extend FAQs
- Update `backend/data/faqs.json` with new entries (fields: `id`, `title`, `question`, `answer`, `tags` list).
- Restart the backend to reindex.

---

Made for the requirements you shared (refund policy, documents, KYC, timings, etc.).
