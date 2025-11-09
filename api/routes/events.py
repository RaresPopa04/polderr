"""
Events API endpoints
"""
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException

from api.csv_events import get_csv_event_by_id, get_csv_events
from database import db

router = APIRouter()

_TOPIC_COLOR_FALLBACK = "#3b82f6"
_TOPIC_COLORS = [
    "#2563eb",
    "#0ea5e9",
    "#10b981",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#8b5cf6",
    "#14b8a6",
    "#9333ea",
]


def _calc_return(previous: Optional[float], current: float) -> float:
    if previous is None or previous <= 0:
        return 0.0
    if current <= 0:
        return -1.0
    return (current - previous) / previous


def _serialize_post(post) -> Dict[str, Any]:
    engagement_total = 0
    if getattr(post, "engagement_rating", None):
        engagement_total = sum(value for _, value in post.engagement_rating)

    title_source = post.content.strip().split(".")[0].strip()
    title = title_source if len(title_source) >= 12 else post.content[:80].strip() or "Post"

    return {
        "id": post.link,
        "title": title,
        "link": post.link,
        "source": post.source,
        "date": post.date.isoformat() if isinstance(post.date, datetime) else None,
        "engagement": engagement_total,
        "content": post.content,
    }


def _find_topic_for_event(event_id: int):
    for topic in db.get_all_topics():
        for event in topic.events:
            if event.event_id == event_id:
                return topic
    return None


def _derive_topic_color(topic_id: Optional[int]) -> str:
    if not topic_id:
        return _TOPIC_COLOR_FALLBACK
    index = (topic_id - 1) % len(_TOPIC_COLORS)
    return _TOPIC_COLORS[index]


def _estimate_post_activity(post) -> Dict[str, float]:
    """
    Estimate engagement metrics for a post.
    Prefers explicit engagement_rating data, otherwise derives values heuristically.
    """
    engagement_series = getattr(post, "engagement_rating", None) or []

    if engagement_series:
        latest_value = engagement_series[-1][1]
        likes = max(1, int(latest_value * 0.65))
        comments = max(0, latest_value - likes)
        return {"likes": float(likes), "comments": float(comments)}

    word_count = len((post.content or "").split())
    satisfaction = getattr(post, "satisfaction_rating", 60) or 60
    actionable_count = len(getattr(post, "actionables", []) or [])

    base_engagement = max(8, word_count // 18)
    sentiment_boost = 0.7 + (satisfaction / 250)
    likes = max(5, int(base_engagement * sentiment_boost))
    comments = max(1, actionable_count * 3)

    return {"likes": float(likes), "comments": float(comments)}


def _build_engagement_timeline(event) -> List[Dict[str, Any]]:
    timeline_points: List[Dict[str, Any]] = []
    aggregated: Dict[datetime, Dict[str, float]] = {}

    posts = event.posts or []
    for post in posts:
        timestamp = post.date if isinstance(post.date, datetime) else None
        if not timestamp:
            continue

        metrics = _estimate_post_activity(post)
        bucket = aggregated.setdefault(timestamp, {"likes": 0.0, "comments": 0.0})
        bucket["likes"] += metrics["likes"]
        bucket["comments"] += metrics["comments"]

    if not aggregated:
        return timeline_points

    prev_like = prev_comment = prev_engagement = None
    for timestamp in sorted(aggregated.keys()):
        data = aggregated[timestamp]
        likes_value = data["likes"]
        comments_value = data["comments"]
        engagement_value = likes_value + comments_value
        entry = {
            "timestamp": timestamp.isoformat(),
            "likes": likes_value,
            "comments": comments_value,
            "engagement": engagement_value,
            "likeReturn": _calc_return(prev_like, likes_value),
            "commentReturn": _calc_return(prev_comment, comments_value),
            "engagementReturn": _calc_return(prev_engagement, engagement_value),
            "prediction": False,
        }
        timeline_points.append(entry)
        prev_like = likes_value
        prev_comment = comments_value
        prev_engagement = engagement_value

    return timeline_points


def _serialize_db_event(event, topic=None) -> Dict[str, Any]:
    if topic is None:
        topic = _find_topic_for_event(event.event_id or 0)
    posts = event.posts or []
    total_posts = len(posts)
    timeline = _build_engagement_timeline(event)
    data_points = [point["engagement"] for point in timeline] or [0]
    total_engagement = int(sum(data_points))
    event_date = event.date.isoformat() if getattr(event, "date", None) else None
    trend = "up"
    if getattr(event, "date", None):
        is_recent = (datetime.now() - event.date).days < 2
        trend = "up" if is_recent else "stable"

    return {
        "id": event.event_id,
        "name": event.name,
        "small_summary": event.small_summary or "No summary available",
        "big_summary": event.big_summary or "",
        "engagement": total_engagement,
        "color": _derive_topic_color(topic.topic_id if topic else None),
        "data_points": data_points,
        "date": event_date,
        "totalPosts": total_posts,
        "totalEngagement": total_engagement,
        "trend": trend,
        "topic_id": topic.topic_id if topic else None,
        "topic_name": topic.name if topic else None,
        "topic_icon": topic.icon if topic else "🗂️",
        "engagementTimeline": timeline,
        "posts": [_serialize_post(post) for post in posts],
    }


@router.get("/events")
async def list_events():
    """
    Get list of all events across all topics
    """
    csv_events = get_csv_events()
    if csv_events:
        return {"events": csv_events}

    events = []
    for topic in db.get_all_topics():
        for event in topic.events:
            events.append(_serialize_db_event(event, topic))

    return {"events": events}


@router.get("/events/{event_id}")
async def get_event(event_id: int):
    """
    Get a specific event by ID
    """
    db_event = db.get_event_by_id(event_id)

    if db_event:
        topic = _find_topic_for_event(event_id)
        response = _serialize_db_event(db_event, topic)
        response["topic"] = {
            "id": response.get("topic_id"),
            "name": response.get("topic_name"),
            "icon": response.get("topic_icon"),
        }
        return response

    event = get_csv_event_by_id(event_id)
    if event:
        event["topic"] = {
            "id": event.get("topic_id"),
            "name": event.get("topic_name"),
            "icon": event.get("topic_icon", "🗂️")
        }
        return event

    raise HTTPException(status_code=404, detail="Event not found")


@router.get("/events/{event_id}/engagement")
async def get_event_engagement(event_id: int):
    """
    Return engagement timeline points for a specific event.
    """
    csv_event = get_csv_event_by_id(event_id)
    if csv_event:
        return {
            "event_id": event_id,
            "timeline": csv_event.get("engagementTimeline", []),
        }

    db_event = db.get_event_by_id(event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    timeline = _build_engagement_timeline(db_event)
    return {
        "event_id": event_id,
        "timeline": timeline
    }
