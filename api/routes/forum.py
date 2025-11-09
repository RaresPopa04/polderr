"""
Forum API endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime

router = APIRouter()

# In-memory storage for forum posts (topic_id -> list of posts)
forum_storage: Dict[int, List[dict]] = {}

class ForumPostCreate(BaseModel):
    content: str

class ForumPostResponse(BaseModel):
    id: int
    content: str
    timestamp: str

@router.get("/topics/{topic_id}/forum")
async def get_forum_posts(topic_id: int):
    """
    Get all forum posts for a topic
    """
    posts = forum_storage.get(topic_id, [])
    return {"posts": posts}

@router.post("/topics/{topic_id}/forum")
async def create_forum_post(topic_id: int, post: ForumPostCreate):
    """
    Create a new forum post for a topic
    """
    if topic_id not in forum_storage:
        forum_storage[topic_id] = []
    
    # Generate simple ID based on current length
    post_id = len(forum_storage[topic_id]) + 1
    
    new_post = {
        "id": post_id,
        "content": post.content,
        "timestamp": datetime.now().isoformat()
    }
    
    forum_storage[topic_id].append(new_post)
    
    return new_post

