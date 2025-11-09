from dataclasses import dataclass, field
from typing import List, Optional
from dataclasses_json import dataclass_json

from models.Event import Event

@dataclass_json
@dataclass
class Topic:
    topic_id: int
    name: str
    events: List[Event] = field(default_factory=list)
    icon: str = "📋" 
    actionables: dict = field(default_factory=lambda: {
        "misinformation": 0,
        "questions": 0
    })