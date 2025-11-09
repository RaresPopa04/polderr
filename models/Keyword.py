from dataclasses import dataclass
from typing import List
from dataclasses_json import dataclass_json

@dataclass_json
@dataclass
class Keyword:
    keyword: str
    emb: List[float]

    def __repr__(self):
        return self.keyword