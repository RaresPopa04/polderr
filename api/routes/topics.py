"""
Topics API endpoints
"""
from fastapi import APIRouter, HTTPException
from api.mock_data import get_all_topics, get_topic_by_id

router = APIRouter()


@router.get("/topics")
async def list_topics():
    """
    Get list of all topics with full event details for dashboard
    """
    topics = get_all_topics()
    return {
        "topics": topics
    }


@router.get("/topics/{topic_id}")
async def get_topic(topic_id: str):
    """
    Get a specific topic with all its events
    """
    topic = get_topic_by_id(topic_id)
    
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    return topic

