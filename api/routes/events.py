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
    csv_events = get_csv_events()
    if csv_events:
        return {"events": csv_events}

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
    event = get_csv_event_by_id(event_id)
    if event:
        event["topic"] = {
            "id": event.get("topic_id"),
            "name": event.get("topic_name"),
            "icon": event.get("topic_icon", "🗂️")
        }
        return event

    mock_event = get_mock_event_by_id(event_id)

    if not mock_event:
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
        if topic_info:
            break

    return {
        **mock_event,
        "topic": topic_info
    }
