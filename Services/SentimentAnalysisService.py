from database import db
from llm.LlmClient import LlmClient
from datetime import datetime
from typing import Dict, Any


class SentimentAnalysisService:
    def __init__(self, llm_client: LlmClient):
        self.llm_client = llm_client
        self.db = db

    def analyze_sentiment(self, topic: str) -> Dict[str, Any]:
        """
        Analyze sentiment for a topic and return graph-ready JSON data
        
        Returns:
            {
                "topic": "Education",
                "data": [
                    {
                        "event_id": 1,
                        "event_name": "Event Name",
                        "sentiment": 75.5,
                        "date": "2025-11-08T12:00:00",
                        "timestamp": 1730995200,
                        "post_count": 5
                    },
                    ...
                ],
                "metadata": {
                    "total_events": 10,
                    "avg_sentiment": 78.9,
                    "date_range": {
                        "start": "2025-11-08",
                        "end": "2025-11-09"
                    }
                }
            }
        """
        topic_instance = self.db.get_topic_by_name(topic)
        
        if not topic_instance or not topic_instance.events:
            return {
                "topic": topic,
                "data": [],
                "metadata": {
                    "total_events": 0,
                    "avg_sentiment": 0,
                    "date_range": {
                        "start": None,
                        "end": None
                    }
                }
            }
        
        all_events = topic_instance.events
        sentiment_data = []
        total_sentiment = 0
        
        for event in all_events:
            if not event.posts:
                continue
            
            sentiment_average = sum(
                post.satisfaction_rating for post in event.posts
            ) / len(event.posts)
            
            sentiment_data.append({
                "event_id": event.event_id,
                "event_name": event.name,
                "sentiment": round(sentiment_average, 2),
                "date": event.date.isoformat(),  # ISO 8601 format
                "timestamp": int(event.date.timestamp()),
                "post_count": len(event.posts)
            })
            total_sentiment += sentiment_average
        
        # Sort by date (oldest first)
        sentiment_data.sort(key=lambda x: x["timestamp"])
        
        return {
            "topic": topic,
            "data": sentiment_data,
            "metadata": {
                "total_events": len(sentiment_data),
                "avg_sentiment": round(total_sentiment / len(sentiment_data), 2) if sentiment_data else 0,
                "date_range": {
                    "start": sentiment_data[0]["date"] if sentiment_data else None,
                    "end": sentiment_data[-1]["date"] if sentiment_data else None
                }
            }
        }