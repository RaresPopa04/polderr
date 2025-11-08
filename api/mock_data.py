"""
Mock data for the API
This will be replaced with real database calls later
"""

TOPICS_DATA = [
    {
        "id": "trash",
        "name": "Waste Management",
        "name_nl": "Afvalbeheer",
        "icon": "🗑️",
        "events": [
            {
                "id": 1,
                "name": "Missed trash collection complaints",
                "name_nl": "Klachten gemiste afvalinzameling",
                "small_summary": "Residents report multiple missed garbage pickups in their neighborhoods",
                "small_summary_nl": "Bewoners melden meerdere gemiste vuilnisophaalingen in hun buurten",
                "engagement": 892,
                "color": "#f59e0b",
                "data_points": [400, 450, 500, 550, 600, 700, 750, 800, 850, 892],
                "date": "2025-11-08",
                "total_posts": 15,
                "total_engagement": 892,
                "trend": "up"
            },
            {
                "id": 2,
                "name": "Recycling program expansion",
                "name_nl": "Uitbreiding recyclingprogramma",
                "small_summary": "Community feedback on new recycling initiatives and bin placement",
                "small_summary_nl": "Gemeenschapsfeedback over nieuwe recyclinginitiatieven en plaatsing van containers",
                "engagement": 1245,
                "color": "#8b5cf6",
                "data_points": [500, 600, 700, 800, 900, 950, 1000, 1100, 1200, 1245],
                "date": "2025-11-05",
                "total_posts": 23,
                "total_engagement": 1245,
                "trend": "up"
            },
            {
                "id": 3,
                "name": "Illegal dumping reports",
                "name_nl": "Meldingen illegaal dumpen",
                "small_summary": "Concerns about waste being dumped in public green spaces",
                "small_summary_nl": "Zorgen over afval dat wordt gedumpt in openbare groene ruimtes",
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
        "name_nl": "Verkeer",
        "icon": "🚗",
        "events": [
            {
                "id": 6,
                "name": "City center traffic safety concerns",
                "name_nl": "Zorgen over verkeersveiligheid centrum",
                "small_summary": "Public discussion about traffic safety measures in the city center",
                "small_summary_nl": "Publieke discussie over verkeersmaatregelen in het stadscentrum",
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
                "name_nl": "Parkeerproblemen",
                "small_summary": "Residents express concerns about limited parking availability",
                "small_summary_nl": "Bewoners uiten zorgen over beperkte parkeermogelijkheden",
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
        "name_nl": "Gezondheid & Welzijn",
        "icon": "🏥",
        "events": [
            {
                "id": 4,
                "name": "Mental health services discussion",
                "name_nl": "Discussie GGZ diensten",
                "small_summary": "Residents discuss wait times and access to mental health support",
                "small_summary_nl": "Bewoners bespreken wachttijden en toegang tot geestelijke gezondheidszorg",
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
                "name_nl": "Voorstellen sportfaciliteiten",
                "small_summary": "Community input on locations for new recreational facilities",
                "small_summary_nl": "Gemeenschap input over locaties voor nieuwe recreatieve voorzieningen",
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

