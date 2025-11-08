"""
Events API endpoints
"""
from fastapi import APIRouter, HTTPException
from api.mock_data import get_event_by_id, TOPICS_DATA

router = APIRouter()


@router.get("/events")
async def list_events():
    """
    Get list of all events across all topics
    """
    events = []
    for topic in TOPICS_DATA:
        for event in topic["events"]:
            events.append({
                **event,
                "topic_id": topic["id"],
                "topic_name": topic["name"]
            })
    
    return {"events": events}


@router.get("/events/{event_id}")
async def get_event(event_id: int):
    """
    Get a specific event by ID
    """
    event = get_event_by_id(event_id)
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Find the topic this event belongs to
    topic_info = None
    for topic in TOPICS_DATA:
        for evt in topic["events"]:
            if evt["id"] == event_id:
                topic_info = {
                    "id": topic["id"],
                    "name": topic["name"],
                    "icon": topic["icon"]
                }
                break
    
    return {
        **event,
        "topic": topic_info
    }

