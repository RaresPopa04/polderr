"""
Topics API endpoints
"""
from fastapi import APIRouter, HTTPException
from api.mock_data import get_all_topics, get_topic_by_id
from database import db

router = APIRouter()



@router.get("/topics")
async def list_topics():
    """
    Get list of all topics
    """
    topics = db.get_all_topics()
    
    topics_data = []
    for topic in topics:
        events = []
        for event in topic.events:
            events.append({
                "id": event.event_id,
                "name": event.name,
                "data_points": []
            })
        topics_data.append({
            "id": topic.topic_id,
            "name": topic.name,
            "icon": topic.icon,
            "events": events,
            "actionables": topic.actionables
        })
    
    return {"topics": topics_data}





@router.get("/topics/{topic_id}")
async def get_topic(topic_id: str):
    """
    Get a specific topic with all its events
    """
    topic = get_topic_by_id(topic_id)
    
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    return topic

