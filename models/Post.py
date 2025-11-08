import json
import os
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Tuple

from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.LlmClient import LlmClient
from llm.PromptTemplates.Prompts import build_sentiment_prompt, event_find_actionable_exerpts_prompt
from models.Actionable import Actionable
from llm.PromptTemplates.BelastingdienstData import _belastingdienst_data


@dataclass
class Post:
    link: str
    content: str
    date: datetime
    source: str
    satisfaction_rating: int
    engagement_rating: List[Tuple[datetime, int]]
    actionables: List[Actionable]
    post_id: Optional[int] = field(default=None)
    topic: Optional[str] = field(default=None)
    
    def __init__(self, link: str, content: str, date: datetime, source: str):
        from llm.find_topic_for_post import find_topic_for_post
        from database import db
        topics = db.get_all_topics()

        self.link = link
        self.content = content
        self.date = date
        self.source = source
        
        llm_client = LlmClient()
        self.satisfaction_rating = self.get_sentiment_score(content, llm_client)
        self.engagement_rating = []
        self.actionables = []
        self.topic = find_topic_for_post(self, topics)

        self.actionables = self.generate_actionables(llm_client)

    def get_sentiment_score(self, content: str, llm_client: LlmClient) -> int:
        sentiment_score = int(llm_client.generate_response(AzerionPromptTemplate(
                            prompt = build_sentiment_prompt(content))))
        return max(0, min(100, sentiment_score))

    def generate_actionables(self, llm_client):
        find_actionables_prompt = event_find_actionable_exerpts_prompt.format(post_data=self.content, all_the_belastingdienst_data= _belastingdienst_data)

        actionables_exerpts = llm_client.generate_response(AzerionPromptTemplate(prompt=find_actionables_prompt))

        actionables_exerpts = actionables_exerpts.split('$')

        actionables_list = []
        for actionable in actionables_exerpts:
            if actionable :
                actionables_list.append(Actionable(actionable_id=str(len(actionables_exerpts))+self.link, base_link=self.link, content=actionable))

        return actionables_list

    def __str__(self) -> dict:
        return {
            "link": self.link,
            "content": self.content,
            "date": self.date.isoformat(),
            "source": self.source,
            "satisfaction_rating": self.satisfaction_rating,
            "engagement_rating": [
                (dt.isoformat(), val) for dt, val in self.engagement_rating
            ],
            "actionables": [a.to_json() for a in self.actionables],
            "post_id": self.post_id,
            "topic": self.topic
        }

    @classmethod
    def from_json(cls, data: dict):
        from datetime import datetime

        obj = cls.__new__(cls)
        obj.link = data.get("link")
        obj.content = data.get("content")
        obj.date = datetime.fromisoformat(data["date"]) if data.get("date") else None
        obj.source = data.get("source")
        obj.satisfaction_rating = data.get("satisfaction_rating", 0)
        obj.engagement_rating = [
            (datetime.fromisoformat(dt), val) for dt, val in data.get("engagement_rating", [])
        ]
        obj.actionables = [Actionable.from_json(json.load(a)) for a in data.get("actionables", [])]
        obj.post_id = data.get("post_id")
        obj.topic = data.get("topic")
        return obj

    def to_json(self):
        return json.dumps(self.__str__())

    @staticmethod
    def save_to_json(posts: List['Post'], filename: str = "dataset/persistence/posts.json"):
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        with open(filename, "w", encoding="utf-8") as f:
            json.dump([p.__str__() for p in posts], f, ensure_ascii=False, indent=2)


    @staticmethod
    def parse_from_json(filename: str = "dataset/persistence/posts.json") -> List['Post']:
        if not os.path.exists(filename):
            return []

        with open(filename, "r", encoding="utf-8") as f:
            data = json.load(f)
            return [Post.from_json(item) for item in data]