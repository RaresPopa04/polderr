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
        topics_data.append({
            "id": topic.topic_id,
            "name": topic.name,
            "icon": topic.icon,
            "events": events,
            "actionables": actionables
        })
    
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
    
    events = []
    for event in topic.events:
        short_summary = event.small_summary
        misinformation = sum(1 for post in event.posts for actionable in post.actionables if actionable.is_question == "False")
        questions = sum(1 for post in event.posts for actionable in post.actionables if actionable.is_question == "True")
        actionables = {
            "misinformation": misinformation,
            "questions": questions
        }
        events.append({
            "id": event.event_id,
            "name": event.name,
            "short_summary": short_summary,
            "actionables": actionables
        })
    return_topic = {
        "id": topic.topic_id,
        "data_points": sentiment_analysis_service.analyze_sentiment(topic.name),
        "name": topic.name,
        "icon": topic.icon,
        "events": events,
    }
    return return_topic
    
