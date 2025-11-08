from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Tuple
from models.Actionable import Actionable
from models.Source import Source

@dataclass
class Post:
    link: str
    content: str
    date: datetime
    source: Source
    satisfaction_rating: int
    engagement_rating: List[Tuple[datetime, int]]
    actionables: List[Actionable]
    post_id: Optional[int] = field(default=None)