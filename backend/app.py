from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import json, os
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi.middleware.cors import CORSMiddleware

# ------------------------
# Path to FAQ data
# ------------------------
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "faqs.json")

app = FastAPI(title="Rentelo FAQ AI")

# ------------------------
# Enable CORS for frontend
# ------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Change to ["http://localhost:5173"] if frontend runs there
    allow_credentials=True,
    allow_methods=["*"],   # Important: allows OPTIONS preflight
    allow_headers=["*"],
)

# ------------------------
# Models
# ------------------------
class AskBody(BaseModel):
    question: str
    top_k: int = 1

class FAQEntry(BaseModel):
    id: str
    title: str
    question: str
    answer: str
    tags: List[str] = []

# ------------------------
# Load FAQ data
# ------------------------
with open(DATA_PATH, "r", encoding="utf-8") as f:
    FAQS_RAW = json.load(f)

FAQS: List[FAQEntry] = [FAQEntry(**x) for x in FAQS_RAW]

# ------------------------
# Build TF-IDF index
# ------------------------
documents = [
    " ".join([entry.title, entry.question, entry.answer, " ".join(entry.tags)])
    for entry in FAQS
]
vectorizer = TfidfVectorizer(min_df=1, ngram_range=(1, 2))
doc_matrix = vectorizer.fit_transform(documents)

# ------------------------
# Routes
# ------------------------
@app.get("/faqs")
def list_faqs():
    return [{"id": e.id, "title": e.title, "tags": e.tags} for e in FAQS]

@app.post("/ask")
def ask(body: AskBody):
    q = (body.question or "").strip()
    if not q:
        return {"answer": "Please ask a question.", "matches": []}

    q_vec = vectorizer.transform([q])
    sims = cosine_similarity(q_vec, doc_matrix).flatten()

    k = max(1, min(body.top_k, len(FAQS)))
    idxs = np.argsort(sims)[::-1][:k]

    matches = []
    for i in idxs:
        e = FAQS[i]
        matches.append({
            "id": e.id,
            "title": e.title,
            "similarity": float(sims[i]),
            "answer": e.answer
        })

    best = matches[0]
    return {"answer": best["answer"], "matches": matches}
