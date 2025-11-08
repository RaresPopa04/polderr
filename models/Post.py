from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Tuple
from llm.AzerionPromptTemplate import AzerionPromptTemplate
from models.Actionable import Actionable
from llm.PromptTemplates.Prompts import build_sentiment_prompt
from llm.LlmClient import LlmClient


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
    
    def __init__(self, link: str, content: str, date: datetime, source: str):
        self.link = link
        self.content = content
        self.date = date
        self.source = source
        
        llm_client = LlmClient()
        self.satisfaction_rating = self.get_sentiment_score(content, llm_client)
        self.engagement_rating = []
        self.actionables = []

    
    def get_sentiment_score(self, content: str, llm_client: LlmClient) -> int:
        sentiment_score = int(llm_client.generate_response(AzerionPromptTemplate(
                            prompt = build_sentiment_prompt(content)
                        )))
        return max(0, min(100, sentiment_score))