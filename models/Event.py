from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional
from dataclasses_json import dataclass_json, config

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
@dataclass_json
@dataclass
class Event:
    _minimum_event_similarity_threshold = 0.7
    _minimum_words_in_common = 2

    event_id: Optional[int] = None
    name: Optional[str] = None
    small_summary: Optional[str] = None
    big_summary: Optional[str] = None
    # Serialize posts as just links, not full objects
    posts: Optional[List[Post]] = field(default=None, metadata=config(
        encoder=lambda posts: [p.link for p in posts] if posts else [],
        decoder=lambda links: []  # We'll handle reconstruction separately
    ))
    # Serialize similar_events as just IDs
    similar_events: Optional[List['Event']] = field(default=None, metadata=config(
        encoder=lambda events: [e.event_id for e in events if e and e.event_id] if events else [],
        decoder=lambda ids: []  # We'll handle reconstruction separately
    ))
    keywords: Optional[List[Keyword]] = None
    date: Optional[datetime] = None

    @classmethod
    def create_with_enrichment(cls, posts: List[Post] = None, other_events: List['Event'] = None) -> 'Event':
        """Factory method to create an Event with LLM enrichment"""
        if other_events is None:
            other_events = []
        
        llm_client = LlmClient()
        
        # Generate LLM data
        name = cls._extract_name_from_posts(posts, llm_client)
        (small_summary, big_summary) = cls._generate_summaries(posts, llm_client)
        keywords = cls._extract_keywords(posts, llm_client)
        similar_events = cls._find_similar_events_static(keywords, other_events, llm_client)
        date = cls._find_most_recent_post_date(posts)
        
        return cls(
            posts=posts,
            name=name,
            small_summary=small_summary,
            big_summary=big_summary,
            similar_events=similar_events,
            keywords=keywords,
            date=date
        )


    def __repr__(self):
        return f"Event(event_id={self.event_id}, name={self.name}, small_summary={self.small_summary}, big_summary={self.big_summary}, posts={self.posts}, similar_events={self.similar_events}, keywords={self.keywords})"

# add the post to posts and regenerate everything
    def add_post(self, post: Post, other_events: List['Event'] = None):
        if other_events is None:
            other_events = []
        
        llm_client = LlmClient()
        self.posts = (self.posts or []) + [post]

        self.keywords = Event._extract_keywords(self.posts, llm_client)
        (self.small_summary, self.big_summary) = Event._generate_summaries(self.posts, llm_client)
        self.similar_events = Event._find_similar_events_static(self.keywords, other_events, llm_client)
        self.date = Event._find_most_recent_post_date(self.posts)
        
    def get_event_topic(self) -> str:
        if not self.posts:
            return None
        return self.posts[0].topic

    @staticmethod
    def _find_most_recent_post_date(posts: List[Post]) -> datetime:
        if not posts:
            return datetime.now()
        return max(post.date for post in posts)

    @staticmethod
    def _extract_name_from_posts(posts: List[Post], llm_client: LlmClient) -> str:
        if not posts:
            return "Unnamed Event"
        
        total_context = ' '.join(post.content for post in posts)
        name_find_prompt = event_name_prompt.format(event_posts=total_context)
        name = llm_client.generate_response(AzerionPromptTemplate(prompt=name_find_prompt))
        return name

    @staticmethod
    def _extract_keywords(posts: List[Post], llm_client: LlmClient) -> List[Keyword]:
        if not posts:
            return []
        
        total_context = ' '.join(post.content for post in posts)
        keywords_find_prompt = event_keywords_prompt.format(event_posts=total_context)
        keywords = llm_client.generate_response(AzerionPromptTemplate(prompt=keywords_find_prompt))
        kw_list = keywords.split(',')

        kws = []
        embedding_service = SemanticSimilarityService(llm_client)
        for kw in kw_list:
            embedding = embedding_service.embed(kw)
            kws.append(Keyword(kw, embedding))

        return kws

    @staticmethod
    def _generate_summaries(posts: List[Post], llm_client: LlmClient):
        small = Event._generate_small_summary(posts, llm_client)
        large = Event._generate_large_summary(posts, llm_client)
        return small, large

    @staticmethod
    def _generate_small_summary(posts: List[Post], llm_client: LlmClient):
        if not posts:
            return "No summary available"
        
        total_context = ' '.join(post.content for post in posts)
        small_summary_find_prompt = event_small_summary_prompt.format(event_posts=total_context)
        small_summary = llm_client.generate_response(AzerionPromptTemplate(prompt=small_summary_find_prompt))
        return small_summary

    @staticmethod
    def _generate_large_summary(posts: List[Post], llm_client: LlmClient):
        if not posts:
            return "No summary available"
        
        total_context = ' '.join(post.content for post in posts)
        big_summary_find_prompt = event_big_summary_prompt.format(event_posts=total_context)
        big_summary = llm_client.generate_response(AzerionPromptTemplate(prompt=big_summary_find_prompt))
        return big_summary

    @staticmethod
    def _find_similar_events_static(keywords: List[Keyword], other_events: List['Event'], llm_client: LlmClient):
        sim_events = []
        for event in other_events:
            if Event._events_are_similar_static(keywords, event, llm_client):
                sim_events.append(event)
        return sim_events

    @staticmethod
    def _events_are_similar_static(keywords: List[Keyword], other_event: 'Event', llm_client: LlmClient) -> bool:
        # Safety checks
        if not keywords or not other_event.keywords:
            return False

        semantic_similarity_service = SemanticSimilarityService(llm_client)
        kws_in_common = 0

        for kw1 in keywords:
            for kw2 in other_event.keywords:
                cosine_similarity = semantic_similarity_service.cosine_similarity(kw1.emb, kw2.emb)
                if cosine_similarity > Event._minimum_event_similarity_threshold:
                    kws_in_common += 1

        return kws_in_common >= Event._minimum_words_in_common

    # Instance method for checking similarity (uses self.keywords)
    def events_are_similar(self, other_event: 'Event', llm_client: LlmClient) -> bool:
        if self.event_id and other_event.event_id == self.event_id:
            return False  # don't add the same event in event_similarity !!
        
        return Event._events_are_similar_static(self.keywords, other_event, llm_client)






