import json
from dataclasses import dataclass

import numpy as np


@dataclass
class Keyword:
    keyword: str
    emb: any

    def __repr__(self):
        return self.keyword
    def __init__(self, keyword, emb):
        self.keyword = keyword
        self.emb = emb

    def __str__(self) -> dict:
        return {
            "keyword": self.keyword,
            "emb": self.emb.tolist() if isinstance(self.emb, np.ndarray) else self.emb
        }

    def to_json(self) -> dict:
        return self.__str__()

    @classmethod
    def from_json(cls, data: dict):
        obj = cls.__new__(cls)
        obj.keyword = data.get("keyword")
        emb = data.get("emb")
        obj.emb = np.array(emb) if emb is not None else None
        return obj

