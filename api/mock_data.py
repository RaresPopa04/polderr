"""
Mock data for the API
This will be replaced with real database calls later
"""


def get_topic_by_id(topic_id: str):
    """Get a specific topic by ID"""
    for topic in TOPICS_DATA:
        if topic["id"] == topic_id:
            return topic
    return None


def get_event_by_id(event_id: int):
    """Get a specific event by ID"""
    for topic in TOPICS_DATA:
        for event in topic["events"]:
            if event["id"] == event_id:
                return event
    return None

