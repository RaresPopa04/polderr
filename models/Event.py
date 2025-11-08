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

    def __init__(self,posts: List[Post] = None, other_events: List['Event'] = []):
        self.posts = posts

        llm_client = LlmClient()
        self.name = self.extract_name_from_posts(llm_client)
        (self.small_summary, self.big_summary) = self.generate_summaries(llm_client)
        self.similar_events = self.find_similar_events(llm_client, other_events)
        self.keywords = self.extract_keywords(llm_client)
        self.date = self.find_most_recent_post_date()


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
        total_context = ''
        for post in self.posts:
            total_context += post.content + ' '

        name_find_prompt = event_name_prompt.format(event_posts=total_context)

        name = llm_client.generate_response(AzerionPromptTemplate(prompt=name_find_prompt))

        return name

    def extract_keywords(self, llm_client: LlmClient) -> List[Keyword]:
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
        total_context = ''
        for post in self.posts:
            total_context += post.content + ' '

        small_summary_find_prompt = event_small_summary_prompt.format(event_posts=total_context)



        small_summary = llm_client.generate_response(AzerionPromptTemplate(prompt=small_summary_find_prompt))

        return small_summary

    def generate_large_summary(self, llm_client: LlmClient):
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






