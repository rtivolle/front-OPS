import logging
from fastembed import TextEmbedding

logger = logging.getLogger(__name__)

_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        logger.info("Loading embedding model BAAI/bge-small-en-v1.5...")
        _embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    return _embedding_model

def generate_vector(text: str) -> list[float]:
    model = get_embedding_model()
    # Embeddings returns a generator, we take the first item
    return list(model.embed([text]))[0]
