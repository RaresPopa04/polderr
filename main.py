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
    print("-" * 70)
    print(f"\n✓ Successfully processed posts!")
        



csv_file = "rijswijk_feed_news.csv"
if os.path.exists(csv_file):
        process_csv_data(csv_file)
        show_database_stats()
else:
    print(f"\nNote: CSV file '{csv_file}' not found in current directory.")

posts = db.get_all_posts()

print("\n" + "=" * 70)
first_post = posts[0:3]
second_post = posts[3:6]
third_post = posts[6:9]
event1 = Event(first_post)
event2 = Event(second_post)
event3 = Event(third_post)




