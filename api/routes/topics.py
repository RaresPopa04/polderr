"""
Topics API endpoints
"""
from fastapi import APIRouter, HTTPException

from database import db
from Services.SentimentAnalysisService import SentimentAnalysisService
from llm.LlmClient import LlmClient
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
        
        # Count total posts for this topic
        total_posts = sum(len(event.posts) for event in topic.events)
        
        misinformation = sum(1 for event in topic.events for post in event.posts for actionable in post.actionables if actionable.is_question == "False")
        questions = sum(1 for event in topic.events for post in event.posts for actionable in post.actionables if actionable.is_question == "True")
        actionables = {
            "misinformation": misinformation,
            "questions": questions
        }
        for event in topic.events:
            events.append({
                "id": event.event_id,
                "name": event.name,
                "data_points": []
            })
        
        # Get top 3 events by total engagement for this topic
        events_with_engagement = []
        for event in topic.events:
            if not event.posts:
                continue
            
            # Build interaction timeline
            interaction_timeline = []
            for post in event.posts:
                if post.date:
                    interaction_timeline.append({
                        "date": post.date.isoformat(),
                        "timestamp": int(post.date.timestamp()),
                        "delta": 0,
                        "prediction": False
                    })
                
                if hasattr(post, 'delta_interactions') and post.delta_interactions:
                    for delta_date, delta_value in post.delta_interactions:
                        interaction_timeline.append({
                            "date": delta_date.isoformat(),
                            "timestamp": int(delta_date.timestamp()),
                            "delta": delta_value,
                            "prediction": False
                        })
            
            # Sort and calculate cumulative
            interaction_timeline.sort(key=lambda x: x["timestamp"])
            cumulative = 0
            for point in interaction_timeline:
                cumulative += point["delta"]
                point["total_interactions"] = cumulative
            
            # Get max engagement
            max_engagement = cumulative if interaction_timeline else 0
            
            if interaction_timeline:
                events_with_engagement.append({
                    "event_id": event.event_id,
                    "name": event.name,
                    "timeline": interaction_timeline,
                    "max_engagement": max_engagement
                })
        
        # Sort by max engagement and get top 3
        events_with_engagement.sort(key=lambda x: x["max_engagement"], reverse=True)
        top_3_events = events_with_engagement[:3]
        
        topics_data.append({
            "id": topic.topic_id,
            "name": topic.name,
            "icon": topic.icon,
            "events": events,
            "actionables": actionables,
            "total_posts": total_posts,
            "top_events": top_3_events
        })
    
    topics_data.sort(key=lambda x: x["total_posts"], reverse=True)
    
    return {"topics": topics_data}





@router.get("/topics/{topic_id}")
async def get_topic(topic_id: int):
    """
    Get a specific topic with all its events
    """
    
    print("loading topic: ", topic_id)
    topic = db.get_topic_by_id(topic_id)
    print("topic: ", topic)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    llm_client = LlmClient()
    sentiment_analysis_service = SentimentAnalysisService(llm_client)
    
    # Calculate total actionables across all events
    total_misinformation = 0
    total_questions = 0
    
    events = []
    sentiment_data_points = []
    
    for event in topic.events:
        if not event.posts:
            continue
            
        short_summary = event.small_summary
        misinformation = sum(1 for post in event.posts for actionable in post.actionables if actionable.is_question == "False")
        questions = sum(1 for post in event.posts for actionable in post.actionables if actionable.is_question == "True")
        
        # Add to totals
        total_misinformation += misinformation
        total_questions += questions
        
        # Calculate sentiment for this event
        sentiment_average = sum(post.satisfaction_rating for post in event.posts) / len(event.posts)
        
        actionables = {
            "misinformation": misinformation,
            "questions": questions
        }
        
        # Build interaction timeline for this event
        interaction_timeline = []
        for post in event.posts:
            if post.date:
                interaction_timeline.append({
                    "date": post.date.isoformat(),
                    "timestamp": int(post.date.timestamp()),
                    "delta": 0,
                    "prediction": False
                })
            
            if hasattr(post, 'delta_interactions') and post.delta_interactions:
                for delta_date, delta_value in post.delta_interactions:
                    interaction_timeline.append({
                        "date": delta_date.isoformat(),
                        "timestamp": int(delta_date.timestamp()),
                        "delta": delta_value,
                        "prediction": False
                    })
        
        # Sort and calculate cumulative
        interaction_timeline.sort(key=lambda x: x["timestamp"])
        cumulative = 0
        for point in interaction_timeline:
            cumulative += point["delta"]
            point["total_interactions"] = cumulative
        
        max_engagement = cumulative if interaction_timeline else 0
        
        events.append({
            "id": event.event_id,
            "name": event.name,
            "short_summary": short_summary,
            "actionables": actionables,
            "date": event.date.isoformat() if event.date else None,
            "sentiment": round(sentiment_average, 2),
            "engagement_timeline": interaction_timeline,
            "max_engagement": max_engagement
        })
        
        # Add sentiment data point for chart
        sentiment_data_points.append({
            "event_id": event.event_id,
            "event_name": event.name,
            "sentiment": round(sentiment_average, 2),
            "date": event.date.isoformat() if event.date else None,
            "timestamp": int(event.date.timestamp()) if event.date else 0
        })
    
    # Sort sentiment data by timestamp
    sentiment_data_points.sort(key=lambda x: x["timestamp"])
    
    # Sort events by engagement and get top 3
    events_sorted = sorted(events, key=lambda x: x.get("max_engagement", 0), reverse=True)
    top_3_events = events_sorted[:3]
    
    return_topic = {
        "id": topic.topic_id,
        "name": topic.name,
        "icon": topic.icon,
        "events": events,
        "top_events": top_3_events,
        "total_actionables": {
            "misinformation": total_misinformation,
            "questions": total_questions
        },
        "sentiment_data": sentiment_data_points
    }
    return return_topic
    
