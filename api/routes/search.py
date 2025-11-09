"""
Search API endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Tuple
from database import db
from llm.LlmClient import LlmClient
from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.PromptTemplates.Prompts import search_query_to_topic_name_prompt
from llm.SemanticSimilarityService import SemanticSimilarityService
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
    case_description: Optional[str]
    date: Optional[str]
    keywords: List[str]
    similarity_score: Optional[float] = None


class TopicResponse(BaseModel):
    topic_id: int
    name: str
    events: List[EventResponse]
    total_events_searched: int
    similarity_threshold: float


@router.post("/search")
async def search_by_similarity(request: SearchRequest) -> TopicResponse:
    """
    Search for events using semantic similarity on their summaries and create a new topic.
    
    Flow:
    1. Get search query and expand if too short
    2. Determine dynamic similarity threshold based on query length
    3. Get all events from database
    4. Calculate hybrid similarity (semantic + keyword overlap)
    5. Filter events by dynamic threshold
    6. Sort events by similarity score (highest first)
    7. Generate topic name from search query using LLM
    8. Create and save new topic with matching events
    9. Return the topic with events and their similarity scores
    """
    search_query = request.query.strip()
    original_query = search_query
    similarity_threshold = 0.7
    
    if not search_query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    
    # Initialize services
    llm_client = LlmClient()
    similarity_service = SemanticSimilarityService(llm_client)
    
    # Step 1: Query expansion for short queries
    query_word_count = len(search_query.split())
    
    if query_word_count <= 3:
        print(f"\n📝 Expanding short query: '{search_query}'")
        expansion_prompt = f"""You are improving user search queries for semantic similarity over local events.

Rewrite the following query into a slightly more descriptive, neutral text that is good for embeddings.

Rules:
- Preserve the original meaning exactly. Do NOT invent new facts, locations, problems, or opinions.
- If the query is already clear and specific, keep it very close to the original and only add a few clarifying words.
- If the query is short or ambiguous, expand it into 1–2 short sentences that describe the likely topic in general terms.
- Use plain language, no bullet points, no lists.
- Do NOT mention "query", "user", "search", or any platform.
- Do NOT add a city name unless it already appears in the query.
- Output ONLY the rewritten text, nothing else.

Original:
\"\"\"{search_query}\"\"\"

Rewritten for embeddings:"""
        expanded_query = llm_client.generate_response(AzerionPromptTemplate(prompt=expansion_prompt))
        search_query = expanded_query.strip()
        print(f"✓ Expanded to: '{search_query}'")
    
    # Step 2: Dynamic threshold based on query complexity
    
    print(f"\n🔍 Search Configuration:")
    print(f"  Original query: '{original_query}' ({query_word_count} words)")
    print(f"  Search query: '{search_query}'")
    
    # Step 3: Get all events from database
    all_events = db.get_all_events()
    
    if not all_events:
        raise HTTPException(status_code=404, detail="No events found in database")
    
    print(f"  Events to search: {len(all_events)}")
    
    # Step 4: Calculate hybrid similarity scores for each event
    events_with_scores: List[Tuple[any, float]] = []
    
    for event in all_events:
        # Skip events without description
        event_text = event.case_description or event.small_summary
        if not event_text or event_text.strip() == "":
            continue
        
        # Semantic similarity using case_description (optimized for matching)
        semantic_score = similarity_service.similarity(search_query, event_text)
        
        # Keyword overlap boost (simple word matching)
        query_words = set(search_query.lower().split())
        event_words = set(event_text.lower().split())
        common_words = query_words.intersection(event_words)
        keyword_boost = min(len(common_words) * 0.05, 0.15)  # Max 15% boost
        
        # Hybrid score: 85% semantic + 15% keyword boost
        final_score = min(semantic_score + keyword_boost, 1.0)
        
        # Only include events above threshold
        if final_score >= similarity_threshold:
            events_with_scores.append((event, final_score))
            print(f"  ✓ '{event.name}' - Score: {final_score:.3f} (semantic: {semantic_score:.3f}, boost: {keyword_boost:.3f})")
    
    # Step 5: Sort by similarity score (highest first)
    events_with_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Extract just the events (without scores) for the topic
    matching_events = [event for event, _ in events_with_scores]
    
    print(f"\n✅ Found {len(matching_events)} matching events (threshold: {similarity_threshold})")
    
    # Step 6: Generate topic name from ORIGINAL query (not expanded)
    prompt = search_query_to_topic_name_prompt.format(search_query=original_query)
    topic_name = llm_client.generate_response(AzerionPromptTemplate(prompt=prompt))
    topic_name = topic_name.strip()
    
    print(f"📌 Generated topic name: '{topic_name}'")
    
    # Step 6.5: Generate emoji for the topic using LLM
    emoji_prompt = f"""Choose the single most appropriate emoji for this topic. Return ONLY the emoji character, nothing else.

Topic: {topic_name}

Emoji:"""
    topic_emoji = llm_client.generate_response(AzerionPromptTemplate(prompt=emoji_prompt))
    topic_emoji = topic_emoji.strip()
    
    # Fallback to default if response is not an emoji
    if len(topic_emoji) > 4:  # If response is too long, use default
        topic_emoji = "🔍"
    
    print(f"🎨 Generated emoji: '{topic_emoji}'")
    
    # Step 7: Create new topic with matching events
    new_topic = Topic(
        topic_id=None,  # Will be auto-generated
        name=topic_name,
        icon=topic_emoji,
        events=matching_events
    )
    
    # Save topic to database
    saved_topic = db.add_topic(new_topic)
    
    # Step 8: Prepare response with similarity scores
    events_response = []
    for event, similarity_score in events_with_scores:
        events_response.append(EventResponse(
            event_id=event.event_id,
            name=event.name,
            small_summary=event.small_summary,
            big_summary=event.big_summary,
            case_description=event.case_description,
            date=event.date.isoformat() if event.date else None,
            keywords=[kw.keyword for kw in event.keywords] if event.keywords else [],
            similarity_score=round(similarity_score, 3)
        ))
    
    return TopicResponse(
        topic_id=saved_topic.topic_id,
        name=saved_topic.name,
        events=events_response,
        total_events_searched=len(all_events),
        similarity_threshold=similarity_threshold
    )

