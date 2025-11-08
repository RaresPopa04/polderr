import textwrap

event_name_prompt = textwrap.dedent(
    """
    Generate a maximum of 10 words name for an event considering these 
    news articles / conversations about it. Return only this name.
    {event_posts}
    """)

event_keywords_prompt = textwrap.dedent(
    """
    Generate a set of 15 keywords for an event considering these 
    news articles / conversations about it. Return only these keywords separated by commas.
    {event_posts}
    """)

event_small_summary_prompt = textwrap.dedent(
    """
    Generate a small summary of approximatively 50 words for an event considering these 
    news articles / conversations about it. Return only the summary.
    {event_posts}
    """)

event_big_summary_prompt = textwrap.dedent(
    """
    Generate a small summary of approximatively 50 words for an event considering these 
    news articles / conversations about it. Return only the summary.
    {event_posts}
    """)
import json
from textwrap import dedent

SENTIMENT_PROMPT_TEMPLATE = dedent("""
SYSTEM INSTRUCTION:
You are a sentiment analysis service for Dutch-language news articles.

TASK:
Analyze each news article and output its sentiment as valid JSON.

OUTPUT FORMAT (just the sentiment score as a number)


RULES:
1. Each article includes the content of the entire social media post or news article.
2. Base sentiment purely on the article tone, not personal interpretation.
3. Use these guidelines:
   - 0–20 → very_negative
   - 21–40 → negative
   - 41–59 → neutral
   - 60–80 → positive
   - 81–100 → very_positive
4. Only produce the sentiment score as a number.

INPUT:
{{NEWS_BLOCK}}
""").strip()


def build_sentiment_prompt(news_block: str) -> str:
    """Fill the sentiment prompt template with a block of news text."""
    return SENTIMENT_PROMPT_TEMPLATE.replace("{{NEWS_BLOCK}}", news_block.strip())
