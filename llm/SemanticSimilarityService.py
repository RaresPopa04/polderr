import json
from dataclasses import dataclass
from typing import List

import numpy as np

from llm.LlmClient import LlmClient


@dataclass
class EmbeddingsPromptTemplate:
    prompt: str = ""
    model: str = "gemini-embedding-001"

    def __init__(self, prompt, model = "gemini-embedding-001"):
        self.prompt = prompt
        self.model = model

    def to_json(self):
        return json.dumps({
            "model": self.model,
            "input": self.prompt,
            "encoding_format": "float"
        })


class SemanticSimilarityService:
    _embedding_model = "gemini-embedding-001"
    _embedding_endpoint = "embeddings"

    def __init__(self, llm_client: LlmClient):
        self.llm_client = llm_client

    def embed(self, txt: str) -> List[float]:
        prompt = EmbeddingsPromptTemplate(
            model= "gemini-embedding-001",
            prompt= txt
        )

        try:
            response = self.llm_client.generate_response(prompt, endpoint=self._embedding_endpoint)

            return response
        except Exception as e:
            raise Exception(f"Failed to generate embedding: {str(e)}")

    def cosine_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)

        if len(vec1) != len(vec2):
            raise ValueError("Embeddings must have the same dimension")

        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        cosine_sim = dot_product / (norm1 * norm2)
        return float(cosine_sim)

    def similarity(self, text1: str, text2: str) -> float:
        embedding1 = self.embed(text1)
        embedding2 = self.embed(text2)
        return self.cosine_similarity(embedding1, embedding2)