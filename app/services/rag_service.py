import logging
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.models import DocumentChunk, RecommendationEvidence
from app.core.config import settings

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self, db: Session):
        self.db = db
        self.embedding_model = None

    def _get_embedding_model(self):
        if not self.embedding_model:
            try:
                from sentence_transformers import SentenceTransformer
                # Using a small, fast multi-lingual model suitable for CPU
                self.embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
            except ImportError:
                logger.warning("sentence_transformers not installed, falling back to mock embeddings")
                self.embedding_model = "mock"
        return self.embedding_model

    def generate_embedding(self, text: str) -> list[float]:
        model = self._get_embedding_model()
        
        if settings.DEMO_MODE or model == "mock":
            # Generate deterministic mock embedding of length 768 to match the DB Vector size
            import hashlib
            h = hashlib.md5(text.encode()).hexdigest()
            # 32 chars * 24 repeats = 768 elements
            return [float(int(h[i:i+2], 16)) / 255.0 for i in range(0, 32)] * 24
            
        model = self._get_embedding_model()
        return model.encode(text).tolist()

    def retrieve_evidence(self, query: str, limit: int = 3):
        """Retrieve most relevant document chunks using pgvector L2 distance."""
        query_embedding = self.generate_embedding(query)
        
        # pgvector query to find closest chunks
        # The <-> operator computes the L2 distance
        chunks = self.db.query(DocumentChunk)\
            .order_by(DocumentChunk.embedding.l2_distance(query_embedding))\
            .limit(limit).all()
            
        return chunks

    def attach_evidence_to_recommendation(self, rec_id: str, query: str):
        """Finds evidence and updates the recommendation."""
        chunks = self.retrieve_evidence(query)
        evidence_list = []
        for chunk in chunks:
            evidence_list.append({
                "chunk_id": str(chunk.chunk_id),
                "text": chunk.text,
                "document_id": str(chunk.document_id)
            })
            
        return evidence_list
