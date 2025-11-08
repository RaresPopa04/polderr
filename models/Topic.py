import json
from dataclasses import dataclass
from typing import List

from models.Event import Event

@dataclass
class Topic:
    topic_id: int
    name: str
    events: List[Event]

    def __str__(self) -> dict:
        return {
            "topic_id": self.topic_id,
            "name": self.name,
            "events": [e.to_json() for e in self.events]
        }

    def to_json(self):
        return json.dumps(self.__str__())