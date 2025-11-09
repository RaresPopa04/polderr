import datetime
from Services.EventAssigningService import EventAssigningService
from database import db
from database.in_memory_db import InMemoryDB
from llm.LlmClient import LlmClient
from llm.find_topic_for_post import find_topic_for_post
from models import Event
from models.Post import Post
from models.Topic import Topic

# trafic
post1 = Post(
        content="The city is experiencing a lot of traffic jams lately. The roads are clogged with cars and the streets are gridlocked. The city is trying to find a solution to the problem. The city is trying to find a solution to the problem.",
        link="niggaer",
        date=datetime.datetime.now(),
        source="Twitter",
    )

# environment
post2 = Post(
    content="The city is experiencing a lot of pollution lately. The air is thick with smoke and the streets are clogged with cars. The city is trying to find a solution to the problem. The city is trying to find a solution to the problem.",
    link="",
    date=datetime.datetime.now(),
    source="Twitter",
)

# traffic
# event1 = Event(
#     posts = [],
#     name = "Bad traffic couse the bmw broke down in the middle of the highway",
# )

# # environment
# event2 = Event(

# )

def test_find_topic_for_post():
    print(find_topic_for_post(post1, topics=[Topic(name="Traffic", topic_id=1, events=[]), Topic(name="Environment", topic_id=2, events=[])]))

def test_find_event_for_post():
    pass

def test_get_raport_for_event():
    db.add_post(post1)
    llm_client = LlmClient()
    event_assigning_service = EventAssigningService(llm_client)
    event_assigning_service.assign_posts_to_events(post1)


    print("posts: ", db.get_all_posts())
    print("events: ", db.get_all_events())
    print("topics: ", db.get_all_topics())
    print("raport for event: ", db.get_raport_for_event(post1.link))

def test_serialization_and_deserialization():
    from pydantic import TypeAdapter
    from models.Keyword import Keyword
    
    # Create keywords
    keywords = [Keyword(keyword="Rijswijk", emb=[0.1, 0.2, 0.3]), Keyword(keyword="Traffic", emb=[0.4, 0.5, 0.6])]
    
    # Serialize to JSON
    adapter = TypeAdapter(list[Keyword])
    json_str = adapter.dump_json(keywords, indent=2).decode('utf-8')
    print("Serialized:", json_str)
    
    # Load from JSON
    loaded = adapter.validate_json(json_str)
    print("Loaded:", [k.keyword for k in loaded])

if __name__ == "__main__":
    # test_find_topic_for_post()
    
    # test_get_raport_for_event()

    # test_serialization_and_deserialization()