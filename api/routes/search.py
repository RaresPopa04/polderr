"""
Search API endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database import db
from llm.LlmClient import LlmClient
from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.PromptTemplates.Prompts import search_query_to_topic_name_prompt
from models.Topic import Topic

router = APIRouter()


class SearchRequest(BaseModel):
    query: str


class KeywordResponse(BaseModel):
    keyword: str


class EventResponse(BaseModel):
    event_id: Optional[int]
    name: Optional[str]
    small_summary: Optional[str]
    big_summary: Optional[str]
    date: Optional[str]
    keywords: List[str]


class TopicResponse(BaseModel):
    topic_id: int
    name: str
    events: List[EventResponse]
    keywords_found: List[str]
    query_words: List[str]


@router.post("/search")
async def search_by_keywords(request: SearchRequest) -> TopicResponse:
    """
    Search for events by keywords and create a new topic.
    
    Flow:
    1. Split search query into words
    2. Find keywords that match query words (substring)
    3. Get events containing those keywords
    4. Generate topic name from search query using LLM
    5. Create and save new topic with matching events
    6. Return the topic with events
    """
    search_query = request.query.strip()
    
    if not search_query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    
    # Step 1: Split query by spaces into query words
    query_words = search_query.split()
    
    # Step 2: Search for matching keywords
    matching_keywords = db.search_keywords_by_query(query_words)
    
    # Step 3: Get events that have these keywords
    matching_events = db.get_events_by_keywords(matching_keywords)
    
    # Step 4: Generate topic name from search query using LLM
    llm_client = LlmClient()
    prompt = search_query_to_topic_name_prompt.format(search_query=search_query)
    topic_name = llm_client.generate_response(AzerionPromptTemplate(prompt=prompt))
    topic_name = topic_name.strip()
    
    # Step 5: Create new topic with matching events
    # TODO FUTURE: Check for existing similar topics instead of always creating new ones
    new_topic = Topic(
        topic_id=None,  # Will be auto-generated
        name=topic_name,
        events=matching_events
    )
    
    # Save topic to database
    saved_topic = db.add_topic(new_topic)
    
    # Step 6: Prepare response
    events_response = []
    for event in matching_events:
        events_response.append(EventResponse(
            event_id=event.event_id,
            name=event.name,
            small_summary=event.small_summary,
            big_summary=event.big_summary,
            date=event.date.isoformat() if event.date else None,
            keywords=[kw.keyword for kw in event.keywords] if event.keywords else []
        ))
    
    return TopicResponse(
        topic_id=saved_topic.topic_id,
        name=saved_topic.name,
        events=events_response,
        keywords_found=[kw.keyword for kw in matching_keywords],
        query_words=query_words
    )

