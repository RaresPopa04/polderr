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
    Get a specific event by ID with posts, actionables, and interaction data
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
    
    # Collect all actionables from all posts
    all_actionables = []
    for post in (event.posts or []):
        for actionable in (post.actionables or []):
            all_actionables.append({
                "actionable_id": actionable.actionable_id,
                "content": actionable.content,
                "is_question": actionable.is_question == "True",
                "proposed_response": actionable.proposed_response,
                "post_link": post.link
            })
    
    # Build interaction timeline from all posts
    interaction_timeline = []
    for post in (event.posts or []):
        # Add initial post date with 0 interactions
        if post.date:
            interaction_timeline.append({
                "date": post.date.isoformat(),
                "timestamp": int(post.date.timestamp()),
                "interactions": 0,
                "post_link": post.link
            })
        
        # Add delta interactions if available
        for delta_date, delta_value in (post.delta_interactions or []):
            interaction_timeline.append({
                "date": delta_date.isoformat(),
                "timestamp": int(delta_date.timestamp()),
                "interactions": delta_value,
                "post_link": post.link
            })
    
    # Sort by timestamp and calculate cumulative interactions
    interaction_timeline.sort(key=lambda x: x["timestamp"])
    cumulative_interactions = 0
    for point in interaction_timeline:
        cumulative_interactions += point["interactions"]
        point["total_interactions"] = cumulative_interactions
    
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
        "actionables": all_actionables,
        "interaction_timeline": interaction_timeline,
        "topic": topic_info
    }
