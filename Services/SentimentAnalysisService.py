from database import db
from llm.LlmClient import LlmClient
from datetime import datetime
from typing import List, Tuple


class SentimentAnalysisService:
    def __init__(self, llm_client:LlmClient):
        self.llm_client = llm_client
        self.db = db

    def analyze_sentiment(self, topic: str) -> List[Tuple[int, float, datetime]]:
        topic_instance = self.db.get_topic_by_name(topic)
        all_events = topic_instance.events
        sentiment_data = []
        for event in all_events:
            sentiment_average = sum(post.satisfaction_rating for post in event.posts) / len(event.posts)
            timestamp = event.date.timestamp()
            sentiment_data.append((event.event_id, sentiment_average, timestamp))
        return sentiment_data