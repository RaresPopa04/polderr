from dataclasses import dataclass
from typing import List

from models.Event import Event

@dataclass
class Topic:
    def __init__(self,
                 topic_id: int,
                 name,
                 events: List[Event]
                 ):
        self.topic_id = topic_id
        self.name = name
        self.events = events