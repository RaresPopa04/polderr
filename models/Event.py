from dataclasses import dataclass
from datetime import datetime
from typing import List

from models.Keyword import Keyword
from models.Post import Post

# the date of an event is the date of the latest post (biggest post date)
@dataclass
class Event:
    def __init__(self,
                 event_id: int,
                 name: str,
                 small_summary: str = '',
                 big_summary: str = '',
                 posts: List[Post] = None,
                 similar_events=None,
                 keywords: List[Keyword] = None,
                 ):
        self.event_id = event_id
        self.name = name
        self.small_summary = small_summary
        self.big_summary = big_summary
        self.posts = posts
        self.similar_events = similar_events
        self.keywords = keywords

