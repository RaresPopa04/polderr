"""
Events API endpoints
"""
from fastapi import APIRouter, HTTPException
from database import db
from Services.SentimentAnalysisService import SentimentAnalysisService
from llm.LlmClient import LlmClient

router = APIRouter()


@router.get("/events")
async def list_events():
    """
    Get list of all events across all topics
    """
    events = db.get_all_events()
    return {
        "events": [
            {
                "event_id": event.event_id,
                "name": event.name,
                "small_summary": event.small_summary,
                "big_summary": event.big_summary,
                "date": event.date.isoformat() if event.date else None,
                "post_count": len(event.posts) if event.posts else 0,
                "topic": event.get_event_topic() if event.posts else None
            }
            for event in events
        ]
    }


@router.get("/events/{event_id}")
async def get_event(event_id: int):
    """
    Get a specific event by ID
    """
    event = db.get_event_by_id(event_id)
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Get topic info
    topic_name = event.get_event_topic() if event.posts else None
    topic_info = None
    if topic_name:
        topic = db.get_topic_by_name(topic_name)
        if topic:
            topic_info = {
                "id": topic.topic_id,
                "name": topic.name,
                "icon": topic.icon
            }
    
    return {
        "event_id": event.event_id,
        "name": event.name,
        "small_summary": event.small_summary,
        "big_summary": event.big_summary,
        "date": event.date.isoformat() if event.date else None,
        "keywords": [kw.keyword for kw in event.keywords] if event.keywords else [],
        "posts": [
            {
                "link": post.link,
                "content": post.content,
                "date": post.date.isoformat() if post.date else None,
                "source": post.source,
                "satisfaction_rating": post.satisfaction_rating
            }
            for post in (event.posts or [])
        ],
        "topic": topic_info
    }
