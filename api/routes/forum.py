"""
Forum API endpoints
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime

from database import db
from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.LlmClient import LlmClient
from llm.PromptTemplates.BelastingdienstData import _belastingdienst_data
from llm.PromptTemplates.Prompts import _forum_response_prompt

router = APIRouter()

# In-memory storage for forum posts (topic_id -> list of posts)
forum_storage: Dict[int, List["ForumPostResponse"]] = {}


class ForumPostCreate(BaseModel):
    content: str
    user_name: str = "admin"


class ForumPostResponse(BaseModel):
    id: int
    content: str
    timestamp: str
    user_name: str = "admin"


def generate_response(post: ForumPostResponse, topic_id: int) -> str:
    llm_client = LlmClient()

    prev_conv = ""
    for p in forum_storage[topic_id]:
        prev_conv += p.user_name + " said : " + p.content + "\n"

    topic_data = ""
    for event in db.get_topic_events(topic_id):
        topic_data += event.name + "\n"
        for ep in event.posts:
            topic_data += ep.content + "\n"

    total_topic_context = ""
    for event in db.get_all_events():
        total_topic_context += event.name + "\n"
        for ep in event.posts:
            total_topic_context += ep.content + "\n"

    last_query = post.content

    prompt_text = _forum_response_prompt.format(
        previous_conversation=prev_conv,
        belastingdienst_info=_belastingdienst_data,
        topic_data=total_topic_context,
        query=last_query,
    )

    return llm_client.generate_response(AzerionPromptTemplate(prompt_text))


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
    post.user_name comes from the frontend request body
    """
    if topic_id not in forum_storage:
        forum_storage[topic_id] = []

    post_id = len(forum_storage[topic_id]) + 1

    # user_name is extracted from the frontend request body (post.user_name)
    user_post = ForumPostResponse(
        id=post_id,
        content=post.content,
        timestamp=datetime.now().isoformat(),
        user_name=post.user_name,  # From frontend request
    )

    # If addressed to the AI, generate a reply
    if post.content.startswith("Hey, PolderrAI"):
        ai_content = generate_response(user_post, topic_id)

        ai_post = ForumPostResponse(
            id=post_id + 1,
            content=ai_content,
            timestamp=datetime.now().isoformat(),
            user_name="PolderrAI"
        )

        forum_storage[topic_id].append(user_post)
        ai_post.content = f"Hey, {post.user_name},\n{ai_post.content}"
        forum_storage[topic_id].append(ai_post)
        return ai_post

    # Normal human post
    forum_storage[topic_id].append(user_post)
    return user_post