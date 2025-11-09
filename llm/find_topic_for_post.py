# Input: a post, a list of topics
# Output: the topic that the post is most related to
# 1. Embeds the content of the post. Embeds the name of each topic.
# 2. Computes the cosine similarity between the embedding of the post and the embeddings of each topic.
# 3. Returns the topic with the highest cosine similarity.

from typing import List
from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.LlmClient import LlmClient
from llm.PromptTemplates.Prompts import find_topic_for_post_prompt
from llm.SemanticSimilarityService import cosine_similarity, embed_text_to_embedding
from models.Post import Post
from models.Topic import Topic
from database import db


def find_topic_for_post_old(post: Post, topics: List[Topic]) -> Topic:
    post_embedding = embed_text_to_embedding(post.content)
    max_similarity = 0
    most_similar_topic = None
    for topic in topics:
        topic_embedding = embed_text_to_embedding(topic.name)
        similarity = cosine_similarity(post_embedding, topic_embedding)
        if similarity > max_similarity:
            max_similarity = similarity
            most_similar_topic = topic
    return most_similar_topic


# Use prompt for this one
def find_topic_for_post(post: Post, topics: List[Topic]) -> Topic:
    llm_client = LlmClient()
    
    # Use subject_description if available, otherwise fall back to content
    post_description = post.subject_description if post.subject_description else post.content
    
    # Format topics list for better readability
    topics_list = "\n".join([f"- {topic.name}: {topic.icon}" for topic in topics])
    
    prompt = find_topic_for_post_prompt.format(
        post_description=post_description, 
        topics=topics_list
    )
    response = llm_client.generate_response(AzerionPromptTemplate(prompt=prompt))
    
    # Clean up response (remove whitespace, quotes, etc.)
    response = response.strip().strip('"').strip("'")
    
    # Try exact match first
    for topic in topics:
        if topic.name == response:
            return topic
    
    # Try case-insensitive match
    for topic in topics:
        if topic.name.lower() == response.lower():
            print(f"  ⚠️  Case mismatch: '{response}' -> '{topic.name}'")
            return topic
    
    # If no match, return "Other" topic
    print(f"  ⚠️  No match for '{response}', using 'Other' topic")
    return db.get_topic_by_name("Other")