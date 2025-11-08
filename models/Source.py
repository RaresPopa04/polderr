from enum import Enum


class Source(Enum):
    source_id: int
    base_link: str
    credibility: int # 0-100
