from dataclasses import dataclass
from datetime import datetime

from models.Actionable import Actionable
from models.Source import Source


@dataclass
class Post:
    def __init__(self,
                 post_id: int,
                 link: str,
                 content: str,
                 date: datetime,
                 source: Source,
                 satisfaction_rating: int,
                 engagement_rating: [datetime, int],
                 actionables: [Actionable]
                 ):
        self.post_id = post_id
        self.link = link
        self.content = content
        self.date = date
        self.source = source
        self.satisfaction_rating = satisfaction_rating
        self.engagement_rating = engagement_rating
        self.actionables = actionables