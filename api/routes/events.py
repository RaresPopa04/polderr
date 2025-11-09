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
    
    # Build interaction timeline from all posts with delta interactions
    interaction_timeline = []
    for post in (event.posts or []):
        # Add initial post with starting engagement
        if post.date:
            interaction_timeline.append({
                "date": post.date.isoformat(),
                "timestamp": int(post.date.timestamp()),
                "delta": 0,  # Initial post starts at 0
                "post_link": post.link,
                "prediction": False
            })
        
        # Add all delta interactions for this post
        if hasattr(post, 'delta_interactions') and post.delta_interactions:
            for delta_date, delta_value in post.delta_interactions:
                interaction_timeline.append({
                    "date": delta_date.isoformat(),
                    "timestamp": int(delta_date.timestamp()),
                    "delta": delta_value,
                    "post_link": post.link,
                    "prediction": False
                })
    
    # Sort by timestamp and calculate cumulative interactions
    interaction_timeline.sort(key=lambda x: x["timestamp"])
    cumulative = 0
    for point in interaction_timeline:
        cumulative += point["delta"]
        point["total_interactions"] = cumulative
    
    # Add prediction point if we have data
    if len(interaction_timeline) >= 2:
        # Simple linear prediction based on last two points
        last_point = interaction_timeline[-1]
        second_last = interaction_timeline[-2]
        
        # Calculate time delta and engagement delta
        time_diff = last_point["timestamp"] - second_last["timestamp"]
        engagement_diff = last_point["total_interactions"] - second_last["total_interactions"]
        
        # Predict next point (same time interval in the future)
        if time_diff > 0:
            predicted_timestamp = last_point["timestamp"] + time_diff
            predicted_engagement = last_point["total_interactions"] + engagement_diff
            
            # Ensure prediction is not negative
            predicted_engagement = max(predicted_engagement, last_point["total_interactions"])
            
            from datetime import datetime
            interaction_timeline.append({
                "date": datetime.fromtimestamp(predicted_timestamp).isoformat(),
                "timestamp": predicted_timestamp,
                "delta": engagement_diff,
                "total_interactions": predicted_engagement,
                "post_link": None,
                "prediction": True
            })
    
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
