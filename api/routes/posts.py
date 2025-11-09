"""
Posts API endpoints
"""
import uuid
from collections import defaultdict
from datetime import datetime

from fastapi import APIRouter, HTTPException
from Services.EventAssigningService import EventAssigningService
from database import db
from fastapi import HTTPException, UploadFile, File as FastAPIFile, FastAPI

from llm.LlmClient import LlmClient
from models.Post import Post
from models.File import File
from llm.find_topic_for_post import find_topic_for_post

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

@router.post("/upload-file-as-post")
async def upload_file_as_post(upload: UploadFile = FastAPIFile(...)):
    content: bytes = upload.file.read()
    filename: str = upload.filename

    file = File(content=content, path=filename)
    txt = file.read()

    unique_id = str(uuid.uuid4())

    post = Post(
        "Manual Upload " + filename + " " + unique_id,
        txt,
        datetime.now(),
        "Manual Upload"
    )

    # Assign topic to the post
    topics = db.get_all_topics()
    topic_result = find_topic_for_post(post, topics)
    
    # find_topic_for_post might return a Topic object or a string
    if hasattr(topic_result, 'name'):
        # It's a Topic object
        topic_name = topic_result.name
        topic_obj = topic_result
    else:
        # It's a string (topic name)
        topic_name = str(topic_result)
        topic_obj = db.get_topic_by_name(topic_name)
    
    if topic_obj is None:
        topic_name = "Other"
        topic_obj = db.get_topic_by_name(topic_name)
    
    # Temporarily assign Topic object for event assignment
    post.topic = topic_obj
    
    # Assign post to events within the topic
    llm_client = LlmClient()
    event_assigning_service = EventAssigningService(llm_client)
    event_assigning_service.assign_posts_to_events(post)
    
    # Convert topic back to string for storage (as per Post model)
    post.topic = topic_name
    
    db.add_post(post)
    
    print("=" * 70)
    print(f"✅ POST ADDED TO DATABASE")
    print(f"UUID: {unique_id}")
    print(f"Filename: {filename}")
    print(f"Assigned Topic: {post.topic}")
    print(f"Text extracted (first 200 chars): {txt[:200] if len(txt) > 200 else txt}...")
    print(f"Total posts in database: {len(db.get_all_posts())}")
    print("=" * 70)
    
    return {"status": "ok", "uuid": unique_id}

@router.get("/engagement_data")
async def list_engagement_data():
    posts = db.get_all_posts()
    date_to_ratings = defaultdict(list)

    for post in posts:
        date_to_ratings[post.date].append(post.engagement_rating)

    datapoints = [
        {"date": date, "engagement_rating": sum(ratings) / len(ratings)}
        for date, ratings in date_to_ratings.items()
    ]

    sorted_datapoints = sorted(datapoints, key=lambda x: x["date"])
    return sorted_datapoints

