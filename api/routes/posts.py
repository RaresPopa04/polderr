"""
Posts API endpoints
"""
from fastapi import APIRouter, HTTPException
from database import db

router = APIRouter()


@router.get("/posts")
async def list_posts():
    """
    Get list of all posts
    """
    posts = db.get_all_posts()
    return {
        "posts": [
            {
                "link": post.link,
                "content": post.content,
                "date": post.date.isoformat() if post.date else None,
                "source": post.source,
                "satisfaction_rating": post.satisfaction_rating,
                "topic": post.topic if hasattr(post, 'topic') else None,
                "actionables_count": len(post.actionables) if post.actionables else 0
            }
            for post in posts
        ]
    }


@router.get("/posts/by-link")
async def get_post_by_link(link: str):
    """
    Get a specific post by its link (URL)
    Query parameter: ?link=<post_link>
    """
    if not link:
        raise HTTPException(status_code=400, detail="Link parameter is required")
    
    post = db.get_post_by_id(link)
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return {
        "link": post.link,
        "content": post.content,
        "date": post.date.isoformat() if post.date else None,
        "source": post.source,
        "satisfaction_rating": post.satisfaction_rating,
        "topic": post.topic if hasattr(post, 'topic') else None,
        "actionables": [
            {
                "actionable_id": actionable.actionable_id if hasattr(actionable, 'actionable_id') else None,
                "content": actionable.content if hasattr(actionable, 'content') else None,
                "is_question": actionable.is_question if hasattr(actionable, 'is_question') else None,
                "base_link": actionable.base_link if hasattr(actionable, 'base_link') else None
            }
            for actionable in (post.actionables or [])
        ]
    }


@router.get("/posts/by-event/{event_id}")
async def get_posts_by_event(event_id: int):
    """
    Get all posts for a specific event
    """
    posts = db.get_posts_by_event(event_id)
    
    if not posts:
        # Check if the event exists
        event = db.get_event_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return {"posts": []}
    
    return {
        "posts": [
            {
                "link": post.link,
                "content": post.content,
                "date": post.date.isoformat() if post.date else None,
                "source": post.source,
                "satisfaction_rating": post.satisfaction_rating,
                "topic": post.topic if hasattr(post, 'topic') else None,
                "actionables_count": len(post.actionables) if post.actionables else 0
            }
            for post in posts
        ]
    }


@router.get("/posts/by-topic/{topic_name}")
async def get_posts_by_topic(topic_name: str):
    """
    Get all posts for a specific topic
    """
    topic = db.get_topic_by_name(topic_name)
    
    if not topic:
        raise HTTPException(status_code=404, detail=f"Topic '{topic_name}' not found")
    
    # Collect all posts from all events in this topic
    all_posts = []
    for event in topic.events:
        if event.posts:
            all_posts.extend(event.posts)
    
    return {
        "topic": topic_name,
        "posts": [
            {
                "link": post.link,
                "content": post.content,
                "date": post.date.isoformat() if post.date else None,
                "source": post.source,
                "satisfaction_rating": post.satisfaction_rating,
                "topic": post.topic if hasattr(post, 'topic') else None,
                "actionables_count": len(post.actionables) if post.actionables else 0
            }
            for post in all_posts
        ]
    }

