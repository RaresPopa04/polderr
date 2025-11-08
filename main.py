"""
Main entry point for the Rijswijk Municipality Social Media Monitoring System
"""

import sys
import os

from models.Event import Event

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from llm.LlmClient import LlmClient
from Services.EventProcessingService import EventProcessingService
from database import db


def show_database_stats():
    """Display current database statistics"""
    print("\n" + "=" * 70)
    print("DATABASE STATISTICS")
    print("=" * 70)
    
    events = db.get_all_events()
    posts = db.get_all_posts()
    
    print(f"Total Events: {len(events)}")
    print(f"Total Posts:  {len(posts)}")
    
    for post in posts[:10]:
        print(f"Post: {post.link} and rating {post.satisfaction_rating}")
    


def process_csv_data(csv_file: str):
    print("Initializing LLM client...")
    llm_client = LlmClient()
    
    print("Creating Event Processing Service...")
    service = EventProcessingService(llm_client)
    
    service.process_csv_events_to_posts(csv_file)
    
    for event in db.get_all_events():
        print(f"Event: {event.name}")
        print(f"Event small summary: {event.small_summary}")
        print(f"Event big summary: {event.big_summary}")
        print(f"Event keywords: {[kw.keyword for kw in event.keywords] if event.keywords else []}")
        print(f"Event similar events: {[e.name for e in event.similar_events] if event.similar_events else []}")
        print(f"Event posts: {[p.link for p in event.posts] if event.posts else []}")
        print("-" * 70)
    print(f"\n✓ Successfully processed posts!")
        
csv_file = "rijswijk_feed_news.csv"
if os.path.exists(csv_file):
        process_csv_data(csv_file)
        show_database_stats()
else:
    print(f"\nNote: CSV file '{csv_file}' not found in current directory.")





