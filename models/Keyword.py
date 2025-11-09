from pydantic.dataclasses import dataclass
from pydantic import ConfigDict, Field
from typing import List, Optional

@dataclass(config=ConfigDict(arbitrary_types_allowed=True))
class Keyword:
    keyword: str
    emb: List[float]

    def __repr__(self):
        return self.keyword
    
    def __str__(self):
        return self.keyword