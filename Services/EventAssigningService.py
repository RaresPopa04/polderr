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
        events_to_match = self.db.get_events_by_topic_from_last_24_hours(post.date, post.topic.name)
        
        print(f"Topic: {topic_instance.name}")
        print(f"Events to match: {len(events_to_match)}")
        
        # Use subject_description for matching (broad subject without posting details)
        post_text = post.subject_description if post.subject_description else post.content
        post_embedding = self.semantic_similarity_service.embed(post_text)
        
        # Use list of tuples instead of dict (Events aren't hashable)
        similarity_per_event = []

        for event in events_to_match:
            # Use case_description for matching (broad subject without posting details)
            event_text = event.case_description if event.case_description else event.small_summary
            if not event_text:
                continue
                
            event_embedding = self.semantic_similarity_service.embed(event_text)
            similarity = self.semantic_similarity_service.cosine_similarity(post_embedding, event_embedding)
            print(f"  Similarity: {similarity:.3f} with event '{event.name}'")
            
            if similarity > self._minimum_event_similarity_threshold:
                similarity_per_event.append((event, similarity))
                print(f"    ✓ Above threshold ({self._minimum_event_similarity_threshold})")
                
        # Sort by similarity (highest first)
        sorted_events = sorted(similarity_per_event, key=lambda x: x[1], reverse=True)
        
        # Add to best matching event
        if sorted_events:
            event, similarity = sorted_events[0]  # Best match
            event.add_post(post, db.events)
            print(f"✓ Post added to event '{event.name}' (similarity: {similarity:.3f})")
            return
        
        new_event = Event.create_with_enrichment(posts=[post], other_events=db.events)
        
        print(f"✨ Event '{new_event.name}' created for post '{post.link}'")
        db.add_event(new_event)
        topic_instance.events.append(new_event)
            
        
        
        
        
        
    
