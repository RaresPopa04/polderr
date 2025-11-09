from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Tuple
from dataclasses_json import dataclass_json, config

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
    # Custom encoder/decoder for datetime serialization
    date: datetime = field(metadata=config(
        encoder=lambda dt: dt.isoformat() if dt else None,
        decoder=lambda s: datetime.fromisoformat(s) if s else None
    )) 
    source: str
    satisfaction_rating: int = 0
    # Exclude from serialization to avoid issues with tuple serialization
    engagement_rating: List[Tuple[datetime, int]] = field(default_factory=list, metadata=config(exclude=lambda x: True))
    # Actionables are now included in serialization
    actionables: List[Actionable] = field(default_factory=list)
    # Serialize topic as just the name, not the full object
    subject_description: Optional[str] = None
    topic: str = field(default="", metadata=config(
        encoder=lambda t: t.name if hasattr(t, 'name') else str(t),
        decoder=lambda s: s
    ))
    delta_interactions: List[Tuple[datetime, int]] = field(default_factory=list)
    total_engagement: int = 0
    
    @classmethod
    def create_with_enrichment(cls, link: str, content: str, date: datetime, source: str, total_engagement: int = 0) -> 'Post':
        """Factory method to create a Post with LLM enrichment"""
        from llm.find_topic_for_post import find_topic_for_post
        from database import db
        
        llm_client = LlmClient()
        
        # Get LLM-generated data
        satisfaction_rating = cls._get_sentiment_score(content, llm_client)
        actionables = cls._generate_actionables(content, link, llm_client)
        subject_description = cls._generate_subject_description_static(content, llm_client)
        
        # Create post first (needed for find_topic_for_post)
        post = cls(
            link=link,
            content=content,
            date=date,
            source=source,
            satisfaction_rating=satisfaction_rating,
            engagement_rating=[],
            actionables=actionables,
            topic="",
            subject_description=subject_description,
            total_engagement=total_engagement
        )
        
        # Find topic (needs the post object)
        topics = db.get_all_topics()
        post.topic = find_topic_for_post(post, topics)
        
        return post
    
    @staticmethod
    def _get_sentiment_score(content: str, llm_client: LlmClient) -> int:
        response = llm_client.generate_response(AzerionPromptTemplate(
            prompt=build_sentiment_prompt(content)))
        
        # Clean response - strip markdown code blocks and whitespace
        cleaned = response.strip()
        if cleaned.startswith('```'):
            # Remove markdown code blocks
            lines = cleaned.split('\n')
            # Find lines that aren't code fence markers
            cleaned = '\n'.join(line for line in lines if not line.startswith('```')).strip()
        
        # Extract just the number
        try:
            sentiment_score = int(cleaned)
        except ValueError:
            # If still can't parse, try to extract first number
            import re
            numbers = re.findall(r'\d+', cleaned)
            sentiment_score = int(numbers[0]) if numbers else 50  # Default to neutral
            
        return max(0, min(100, sentiment_score))

    @staticmethod
    def _generate_subject_description_static(content: str, llm_client: LlmClient) -> str:
        """
        Generate a single defining proposition for embedding / cosine similarity.
        The result is a concise, context-independent summary of the core issue or topic.
        """
        subject_prompt = f"""You are preparing text for semantic embeddings in an analysis system.

    From the following post, extract exactly ONE concise, factual sentence that describes
    the central issue, topic, or initiative discussed — focusing on what it is about and
    who is affected or involved.

    Requirements:
    - Output exactly ONE sentence.
    - Max ~20–25 words.
    - Neutral, descriptive, and self-contained.
    - Do NOT mention location (all content is from Rijswijk).
    - Do NOT include timing or posting details.
    - Do NOT mention “this post”, “the author”, or any platform.
    - Use plain, declarative language in English.

    Post:
    \"\"\"{content}\"\"\"

    Defining subject sentence:"""

        subject_description = llm_client.generate_response(
            AzerionPromptTemplate(prompt=subject_prompt)
        )
        return subject_description.strip()


    @staticmethod
    def _generate_actionables(content: str, link: str, llm_client: LlmClient) -> List[Actionable]:
        find_actionables_prompt = event_find_actionable_exerpts_prompt.format(post_data=content, all_the_belastingdienst_data= _belastingdienst_data)

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
