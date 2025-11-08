import json
from enum import Enum


class Source(Enum):
    source_id: int
    base_link: str
    credibility: int # 0-100

    def __str__(self) -> dict:
        return {
            "name": self.name,
            "source_id": self.source_id,
            "base_link": self.base_link,
            "credibility": self.credibility
        }

    def to_json(self):
        return json.dumps(self.__str__())

