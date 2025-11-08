from dataclasses import dataclass
from typing import List

from models.Event import Event

@dataclass
class Topic:
    topic_id: int
    name: str
    events: List[Event]