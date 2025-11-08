import json
import os
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.LlmClient import LlmClient
from llm.PromptTemplates.Prompts import event_name_prompt, event_keywords_prompt, event_big_summary_prompt, \
    event_small_summary_prompt
from llm.SemanticSimilarityService import SemanticSimilarityService
from models.Keyword import Keyword
from models.Post import Post

# the date of an event is the date of the latest post (biggest post date)
# event_id: int,
# name: str,
# small_summary: str = '',
# big_summary: str = '',
# posts: List[Post] = None,
# similar_events=None,
# keywords: List[Keyword] = None,
@dataclass
class Event:
    _minimum_event_similarity_threshold = 0.7
    _minimum_words_in_common = 2

    event_id: Optional[int] = field(default=None)
    name: Optional[str] = field(default=None)
    small_summary: Optional[str] = field(default=None)
    big_summary: Optional[str] = field(default=None)
    posts: Optional[List[Post]] = field(default=None)
    similar_events: Optional[List['Event']] = field(default=None)
    keywords: Optional[List[Keyword]] = field(default=None)

    def __init__(self,posts: List[Post] = None, other_events: List['Event'] = []):
        self.posts = posts

        llm_client = LlmClient()
        self.name = self.extract_name_from_posts(llm_client)
        
        (self.small_summary, self.big_summary) = self.generate_summaries(llm_client)
        self.similar_events = self.find_similar_events(llm_client, other_events)
        self.keywords = self.extract_keywords(llm_client)
        self.date = self.find_most_recent_post_date()


    def __repr__(self):
        return f"Event(event_id={self.event_id}, name={self.name}, small_summary={self.small_summary}, big_summary={self.big_summary}, posts={self.posts}, similar_events={self.similar_events}, keywords={self.keywords})"
    # add the post to posts and regenerate everything
    def add_post(self, post: Post, other_events: List['Event'] = []):
        llm_client = LlmClient()
        self.posts += [post]

        self.keywords = self.extract_keywords(llm_client)
        (self.small_summary, self.big_summary) = self.generate_summaries(llm_client)
        self.similar_events = self.find_similar_events(llm_client, other_events)
        self.date = self.find_most_recent_post_date()
        
    def get_event_topic(self) -> str:
        if not self.posts:
            return None
        return self.posts[0].topic

    def find_most_recent_post_date(self) -> datetime:
        if not self.posts:
            return datetime.now()

        return max(post.date for post in self.posts)

    def extract_name_from_posts(self, llm_client) -> str:
        if not self.posts:
            return "Unnamed Event"
        
        total_context = ''
        for post in self.posts:
            total_context += post.content + ' '

        name_find_prompt = event_name_prompt.format(event_posts=total_context)

        name = llm_client.generate_response(AzerionPromptTemplate(prompt=name_find_prompt))

        return name

    def extract_keywords(self, llm_client: LlmClient) -> List[Keyword]:
        if not self.posts:
            return []
        
        total_context = ''
        for post in self.posts:
            total_context += post.content + ' '

        keywords_find_prompt = event_keywords_prompt.format(event_posts=total_context)

        keywords = llm_client.generate_response(AzerionPromptTemplate(prompt=keywords_find_prompt))

        kw_list = keywords.split(',')

        kws = []
        embedding_service = SemanticSimilarityService(llm_client)

        for kw in kw_list:
            embedding = embedding_service.embed(kw)
            kws.append(Keyword(kw, embedding))

        return kws

    def generate_summaries(self, llm_client: LlmClient):
        return self.generate_small_summary(llm_client), self.generate_large_summary(llm_client)

    def generate_small_summary(self, llm_client: LlmClient):
        if not self.posts:
            return "No summary available"
        
        total_context = ''
        for post in self.posts:
            total_context += post.content + ' '

        small_summary_find_prompt = event_small_summary_prompt.format(event_posts=total_context)

        small_summary = llm_client.generate_response(AzerionPromptTemplate(prompt=small_summary_find_prompt))

        return small_summary

    def generate_large_summary(self, llm_client: LlmClient):
        if not self.posts:
            return "No summary available"
        
        total_context = ''
        for post in self.posts:
            total_context += post.content + ' '

        big_summary_find_prompt = event_big_summary_prompt.format(event_posts=total_context)

        big_summary = llm_client.generate_response(AzerionPromptTemplate(prompt=big_summary_find_prompt))

        return big_summary

    def find_similar_events(self, llm_client: LlmClient, other_events: List['Event'] = []):
        sim_events = []
        for event in other_events:
            if self.events_are_similar(event, llm_client):
                sim_events.append(event)

        return sim_events

    # we chose similar keywords in the end
    def events_are_similar(self, other_event: 'Event', llm_client: LlmClient) -> float:
        if self.event_id and other_event.event_id == self.event_id:
            return False # don't add the same event in event_similarity !!

        # Safety checks
        if not self.keywords or not other_event.keywords:
            return False

        # how many keywords do they have in common ?
        # one keyword is in common if it has cosine similarity > _min_event_treshold

        semantic_similarity_service = SemanticSimilarityService(llm_client)

        kws_in_common = 0

        for kw1 in self.keywords:
            for kw2 in other_event.keywords:
                cosine_similarity = semantic_similarity_service.cosine_similarity(kw1.emb, kw2.emb)
                if cosine_similarity > self._minimum_event_similarity_threshold:
                    kws_in_common += 1

        return kws_in_common >= self._minimum_words_in_common

    def __str__(self) -> dict:
        return {
            "event_id": self.event_id,
            "name": self.name,
            "small_summary": self.small_summary,
            "big_summary": self.big_summary,
            "similar_events": [e.event_id for e in self.similar_events],
            "keywords": [k.to_json() for k in self.keywords],
            "date": self.date.isoformat() if self.date else None,
            "posts": [p.to_json() for p in self.posts] if self.posts else []
        }

    # return a dict, not a JSON string – keeps it compatible with json.dump
    def to_json(self) -> dict:
        return self.__str__()

    @classmethod
    def from_json(cls, data: dict) -> "Event":
        obj = cls.__new__(cls)

        # class-level fields
        obj._minimum_event_similarity_threshold = cls._minimum_event_similarity_threshold
        obj._minimum_words_in_common = cls._minimum_words_in_common

        # simple fields
        obj.event_id = data.get("event_id")
        obj.name = data.get("name")
        obj.small_summary = data.get("small_summary")
        obj.big_summary = data.get("big_summary")

        date_str = data.get("date")
        obj.date = datetime.fromisoformat(date_str) if date_str else None

        # similar_events is stored as list of event_ids; recreate lightweight stubs
        obj.similar_events = []
        for eid in data.get("similar_events", []):
            se = cls.__new__(cls)
            se.event_id = eid
            se.name = None
            se.small_summary = None
            se.big_summary = None
            se.date = None
            se.similar_events = []
            se.keywords = []
            se.posts = []
            obj.similar_events.append(se)

        # nested objects
        obj.keywords = [Keyword.from_json(k) for k in data.get("keywords", [])]
        obj.posts = [Post.from_json(p) for p in data.get("posts", [])]

        return obj

    @staticmethod
    def save_to_json(events: List['Event'], filename: str = "dataset/persistence/events.json"):
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        with open(filename, "w", encoding="utf-8") as f:
            json.dump([e.to_json() for e in events], f, ensure_ascii=False, indent=2)

    @staticmethod
    def parse_from_json(filename: str = "dataset/persistence/events.json") -> List['Event']:
        if not os.path.exists(filename):
            return []
        with open(filename, "r", encoding="utf-8") as f:
            data = json.load(f)
        return [Event.from_json(item) for item in data]

