from dataclasses import dataclass
from typing import List

@dataclass
class ForumPost:
    content: str

@dataclass
class Forum:
    posts: List[ForumPost]

