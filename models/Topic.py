from dataclasses import dataclass, field
from typing import List, Optional
from dataclasses_json import dataclass_json, config

from models.Event import Event
from models.Forum import Forum

@dataclass_json
@dataclass
class Topic:
    topic_id: int
    name: str
    forum: Forum = field(default_factory=lambda: Forum(posts=[]))
    # Serialize events as just IDs, not full objects
    events: List[Event] = field(default_factory=list, metadata=config(
        encoder=lambda events: [e.event_id for e in events if e and e.event_id] if events else [],
        decoder=lambda ids: []  # We'll handle reconstruction separately
    ))
    icon: str = "📋" 
    actionables: dict = field(default_factory=lambda: {
        "misinformation": 0,
        "questions": 0
    })