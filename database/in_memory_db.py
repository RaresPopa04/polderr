from typing import List, Optional

from models.Event import Event
from models.Post import Post


class InMemoryDB:
    """In-memory database using lists for posts and events"""
    
    def __init__(self):
        self.posts: List[Post] = []
        self.events: List[Event] = []

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
        event.event_id = len(self.events)
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
    
    # Post CRUD operations
    def get_all_posts(self) -> List[Post]:
        """Get all posts"""
        return self.posts
    
    def get_post_by_id(self, post_id: int) -> Optional[Post]:
        """Get a specific post by ID"""
        for post in self.posts:
            if post.post_id == post_id:
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
        post.post_id = len(self.posts) + 1
        self.posts.append(post)
        return post
    
    def update_post(self, post_id: int, updated_post: Post) -> Optional[Post]:
        """Update an existing post"""
        for i, post in enumerate(self.posts):
            if post.post_id == post_id:
                self.posts[i] = updated_post
                return updated_post
        return None
    
    def delete_post(self, post_id: int) -> bool:
        """Delete a post by ID"""
        for i, post in enumerate(self.posts):
            if post.post_id == post_id:
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


# Singleton instance
db = InMemoryDB()

