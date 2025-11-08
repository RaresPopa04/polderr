from datetime import datetime, timedelta
from typing import List, Optional
from models.Post import Post
from models.Event import Event
from models.Actionable import Actionable
from models.Keyword import Keyword


class InMemoryDB:
    """In-memory database using lists for posts and events"""
    
    def __init__(self):
        self.posts: List[Post] = []
        self.events: List[Event] = []
        self._initialize_mock_data()
    
    def _initialize_mock_data(self):
        """Initialize the database with mock data"""
        # Create mock posts for Traffic Safety event
        traffic_posts = [
            Post(
                post_id=1,
                link="https://facebook.com/rijswijk-nieuws/posts/123456",
                content="Almost got hit by a car again at the intersection today. This is getting ridiculous! The municipality needs to do something about this dangerous situation.",
                date=datetime(2025, 11, 8, 14, 30),
                source="Facebook - Rijswijk News",
                satisfaction_rating=25,
                engagement_rating=[(datetime(2025, 11, 8, 15, 0), 89)],
                actionables=[
                    Actionable(
                        actionable_id=1,
                        base_link="https://facebook.com/rijswijk-nieuws/posts/123456",
                        content="When will the municipality address this dangerous intersection?",
                        is_question=True,
                        proposed_response="We take traffic safety very seriously. Our traffic department is currently reviewing this intersection and will present recommendations to the council next month."
                    )
                ]
            ),
            Post(
                post_id=2,
                link="https://twitter.com/rijswijk_veilig/status/987654",
                content="Traffic safety must become a priority! The municipality must take action now. Our children's safety is at stake. #RijswijkVeiligheid",
                date=datetime(2025, 11, 7, 10, 15),
                source="X (Twitter) - @rijswijk_safe",
                satisfaction_rating=30,
                engagement_rating=[(datetime(2025, 11, 7, 11, 0), 67)],
                actionables=[]
            ),
            Post(
                post_id=3,
                link="https://instagram.com/p/abc123",
                content="Started a petition for safer traffic in our neighborhood! Link in bio! Let's work together to make Rijswijk safer for everyone. Already 500+ signatures!",
                date=datetime(2025, 11, 6, 16, 45),
                source="Instagram - Rijswijk Residents",
                satisfaction_rating=35,
                engagement_rating=[(datetime(2025, 11, 6, 17, 0), 145)],
                actionables=[
                    Actionable(
                        actionable_id=2,
                        base_link="https://instagram.com/p/abc123",
                        content="Will the municipality respond to this petition with 500+ signatures?",
                        is_question=True,
                        proposed_response="Thank you for organizing this petition. We will review all signatures and concerns, and invite petition organizers to present at our next council meeting."
                    )
                ]
            ),
            Post(
                post_id=4,
                link="https://youtube.com/watch?v=xyz789",
                content="In this video we show how dangerous the situation is at multiple intersections in Rijswijk. Please share to raise awareness!",
                date=datetime(2025, 11, 5, 9, 20),
                source="YouTube - Rijswijk Current",
                satisfaction_rating=20,
                engagement_rating=[(datetime(2025, 11, 5, 10, 0), 234)],
                actionables=[]
            ),
            Post(
                post_id=5,
                link="https://linkedin.com/posts/gemeente-rijswijk_abc123",
                content="Next week we will discuss the proposals for improved traffic safety measures in the city center. Public input is welcome.",
                date=datetime(2025, 11, 4, 13, 0),
                source="LinkedIn - Municipality Rijswijk",
                satisfaction_rating=70,
                engagement_rating=[(datetime(2025, 11, 4, 14, 0), 56)],
                actionables=[]
            ),
        ]
        
        # Create mock posts for Green Projects event
        green_posts = [
            Post(
                post_id=6,
                link="https://facebook.com/rijswijk-noord/posts/456789",
                content="Love the idea of more trees on our street! Would also be great to have some community gardens.",
                date=datetime(2025, 11, 7, 11, 30),
                source="Facebook - Rijswijk North",
                satisfaction_rating=85,
                engagement_rating=[(datetime(2025, 11, 7, 12, 0), 52)],
                actionables=[]
            ),
            Post(
                post_id=7,
                link="https://instagram.com/p/def456",
                content="The new green initiative looks promising! Happy to see the municipality caring about our environment.",
                date=datetime(2025, 11, 7, 9, 15),
                source="Instagram - Rijswijk Green",
                satisfaction_rating=90,
                engagement_rating=[(datetime(2025, 11, 7, 10, 0), 78)],
                actionables=[]
            ),
        ]
        
        # Create mock posts for Cultural Festival event
        festival_posts = [
            Post(
                post_id=8,
                link="https://facebook.com/rijswijk-cultuur/posts/789012",
                content="Can't wait for the summer festival! The lineup looks amazing this year!",
                date=datetime(2025, 11, 6, 15, 20),
                source="Facebook - Rijswijk Culture",
                satisfaction_rating=95,
                engagement_rating=[(datetime(2025, 11, 6, 16, 0), 123)],
                actionables=[]
            ),
            Post(
                post_id=9,
                link="https://twitter.com/rijswijk_events/status/345678",
                content="Volunteering applications for the summer festival are now open! Join us!",
                date=datetime(2025, 11, 6, 10, 0),
                source="X (Twitter) - @rijswijk_events",
                satisfaction_rating=88,
                engagement_rating=[(datetime(2025, 11, 6, 11, 0), 67)],
                actionables=[]
            ),
        ]
        
        # Add all posts to the database
        self.posts.extend(traffic_posts)
        self.posts.extend(green_posts)
        self.posts.extend(festival_posts)
        
        # Create mock events
        traffic_event = Event(
            event_id=1,
            name="Rijswijk Traffic Safety Discussion",
            small_summary="Public discussion about traffic safety in the city center",
            big_summary="A growing discussion on social media about traffic safety in Rijswijk city center. Residents are expressing concerns about the safety of cyclists and pedestrians, particularly at key intersections. Multiple posts and videos have been shared documenting dangerous situations.",
            posts=[],
            similar_events=None,
            keywords=[
                Keyword(keyword="traffic safety", emb=None),
                Keyword(keyword="intersection", emb=None),
                Keyword(keyword="dangerous", emb=None),
            ]
        )
        
        green_event = Event(
            event_id=2,
            name="Green Projects Rijswijk North",
            small_summary="Residents share ideas for more greenery in the neighborhood",
            big_summary="Community members in Rijswijk North are actively discussing and proposing ideas for increasing green spaces in their neighborhood. Suggestions include more trees, community gardens, and green corridors.",
            posts=[],
            similar_events=None,
            keywords=[
                Keyword(keyword="green", emb=None),
                Keyword(keyword="trees", emb=None),
                Keyword(keyword="environment", emb=None),
            ]
        )
        
        festival_event = Event(
            event_id=3,
            name="Cultural Festival Planning",
            small_summary="Organization and feedback about the upcoming summer festival",
            big_summary="Planning and community engagement for Rijswijk's annual summer cultural festival. Residents are sharing excitement about the lineup and opportunities to volunteer. The event brings together diverse cultural performances and activities.",
            posts=[],
            similar_events=None,
            keywords=[
                Keyword(keyword="festival", emb=None),
                Keyword(keyword="culture", emb=None),
                Keyword(keyword="summer", emb=None),
            ]
        )
        
        self.events.append(traffic_event)
        self.events.append(green_event)
        self.events.append(festival_event)
    
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

