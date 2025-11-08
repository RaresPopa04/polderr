"""
Mock data for the API
This will be replaced with real database calls later
"""

TOPICS_DATA = [
    {
        "id": "trash",
        "name": "Waste Management",
        "icon": "🗑️",
        "events": [
            {
                "id": 1,
                "name": "Missed trash collection complaints",
                "small_summary": "Residents report multiple missed garbage pickups in their neighborhoods",
                "big_summary": "Multiple residents across different neighborhoods have reported that their scheduled garbage collections have been missed. The complaints have been increasing over the past week, with particular concerns about recycling bins not being emptied. The municipality is investigating the cause of these service disruptions and working to resolve the issue quickly.",
                "engagement": 892,
                "color": "#f59e0b",
                "data_points": [400, 450, 500, 550, 600, 700, 750, 800, 850, 892],
                "date": "2025-11-08",
                "total_posts": 15,
                "total_engagement": 892,
                "trend": "up",
                "engagementData": [
                    {"date": "2025-10-30", "engagement": 400, "predicted": None},
                    {"date": "2025-10-31", "engagement": 450, "predicted": None},
                    {"date": "2025-11-01", "engagement": 500, "predicted": None},
                    {"date": "2025-11-02", "engagement": 550, "predicted": None},
                    {"date": "2025-11-03", "engagement": 600, "predicted": None},
                    {"date": "2025-11-04", "engagement": 700, "predicted": None},
                    {"date": "2025-11-05", "engagement": 750, "predicted": None},
                    {"date": "2025-11-06", "engagement": 800, "predicted": None},
                    {"date": "2025-11-07", "engagement": 850, "predicted": None},
                    {"date": "2025-11-08", "engagement": 892, "predicted": None},
                    {"date": "2025-11-09", "engagement": None, "predicted": 920},
                    {"date": "2025-11-10", "engagement": None, "predicted": 950},
                    {"date": "2025-11-11", "engagement": None, "predicted": 980},
                    {"date": "2025-11-12", "engagement": None, "predicted": 1000}
                ],
                "posts": [
                    {
                        "id": 1,
                        "title": "Missed collection on Parkstraat",
                        "link": "https://facebook.com/rijswijk-nieuws/posts/123456",
                        "source": "Facebook - Rijswijk News",
                        "date": "2025-11-08",
                        "engagement": 234,
                        "content": "Our street hasn't had trash pickup for two weeks now. When will this be addressed?"
                    },
                    {
                        "id": 2,
                        "title": "Recycling bins not emptied",
                        "link": "https://twitter.com/rijswijk_veilig/status/987654",
                        "source": "Twitter - Local Resident",
                        "date": "2025-11-07",
                        "engagement": 156,
                        "content": "Recycling bins have been sitting full for over a week. This is unacceptable."
                    },
                    {
                        "id": 3,
                        "title": "Service interruption notice",
                        "link": "https://instagram.com/p/abc123",
                        "source": "Instagram - Municipality",
                        "date": "2025-11-06",
                        "engagement": 502,
                        "content": "We're aware of recent service disruptions and are working to resolve them."
                    }
                ]
            },
            {
                "id": 2,
                "name": "Recycling program expansion",
                "small_summary": "Community feedback on new recycling initiatives and bin placement",
                "big_summary": "The municipality has announced an expansion of the recycling program, including new bin types and collection schedules. Community members are actively discussing the placement of bins and the feasibility of the new sorting requirements.",
                "engagement": 1245,
                "color": "#8b5cf6",
                "data_points": [500, 600, 700, 800, 900, 950, 1000, 1100, 1200, 1245],
                "date": "2025-11-05",
                "total_posts": 23,
                "total_engagement": 1245,
                "trend": "up",
                "engagementData": [
                    {"date": "2025-10-27", "engagement": 500, "predicted": None},
                    {"date": "2025-10-28", "engagement": 600, "predicted": None},
                    {"date": "2025-10-29", "engagement": 700, "predicted": None},
                    {"date": "2025-10-30", "engagement": 800, "predicted": None},
                    {"date": "2025-10-31", "engagement": 900, "predicted": None},
                    {"date": "2025-11-01", "engagement": 950, "predicted": None},
                    {"date": "2025-11-02", "engagement": 1000, "predicted": None},
                    {"date": "2025-11-03", "engagement": 1100, "predicted": None},
                    {"date": "2025-11-04", "engagement": 1200, "predicted": None},
                    {"date": "2025-11-05", "engagement": 1245, "predicted": None},
                    {"date": "2025-11-06", "engagement": None, "predicted": 1280},
                    {"date": "2025-11-07", "engagement": None, "predicted": 1310},
                    {"date": "2025-11-08", "engagement": None, "predicted": 1340},
                    {"date": "2025-11-09", "engagement": None, "predicted": 1370}
                ],
                "posts": [
                    {
                        "id": 4,
                        "title": "New recycling bins are too small",
                        "link": "https://facebook.com/groups/rijswijk/posts/789",
                        "source": "Facebook - Community Group",
                        "date": "2025-11-05",
                        "engagement": 412,
                        "content": "The new recycling bins don't have enough capacity for a family of four."
                    },
                    {
                        "id": 5,
                        "title": "Great initiative!",
                        "link": "https://twitter.com/eco_rijswijk/status/456",
                        "source": "Twitter - Environmental Group",
                        "date": "2025-11-04",
                        "engagement": 567,
                        "content": "Love the expanded recycling program. More sorting options means less waste!"
                    },
                    {
                        "id": 6,
                        "title": "Bin placement concerns",
                        "link": "https://nextdoor.com/posts/abc",
                        "source": "Nextdoor - Neighborhood",
                        "date": "2025-11-03",
                        "engagement": 266,
                        "content": "Where should we place the new bins? They take up a lot of space."
                    }
                ]
            },
            {
                "id": 3,
                "name": "Illegal dumping reports",
                "small_summary": "Concerns about waste being dumped in public green spaces",
                "engagement": 456,
                "color": "#ec4899",
                "data_points": [200, 250, 280, 300, 320, 350, 380, 400, 430, 456],
                "date": "2025-11-02",
                "total_posts": 8,
                "total_engagement": 456,
                "trend": "stable"
            }
        ],
        "actionables": {
            "misinformation": 3,
            "questions": 7
        }
    },
    {
        "id": "traffic",
        "name": "Traffic",
        "icon": "🚗",
        "events": [
            {
                "id": 6,
                "name": "City center traffic safety concerns",
                "small_summary": "Public discussion about traffic safety measures in the city center",
                "engagement": 591,
                "color": "#3b82f6",
                "data_points": [300, 350, 380, 420, 450, 480, 510, 540, 570, 591],
                "date": "2025-11-08",
                "total_posts": 10,
                "total_engagement": 591,
                "trend": "up"
            },
            {
                "id": 7,
                "name": "Parking issues",
                "small_summary": "Residents express concerns about limited parking availability",
                "engagement": 423,
                "color": "#f59e0b",
                "data_points": [150, 200, 250, 280, 310, 340, 370, 390, 410, 423],
                "date": "2025-11-06",
                "total_posts": 8,
                "total_engagement": 423,
                "trend": "stable"
            }
        ],
        "actionables": {
            "misinformation": 1,
            "questions": 5
        }
    },
    {
        "id": "health",
        "name": "Health & Wellbeing",
        "icon": "🏥",
        "events": [
            {
                "id": 4,
                "name": "Mental health services discussion",
                "small_summary": "Residents discuss wait times and access to mental health support",
                "engagement": 678,
                "color": "#10b981",
                "data_points": [300, 350, 400, 450, 500, 550, 600, 630, 660, 678],
                "date": "2025-11-07",
                "total_posts": 12,
                "total_engagement": 678,
                "trend": "up"
            },
            {
                "id": 5,
                "name": "Sports facility proposals",
                "small_summary": "Community input on locations for new recreational facilities",
                "engagement": 934,
                "color": "#06b6d4",
                "data_points": [400, 500, 600, 650, 700, 750, 800, 850, 900, 934],
                "date": "2025-11-04",
                "total_posts": 18,
                "total_engagement": 934,
                "trend": "stable"
            }
        ],
        "actionables": {
            "misinformation": 2,
            "questions": 4
        }
    }
]


def get_all_topics():
    """Get all topics with their events"""
    return TOPICS_DATA


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

