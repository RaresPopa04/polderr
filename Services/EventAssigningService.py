from llm.LlmClient import LlmClient
from models.Post import Post
from typing import List
from database import db

class EventAssigningService:
    def __init__(self, llm_client:LlmClient):
        self.llm_client = llm_client
        self.db = db
        self.llm_client = LlmClient()
        
    def assign_posts_to_events(self, post: Post):
        events_to_match = self.db.get_events_by_topic_from_last_24_hours(topic)
        
        
    
