from dataclasses import dataclass


@dataclass
class Keyword:
    def __init__(self, keyword, emb):
        self.keyword = keyword
        self.emb = emb