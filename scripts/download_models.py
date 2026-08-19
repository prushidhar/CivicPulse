import os
import logging
from transformers import pipeline
from sentence_transformers import SentenceTransformer
from faster_whisper import download_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def cache_models():
    logger.info("Caching Zero-shot Classifier (facebook/bart-large-mnli)...")
    pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    
    logger.info("Caching RAG Embedder (paraphrase-multilingual-MiniLM-L12-v2)...")
    SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    
    logger.info("Caching Faster-Whisper Base Model...")
    download_model("base")
    
    logger.info("All models cached successfully for offline mode!")

if __name__ == "__main__":
    cache_models()
