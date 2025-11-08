import datetime
from database.in_memory_db import InMemoryDB
from llm import find_topic_for_post
from models import Post, Topic

post1 = Post(
        content="The city is experiencing a lot of traffic jams lately. The roads are clogged with cars and the streets are gridlocked. The city is trying to find a solution to the problem. The city is trying to find a solution to the problem.",
        link="",
        date=datetime.datetime.now(),
        source="Twitter",
    )

def test_find_topic_for_post():
    print(find_topic_for_post(post1, topics=[Topic(name="Traffic", topic_id=1, events=[]), Topic(name="Environment", topic_id=2, events=[])]))

def test_get_raport_for_event():
    db = InMemoryDB()
    db.add_post(post1)
    print(post1.post_id)
    print(db.get_raport_for_event(post1.post_id))

if __name__ == "__main__":
    # test_find_topic_for_post()
    
    test_get_raport_for_event()