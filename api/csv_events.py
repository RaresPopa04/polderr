"""
CSV snapshot ingestion helpers for events API.
Each CSV in csv_timestamps is treated as a scrape; every row (post) becomes
an event with engagement values tracked per scrape.
"""
from __future__ import annotations

import csv
import json
import os
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import math
from pathlib import Path
from typing import Dict, List, Optional

CSV_DIR = Path(os.getenv("CSV_EVENTS_DIR", Path(__file__).resolve().parent.parent / "csv_timestamps"))
SNAPSHOT_INTERVAL_MINUTES = 20

EVENT_COLORS = [
    "#2563eb",
    "#f59e0b",
    "#10b981",
    "#8b5cf6",
    "#ef4444",
    "#0ea5e9",
    "#ec4899",
    "#14b8a6",
]


@dataclass
class SnapshotPoint:
    snapshot_index: int
    likes_total: int
    comments_total: int


@dataclass
class CsvEvent:
    """
    Representation of a single post tracked across snapshots.
    """

    id: int
    link: str
    message: str
    date_iso: str
    snapshots: Dict[int, SnapshotPoint] = field(default_factory=dict)
    latest_comments_payload: List[Dict[str, Optional[str]]] = field(default_factory=list)
    latest_likes: int = 0

    def add_snapshot(self, snapshot_index: int, likes: int, comments_payload: List[Dict[str, Optional[str]]]):
        total_likes = max(0, likes)
        total_comments = len(comments_payload)
        self.snapshots[snapshot_index] = SnapshotPoint(
            snapshot_index=snapshot_index,
            likes_total=total_likes,
            comments_total=total_comments,
        )
        self.latest_comments_payload = comments_payload
        self.latest_likes = total_likes

    def ensure_snapshot_coverage(self, total_snapshots: int):
        last_likes = 0
        last_comments = 0
        for idx in range(total_snapshots):
            if idx in self.snapshots:
                point = self.snapshots[idx]
                last_likes = point.likes_total
                last_comments = point.comments_total
            else:
                self.snapshots[idx] = SnapshotPoint(
                    snapshot_index=idx,
                    likes_total=last_likes,
                    comments_total=last_comments,
                )

    def to_dict(self) -> Dict:
        event_date = _parse_datetime(self.date_iso, fallback=datetime.utcnow())
        color = EVENT_COLORS[(self.id - 1) % len(EVENT_COLORS)]

        sorted_points = sorted(self.snapshots.values(), key=lambda p: p.snapshot_index)
        timeline: List[Dict] = []
        actual_engagement_points: List[float] = []
        prev_likes = None
        prev_comments = None
        prev_engagement = None

        for point in sorted_points:
            timestamp = event_date + timedelta(minutes=SNAPSHOT_INTERVAL_MINUTES * point.snapshot_index)
            total_engagement = point.likes_total + point.comments_total
            entry = {
                "timestamp": timestamp.isoformat(),
                "likes": point.likes_total,
                "comments": point.comments_total,
                "engagement": total_engagement,
                "likeReturn": _calc_log_return(prev_likes, point.likes_total),
                "commentReturn": _calc_log_return(prev_comments, point.comments_total),
                "engagementReturn": _calc_log_return(prev_engagement, total_engagement),
                "prediction": False,
            }
            timeline.append(entry)
            actual_engagement_points.append(total_engagement)
            prev_likes = point.likes_total
            prev_comments = point.comments_total
            prev_engagement = total_engagement

        data_points = actual_engagement_points or [0]
        latest_total_engagement = actual_engagement_points[-1] if actual_engagement_points else 0

        prediction_entries = _build_prediction_entries(
            sorted_points=sorted_points,
            event_date=event_date,
            prev_likes=prev_likes,
            prev_comments=prev_comments,
            prev_engagement=prev_engagement,
        )
        timeline.extend(prediction_entries)

        small_summary = self.message.strip()
        if len(small_summary) > 180:
            small_summary = small_summary[:177].rstrip() + "..."

        title = _derive_title(small_summary)
        source = _derive_source_from_link(self.link)

        post_entry = {
            "id": self.id,
            "title": title,
            "link": self.link,
            "source": source,
            "date": event_date.isoformat(),
            "engagement": latest_total_engagement,
            "content": self.message.strip(),
            "likes": self.latest_likes,
            "comments": self.latest_comments_payload,
        }

        return {
            "id": self.id,
            "name": title,
            "small_summary": small_summary,
            "big_summary": self.message.strip(),
            "engagement": latest_total_engagement,
            "color": color,
            "data_points": data_points,
            "date": event_date.isoformat(),
            "totalPosts": 1,
            "totalEngagement": latest_total_engagement,
            "trend": "up" if latest_total_engagement > 3 else "stable",
            "topic_id": "csv",
            "topic_name": "CSV Import",
            "topic_icon": "🗂️",
            "engagementTimeline": timeline,
            "likeCount": self.latest_likes,
            "commentCount": len(self.latest_comments_payload),
            "posts": [post_entry],
        }


def _derive_title(summary: str) -> str:
    if not summary:
        return "Untitled event"
    sentence = summary.split(".")[0].strip()
    if len(sentence) >= 12:
        return sentence
    return summary[:60].strip()


def _parse_comments(raw: str) -> List[Dict[str, Optional[str]]]:
    if not raw:
        return []

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        stripped = raw.strip().strip("[]")
        if not stripped:
            return []
        return [{"text": chunk.strip(), "timestamp": None} for chunk in stripped.split("||") if chunk.strip()]

    comments: List[Dict[str, Optional[str]]] = []
    for entry in parsed:
        if isinstance(entry, dict):
            comments.append(
                {
                    "text": str(entry.get("text", "")).strip(),
                    "timestamp": entry.get("timestamp"),
                }
            )
        else:
            comments.append({"text": str(entry).strip(), "timestamp": None})
    return comments


def _parse_datetime(value: Optional[str], fallback: datetime) -> datetime:
    if not value:
        return fallback
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return fallback


def _derive_source_from_link(link: str) -> str:
    if not link:
        return "Unknown Source"
    domain = link.split("//")[-1].split("/")[0]
    return domain or "Unknown Source"


def _calc_log_return(previous: Optional[float], current: float) -> float:
    if previous is None or previous <= 0 or current <= 0:
        return 0.0
    return math.log(current / previous)


def _exponential_smoothing(values: List[float], alpha: float = 0.5) -> float:
    if not values:
        return 0.0
    smoothed = values[0]
    for value in values[1:]:
        smoothed = alpha * value + (1 - alpha) * smoothed
    return smoothed


def _average_log_return(series: List[float], window: int = 3) -> float:
    returns: List[float] = []
    for previous, current in zip(series, series[1:]):
        if previous > 0 and current > 0:
            returns.append(math.log(current / previous))
    if not returns:
        return 0.0
    windowed = returns[-window:]
    return sum(windowed) / len(windowed)


def _project_next_value(current: float, avg_return: float) -> float:
    if current <= 0:
        current = 0.01
    projected = current * math.exp(avg_return)
    return max(projected, 0.0)


def _build_prediction_entries(
    sorted_points: List[SnapshotPoint],
    event_date: datetime,
    prev_likes: Optional[float],
    prev_comments: Optional[float],
    prev_engagement: Optional[float],
) -> List[Dict]:
    if not sorted_points:
        return []

    steps = int(os.getenv("CSV_PREDICTION_STEPS", 5))
    alpha = float(os.getenv("CSV_PREDICTION_ALPHA", 0.5))
    likes_series = [point.likes_total for point in sorted_points]
    comments_series = [point.comments_total for point in sorted_points]
    engagement_series = [point.likes_total + point.comments_total for point in sorted_points]

    # Use exponential smoothing to establish baseline, then project forward
    baseline_likes = max(_exponential_smoothing(likes_series, alpha), 0.01)
    baseline_comments = max(_exponential_smoothing(comments_series, alpha), 0.01)
    baseline_engagement = max(_exponential_smoothing(engagement_series, alpha), 0.01)

    avg_like_return = _average_log_return(likes_series)
    avg_comment_return = _average_log_return(comments_series)
    avg_engagement_return = _average_log_return(engagement_series)

    last_index = sorted_points[-1].snapshot_index
    predictions: List[Dict] = []

    current_likes = max(likes_series[-1], baseline_likes)
    current_comments = max(comments_series[-1], baseline_comments)
    current_engagement = max(engagement_series[-1], baseline_engagement)

    prev_like_for_return = prev_likes
    prev_comment_for_return = prev_comments
    prev_engagement_for_return = prev_engagement

    for step in range(1, steps + 1):
        current_likes = _project_next_value(current_likes, avg_like_return)
        current_comments = _project_next_value(current_comments, avg_comment_return)
        current_engagement = _project_next_value(current_engagement, avg_engagement_return)

        timestamp = event_date + timedelta(minutes=SNAPSHOT_INTERVAL_MINUTES * (last_index + step))
        entry = {
            "timestamp": timestamp.isoformat(),
            "likes": current_likes,
            "comments": current_comments,
            "engagement": current_engagement,
            "likeReturn": _calc_log_return(prev_like_for_return, current_likes),
            "commentReturn": _calc_log_return(prev_comment_for_return, current_comments),
            "engagementReturn": _calc_log_return(prev_engagement_for_return, current_engagement),
            "prediction": True,
        }
        predictions.append(entry)

        prev_like_for_return = current_likes
        prev_comment_for_return = current_comments
        prev_engagement_for_return = current_engagement

    return predictions


def _load_csv_events_internal() -> List[CsvEvent]:
    if not CSV_DIR.exists():
        return []

    csv_files = sorted(CSV_DIR.glob("*.csv"))
    snapshot_count = len(csv_files)
    events_by_link: Dict[str, CsvEvent] = {}
    next_id = 1

    for snapshot_index, csv_file in enumerate(csv_files):
        with csv_file.open("r", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                link = row.get("link", "") or f"event-{next_id}"
                comments_payload = _parse_comments(row.get("comments_json", "") or "")
                likes = _safe_int(row.get("likes", 0))
                message = row.get("message", "")
                date_iso = row.get("date_iso8601", "") or datetime.utcnow().isoformat()

                if link not in events_by_link:
                    events_by_link[link] = CsvEvent(
                        id=next_id,
                        link=link,
                        message=message,
                        date_iso=date_iso,
                    )
                    next_id += 1

                event = events_by_link[link]
                event.message = message or event.message
                event.date_iso = date_iso or event.date_iso
                event.add_snapshot(snapshot_index, likes, comments_payload)

    for event in events_by_link.values():
        event.ensure_snapshot_coverage(snapshot_count)

    return sorted(events_by_link.values(), key=lambda event: event.id)


def _safe_int(value: Optional[str], default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


_CSV_EVENTS_CACHE: List[CsvEvent] = []


def _ensure_cache():
    global _CSV_EVENTS_CACHE
    if not _CSV_EVENTS_CACHE:
        _CSV_EVENTS_CACHE = _load_csv_events_internal()


def get_csv_events() -> List[Dict]:
    _ensure_cache()
    return [event.to_dict() for event in _CSV_EVENTS_CACHE]


def get_csv_event_by_id(event_id: int) -> Optional[Dict]:
    _ensure_cache()
    for event in _CSV_EVENTS_CACHE:
        if event.id == event_id:
            return event.to_dict()
    return None
