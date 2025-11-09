from pydantic.dataclasses import dataclass
from typing import List

@dataclass()
class Keyword:
    keyword: str
    emb: List[float]

    def __repr__(self):
        return self.keyword