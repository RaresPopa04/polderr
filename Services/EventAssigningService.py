from llm.LlmClient import LlmClient
from models.Post import Post
from typing import List
from database import db
from llm.find_topic_for_post import find_topic_for_post
from models.Event import Event
from llm.SemanticSimilarityService import SemanticSimilarityService


class EventAssigningService:
    def __init__(self, llm_client:LlmClient):
        self.llm_client = llm_client
        self.db = db
        self.llm_client = LlmClient()
        self.semantic_similarity_service = SemanticSimilarityService(llm_client)
        
        self._minimum_event_similarity_threshold = 0.7
        
    def assign_posts_to_events(self, post: Post):
        topic_instance = self.db.get_topic_by_name(post.topic.name)
        events_to_match = self.db.get_events_by_topic_from_last_24_hours(post.topic.name)
        post_embedding = self.semantic_similarity_service.embed(post.content)
        
        similarity_per_event = {}

        for event in events_to_match:
            event_embedding = self.semantic_similarity_service.embed(event.content)
            similarity = self.semantic_similarity_service.cosine_similarity(post_embedding, event_embedding)
            if similarity > self._minimum_event_similarity_threshold:
                similarity_per_event[event] = similarity
                
        sorted_events = sorted(similarity_per_event.items(), key=lambda x: x[1], reverse=True)
        for event, similarity in sorted_events:
            if similarity > self._minimum_event_similarity_threshold:
                event.add_post(post, db.events)
                print(f"Post '{post.link}' added to event '{event.name}'")
                return
        
        new_event = Event.create_with_enrichment(posts=[post], other_events=db.events)
        
        print(f"Event '{new_event.name}' created for post '{post.link}'")
        db.add_event(new_event)
        topic_instance.events.append(new_event)
            
        
        
        
        
        
    
