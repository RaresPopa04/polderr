from dataclasses import dataclass
from typing import List

@dataclass
class ForumPost:
    content: str
    user_name: str = "Anonymous"

@dataclass
class Forum:
    posts: List[ForumPost]

