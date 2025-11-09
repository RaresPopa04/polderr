from typing import List, Optional

from llm.LlmClient import LlmClient
from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.PromptTemplates.Prompts import get_report_for_event_prompt, get_report_for_last_month_prompt, get_report_for_last_week_prompt, get_report_for_topic_prompt
from models.Event import Event
from models.Post import Post
from models.Keyword import Keyword
from datetime import datetime, timedelta
from models.Topic import Topic

class InMemoryDB:
    """In-memory database using lists for posts and events"""
    
    def __init__(self):
        self.posts: List[Post] = []
        self.events: List[Event] = []
        self.topics: List[Topic] = []
        
        self.topics = [
            Topic(topic_id=1, name="Traffic", events=[], icon="🚦"), 
            Topic(topic_id=2, name="Environment", events=[], icon="🌱"),
            Topic(topic_id=3, name="Crime", events=[], icon="🚨"),
            Topic(topic_id=4, name="Health", events=[], icon="🏥"),
            Topic(topic_id=5, name="Education", events=[], icon="📚"),
            Topic(topic_id=6, name="Transportation", events=[], icon="🚌"),
            Topic(topic_id=7, name="Economy", events=[], icon="💰"),
            Topic(topic_id=8, name="Culture", events=[], icon="🎭"),
            Topic(topic_id=9, name="Politics", events=[], icon="🏛️"),
            Topic(topic_id=10, name="Other", events=[], icon="📋"),
        ]
        
        
    

    def get_all_topics(self) -> List[Topic]:
        """Get all topics"""
        return self.topics
    
    def get_all_events_by_topic(self, topic: str) -> List[Event]:
        """Get all events for a specific topic"""
        for topic in self.topics:
            if topic.name == topic:
                return topic.events
        return None
    
    # Event CRUD operations
    def get_all_events(self) -> List[Event]:
        """Get all events"""
        return self.events
    
    def get_event_by_id(self, event_id: int) -> Optional[Event]:
        """Get a specific event by ID"""
        for event in self.events:
            if event.event_id == event_id:
                return event
        return None
    
    def add_event(self, event: Event) -> Event:
        self.events.append(event)
        print("event added: ", event)
        event.event_id = len(self.events)
        print("event id: ", event.event_id)
        print("events: ", self.events)
        return event
    
    def update_event(self, event_id: int, updated_event: Event) -> Optional[Event]:
        """Update an existing event"""
        for i, event in enumerate(self.events):
            if event.event_id == event_id:
                self.events[i] = updated_event
                return updated_event
        return None
    
    def delete_event(self, event_id: int) -> bool:
        """Delete an event by ID"""
        for i, event in enumerate(self.events):
            if event.event_id == event_id:
                self.events.pop(i)
                return True
        return False
    
    def get_events_by_topic_from_last_24_hours(self, topic: str) -> List[Event]:
        """Get all events for a specific topic from the last 24 hours"""
        events = []
        for event in self.events:
            if event.get_event_topic() == topic and event.date > datetime.now() - timedelta(hours=24):
                events.append(event)
        return events
    
    # Post CRUD operations
    def get_all_posts(self) -> List[Post]:
        """Get all posts"""
        return self.posts
    
    def get_post_by_id(self, link: str) -> Optional[Post]:
        """Get a specific post by ID"""
        for post in self.posts:
            if post.link == link:
                return post
        return None
    
    def get_posts_by_event(self, event_id: int) -> List[Post]:
        """Get all posts for a specific event"""
        event = self.get_event_by_id(event_id)
        if event and event.posts:
            return event.posts
        return []
    
    def add_post(self, post: Post) -> Post:
        """Add a new post"""
        self.posts.append(post)
        return post
    
    def update_post(self, link: str, updated_post: Post) -> Optional[Post]:
        """Update an existing post"""
        for i, post in enumerate(self.posts):
            if post.link == link:
                self.posts[i] = updated_post
                return updated_post
        return None
    
    def delete_post(self, link: str) -> bool:
        """Delete a post by ID"""
        for i, post in enumerate(self.posts):
            if post.link == link:
                self.posts.pop(i)
                return True
        return False
    
    # Helper methods
    def get_total_engagement_for_event(self, event_id: int) -> int:
        """Calculate total engagement for an event"""
        posts = self.get_posts_by_event(event_id)
        total = 0
        for post in posts:
            if post.engagement_rating:
                for _, engagement in post.engagement_rating:
                    total += engagement
        return total
    
    def get_event_statistics(self, event_id: int) -> dict:
        """Get statistics for an event"""
        event = self.get_event_by_id(event_id)
        if not event:
            return {}
        
        posts = event.posts if event.posts else []
        total_engagement = 0
        for post in posts:
            if post.engagement_rating:
                for _, engagement in post.engagement_rating:
                    total_engagement += engagement
        
        avg_satisfaction = sum(p.satisfaction_rating for p in posts) / len(posts) if posts else 0
        
        return {
            "event_id": event_id,
            "total_posts": len(posts),
            "total_engagement": total_engagement,
            "average_engagement": total_engagement / len(posts) if posts else 0,
            "average_satisfaction": avg_satisfaction,
            "latest_post_date": max([p.date for p in posts]) if posts else None
        }

    def get_raport_for_event(self, event_id: int) -> Optional[str]:
        event = self.get_event_by_id(event_id)
        if not event:
            return None
        llm_client = LlmClient()
        return llm_client.generate_response(AzerionPromptTemplate(prompt=get_report_for_event_prompt.format(event_posts=event.posts)))

    def get_topic_by_name(self, topic_name: str) -> Optional[Topic]:
        for topic in self.topics:
            if topic.name == topic_name:
                return topic
        return None
    
    def get_topic_by_id(self, topic_id: int) -> Optional[Topic]:
        for topic in self.topics:
            if topic.topic_id == topic_id:
                return topic
        return None
    
    def add_topic(self, topic: Topic) -> Topic:
        # Generate new topic ID
        if not topic.topic_id:
            topic.topic_id = len(self.topics) + 1
        self.topics.append(topic)
        return topic
    
    def search_keywords_by_query(self, query_words: List[str]) -> List[Keyword]:
        """
        Search for keywords that contain any of the query words (substring matching).
        Returns a list of matching keywords from all events.
        """
        matching_keywords = []
        seen_keywords = set()  # Track unique keywords
        
        # Iterate through all events and their keywords
        for event in self.events:
            if not event.keywords:
                continue
            
            for keyword in event.keywords:
                # Check if any query word is a substring of this keyword (case-insensitive)
                keyword_lower = keyword.keyword.lower()
                for query_word in query_words:
                    if query_word.lower() in keyword_lower:
                        # Add only if we haven't seen this exact keyword yet
                        if keyword.keyword not in seen_keywords:
                            matching_keywords.append(keyword)
                            seen_keywords.add(keyword.keyword)
                        break  # Move to next keyword once we found a match
        
        return matching_keywords
    
    def get_events_by_keywords(self, keywords: List[Keyword]) -> List[Event]:
        """
        Get all events that contain any of the specified keywords.
        Returns each event only once (deduplicated).
        """
        matching_events = []
        seen_event_ids = set()
        
        # Convert keywords to a set of keyword strings for faster lookup
        keyword_strings = {kw.keyword for kw in keywords}
        
        # Iterate through all events
        for event in self.events:
            if not event.keywords or event.event_id in seen_event_ids:
                continue
            
            # Check if this event has any of the target keywords
            for event_keyword in event.keywords:
                if event_keyword.keyword in keyword_strings:
                    matching_events.append(event)
                    if event.event_id:
                        seen_event_ids.add(event.event_id)
                    break  # Move to next event once we found a match
        
        return matching_events

    def get_raport_for_topic(self, topic_id: int) -> Optional[str]:
        topic = self.get_topic_by_id(topic_id)
        if not topic:
            return None
        llm_client = LlmClient()
        return llm_client.generate_response(AzerionPromptTemplate(prompt=get_report_for_topic_prompt.format(topic_posts=topic.posts)))

    def get_raport_for_last_week(self, ) -> Optional[str]:
        llm_client = LlmClient()
        return llm_client.generate_response(AzerionPromptTemplate(prompt=get_report_for_last_week_prompt.format(last_week_posts=self.posts)))

    def get_raport_for_last_month(self, ) -> Optional[str]:
        llm_client = LlmClient()
        return llm_client.generate_response(AzerionPromptTemplate(prompt=get_report_for_last_month_prompt.format(last_month_posts=self.posts)))

# Singleton instance
db = InMemoryDB()

