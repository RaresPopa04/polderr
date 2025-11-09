from pydantic.dataclasses import dataclass
from pydantic import ConfigDict, Field
from typing import Any
import numpy as np


@dataclass(config=ConfigDict(arbitrary_types_allowed=True))
class Keyword:
    keyword: str
    emb: Any = Field(default=None, exclude=True)  # Exclude embedding from JSON serialization

    def __repr__(self):
        return self.keyword
    
    def __str__(self):
        return self.keyword