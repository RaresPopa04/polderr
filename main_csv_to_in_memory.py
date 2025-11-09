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
    
# link,message,date_iso8601,comments_json
# "link","message","date_iso8601","comments_json","likes"
def process_csv_data(csv_file: str = None):
    """Process all 24 hourly CSV files and load data into memory. DOES NOT USE THE CSV_FILE INPUT, AS ALL THE CSV FILES WILL BE USED"""
    
    print("Initializing LLM client...")
    llm_client = LlmClient()
    
    print("Creating Event Processing Service...")
    service = EventProcessingService(llm_client)
    
    # Process all 24 hourly CSV files
    csv_directory = "csv_timestamps"
    csv_files = [f"snapshot_{i:02d}.csv" for i in range(24)]
    
    print("\n" + "=" * 70)
    print("PROCESSING 24 HOURLY CSV FILES")
    print("=" * 70)
    
    for i, csv_filename in enumerate(csv_files):
        print(f"Processing {csv_filename}...")
        csv_path = os.path.join(csv_directory, csv_filename)
        if os.path.exists(csv_path):
            print(f"\n[{i+1}/24] Processing {csv_filename}...")
            service.process_csv_events_to_posts(csv_path)
        else:
            print(f"\n[{i+1}/24] Warning: File '{csv_path}' not found, skipping...")
    
    print("\n" + "=" * 70)
    print("COMPLETED PROCESSING ALL FILES")
    print("=" * 70)
    
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
