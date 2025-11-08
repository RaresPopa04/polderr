import datetime
from llm import find_topic_for_post
from models import Post, Topic


if __name__ == "__main__":
    post = Post(
        content="The city is experiencing a lot of traffic jams lately. The roads are clogged with cars and the streets are gridlocked. The city is trying to find a solution to the problem. The city is trying to find a solution to the problem.",
        link="",
        date=datetime.datetime.now(),
        source="Twitter",
    )
    print(find_topic_for_post(post, topics=[Topic(name="Traffic", topic_id=1, events=[]), Topic(name="Environment", topic_id=2, events=[])]))