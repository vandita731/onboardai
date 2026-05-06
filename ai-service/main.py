from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from google import genai
from google.genai import types
from supabase import create_client

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50):
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def get_embedding(text: str):
    result = client.models.embed_content(
        model="models/gemini-embedding-001",
        contents=text,
    )
    return result.embeddings[0].values


@app.get("/health")
def health():
    return {"status": "ok"}


class IngestRequest(BaseModel):
    document_id: str
    company_id: str
    text: str


@app.post("/ingest")
async def ingest_document(req: IngestRequest):
    try:
        chunks = chunk_text(req.text)

        for chunk in chunks:
            embedding = get_embedding(chunk)

            supabase.table("document_chunks").insert({
                "document_id": req.document_id,
                "company_id": req.company_id,
                "chunk_text": chunk,
                "embedding": embedding
            }).execute()

        supabase.table("documents").update(
            {"processed": True}
        ).eq("id", req.document_id).execute()

        return {"success": True, "chunks": len(chunks)}

    except Exception as e:
        print(f"INGEST ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class QuestionRequest(BaseModel):
    question: str
    company_id: str
    user_id: str


@app.get("/models")
def list_models():
    models = client.models.list()
    embedding_models = [m.name for m in models if "embed" in m.name.lower()]
    return {"embedding_models": embedding_models}

@app.post("/ask")
async def ask_question(req: QuestionRequest):
    print(f"ASK REQUEST: {req}")
    try:
        # Reinitialize client
        from google import genai as g
        c = g.Client(api_key=os.getenv("GEMINI_API_KEY"))
        
        print("Getting embedding...")
        result_embed = c.models.embed_content(
            model="models/gemini-embedding-001",
            contents=req.question,
        )
        question_embedding = result_embed.embeddings[0].values
        print(f"Got embedding, length: {len(question_embedding)}")
        print("Querying supabase...")
        result = supabase.rpc("match_documents", {
            "query_embedding": question_embedding,
            "match_company_id": req.company_id,
            "match_count": 5
        }).execute()
        print(f"Got chunks: {len(result.data)}")

        chunks = result.data

        if not chunks:
            answer = "I couldn't find relevant information in the company documents. Please ask your manager."
        else:
            context = "\n\n".join([c["chunk_text"] for c in chunks])

            prompt = f"""You are a helpful onboarding assistant for a company.
Answer questions based only on the provided company documents.
Be concise, friendly and helpful.
If the answer isn't in the context, say so clearly.

Context from company documents:
{context}

Question: {req.question}

Answer:"""

            response = c.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            answer = response.text

        supabase.table("questions").insert({
            "company_id": req.company_id,
            "asked_by": req.user_id,
            "question_text": req.question,
            "answer_text": answer
        }).execute()

        return {"answer": answer}

    except Exception as e:
        print(f"ASK ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))