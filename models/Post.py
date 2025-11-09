from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Tuple
from dataclasses_json import dataclass_json

from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.LlmClient import LlmClient
from llm.PromptTemplates.Prompts import build_sentiment_prompt, event_find_actionable_exerpts_prompt
from models.Actionable import Actionable
from llm.PromptTemplates.BelastingdienstData import _belastingdienst_data


@dataclass_json
@dataclass
class Post:
    link: str
    content: str
    date: datetime
    source: str
    satisfaction_rating: int = 0
    engagement_rating: List[Tuple[datetime, int]] = field(default_factory=list)
    actionables: List[Actionable] = field(default_factory=list)
    topic: str = ""
    
    @classmethod
    def create_with_enrichment(cls, link: str, content: str, date: datetime, source: str) -> 'Post':
        """Factory method to create a Post with LLM enrichment"""
        from llm.find_topic_for_post import find_topic_for_post
        from database import db
        
        llm_client = LlmClient()
        
        # Get LLM-generated data
        satisfaction_rating = cls._get_sentiment_score(content, llm_client)
        actionables = cls._generate_actionables(content, link, llm_client)
        
        # Create post first (needed for find_topic_for_post)
        post = cls(
            link=link,
            content=content,
            date=date,
            source=source,
            satisfaction_rating=satisfaction_rating,
            engagement_rating=[],
            actionables=actionables,
            topic=""
        )
        
        # Find topic (needs the post object)
        topics = db.get_all_topics()
        post.topic = find_topic_for_post(post, topics)
        
        return post
    
    @staticmethod
    def _get_sentiment_score(content: str, llm_client: LlmClient) -> int:
        sentiment_score = int(llm_client.generate_response(AzerionPromptTemplate(
            prompt=build_sentiment_prompt(content))))
        return max(0, min(100, sentiment_score))
    
    @staticmethod
    def _generate_actionables(content: str, link: str, llm_client: LlmClient) -> List[Actionable]:
        find_actionables_prompt = event_find_actionable_exerpts_prompt.format(
            post_data=content, 
            all_the_belastingdienst_data=_belastingdienst_data
        )
        
        actionables_exerpts = llm_client.generate_response(AzerionPromptTemplate(prompt=find_actionables_prompt))
        actionables_exerpts = actionables_exerpts.split('$')
        
        actionables_list = []
        for actionable in actionables_exerpts:
            if actionable:
                actionables_list.append(Actionable.create_with_enrichment(
                    actionable_id=str(len(actionables_exerpts)) + link, 
                    base_link=link, 
                    content=actionable
                ))
        
        return actionables_list
