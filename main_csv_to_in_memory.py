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
    
def process_csv_data():
    """Process all 24 hourly CSV files and load data into memory"""
    
    print("Initializing LLM client...")
    llm_client = LlmClient()
    
    print("Creating Event Processing Service...")
    service = EventProcessingService(llm_client)
    
    # Process all CSV files (the service handles all 24 files internally)
    service.process_csv_events_to_posts()
    
    # Display events summary
    for event in db.get_all_events():
        print(f"Event: {event.name}")
        print(f"Event small summary: {event.small_summary}")
        print(f"Event big summary: {event.big_summary}")
        print(f"Event keywords: {[kw.keyword for kw in event.keywords] if event.keywords else []}")
        print(f"Event similar events: {[e.name for e in event.similar_events] if event.similar_events else []}")
        print(f"Event posts: {[p.link for p in event.posts] if event.posts else []}")
        print("-" * 70)
    print(f"\n✓ Successfully processed all posts!")
        
# Process all CSV files and show stats
process_csv_data()
show_database_stats()
