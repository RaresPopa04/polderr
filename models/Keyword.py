from dataclasses import dataclass


@dataclass
class Keyword:
    keyword: str
    emb: any

    def __repr__(self):
        return self.keyword