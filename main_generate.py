"""
Generate database from CSV files and save to JSON
This script processes all CSV files, enriches them with LLM data,
and saves the resulting database to a JSON file.
"""
import json
import csv
import os
from datetime import datetime
from llm.LlmClient import LlmClient
from models.Post import Post
from Services.EventAssigningService import EventAssigningService
from database import db


# CONFIGURATION: Control how many posts to process
RIJSWIJK_FEED_LIMIT = 10  # Number of posts to process from rijswijk_feed_news.csv (None = all)
NUM_SNAPSHOT_FILES = 0    # Number of snapshot files to process (0-24)

# Custom JSON encoder to handle datetime objects
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


def process_csv_row(row, llm_client, event_assigning_service):
    """
    Process a single CSV row and create a Post object
    
    Returns: True if processed successfully, False otherwise
    """
    if len(row) < 3:
        return False
    
    try:
        link = row[0] if row[0] else "No link"
        content = row[1] if len(row) > 1 else ""
        date_str = row[2] if len(row) > 2 else datetime.now().isoformat()

        try:
            post_date = datetime.fromisoformat(date_str.replace('+01:00', ''))
        except:
            post_date = datetime.now()

        if 'feelgoodradio' in link:
            source = "Feelgood Radio - Nieuws"
        elif 'inrijswijk.com' in link:
            source = "InRijswijk.com"
        elif 'ad.nl' in link:
            source = "AD - Algemeen Dagblad"
        else:
            source = "Unknown Source"

        # Use LLM enrichment to generate sentiment, actionables, and topics
        post = Post.create_with_enrichment(
            link=link,
            content=content,
            date=post_date,
            source=source
        )
        db.add_post(post)
        event_assigning_service.assign_posts_to_events(post)
        return True
        
    except Exception as e:
        print(f"Error processing row: {e}")
        return False


def process_csv_files(llm_client):
    """
    Process rijswijk_feed_news.csv first, then snapshot files from csv_timestamps/
    and convert rows to Post objects in the database
    
    Returns: number of posts processed
    """
    print("\n" + "=" * 70)
    print("PROCESSING CSV FILES")
    print("=" * 70)
    
    event_assigning_service = EventAssigningService(llm_client)
    
    # First, process rijswijk_feed_news.csv from the project root
    rijswijk_file = "rijswijk_feed_news.csv"
    limit_msg = f" (limit: {RIJSWIJK_FEED_LIMIT})" if RIJSWIJK_FEED_LIMIT else " (no limit)"
    print(f"\n[1] Processing {rijswijk_file}{limit_msg}...")
    
    if os.path.exists(rijswijk_file):
        with open(rijswijk_file, 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            next(reader)  # Skip header
            
            row_count = 0
            for row in reader:
                # Check if we've reached the limit
                if RIJSWIJK_FEED_LIMIT is not None and row_count >= RIJSWIJK_FEED_LIMIT:
                    break
                
                if process_csv_row(row, llm_client, event_assigning_service):
                    row_count += 1
            
            print(f"Processed {row_count} posts from {rijswijk_file}")
    else:
        print(f"Warning: File '{rijswijk_file}' not found, skipping...")
    
    # Then process snapshot CSV files from csv_timestamps directory
    csv_directory = "csv_timestamps"
    csv_files = [f"snapshot_{i:02d}.csv" for i in range(NUM_SNAPSHOT_FILES)]
    
    print(f"\n[2] Processing {len(csv_files)} snapshot files from {csv_directory}/")
    
    for i, csv_filename in enumerate(csv_files):
        print(f"\n[{i+1}/{len(csv_files)}] Processing {csv_filename}...")
        csv_path = os.path.join(csv_directory, csv_filename)
        
        if not os.path.exists(csv_path):
            print(f"Warning: File '{csv_path}' not found, skipping...")
            continue
            
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            next(reader)

            needed_posts = 1

            for row in reader:
                if needed_posts <= 0:
                    break
                
                if process_csv_row(row, llm_client, event_assigning_service):
                    needed_posts -= 1
    
    print("\n" + "=" * 70)
    print("COMPLETED PROCESSING ALL FILES")
    print("=" * 70)


def save_database_to_json(filename: str = None):
    """Save the entire database to a JSON file"""
    if filename is None:
        filename = "db_generated.json"
    
    print("\n" + "=" * 70)
    print("SAVING DATABASE TO JSON")
    print("=" * 70)
    
    try:
        # Get all data from database
        all_posts = db.get_all_posts()
        all_events = db.get_all_events()
        all_topics = db.get_all_topics()
        
        print(f"\nCollecting data:")
        print(f"  - Posts: {len(all_posts)}")
        print(f"  - Events: {len(all_events)}")
        print(f"  - Topics: {len(all_topics)}")
        
        # Serialize using automatic to_dict() with custom encoders
        print("\nSerializing posts...")
        posts_data = [post.to_dict() for post in all_posts]
        
        print("Serializing events...")
        events_data = [event.to_dict() for event in all_events]
        
        print("Serializing topics...")
        topics_data = [topic.to_dict() for topic in all_topics]
        
        db_data = {
            "posts": posts_data,
            "events": events_data,
            "topics": topics_data,
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "total_posts": len(all_posts),
                "total_events": len(all_events),
                "total_topics": len(all_topics)
            }
        }
        
        # Save to file (models now handle datetime serialization automatically)
        print(f"\nWriting to file: {filename}")
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(db_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ SUCCESS! Database saved to: {filename}")
        print(f"\nStats:")
        print(f"  - Total Posts: {len(all_posts)}")
        print(f"  - Total Events: {len(all_events)}")
        print(f"  - Total Topics: {len(all_topics)}")
        print("=" * 70 + "\n")
        
        return filename
        
    except Exception as e:
        print(f"\n❌ ERROR saving database: {e}")
        print("=" * 70 + "\n")
        raise


def main():
    """Main function to generate and save database"""
    print("\n" + "=" * 70)
    print("DATABASE GENERATION SCRIPT")
    print("=" * 70)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    try:
        # Show configuration
        print("\nConfiguration:")
        print(f"  - Rijswijk Feed Limit: {RIJSWIJK_FEED_LIMIT if RIJSWIJK_FEED_LIMIT else 'All posts'}")
        print(f"  - Snapshot Files: {NUM_SNAPSHOT_FILES}")
        llm_client = LlmClient()
        
        # Process CSV files
        print("\n[Step 1] Processing CSV files...")
        process_csv_files(llm_client)
        
        # Save to JSON
        print("\n[Step 2] Saving database to JSON...")
        filename = save_database_to_json()
        
        print("\n" + "=" * 70)
        print("🎉 COMPLETE! Database generation finished successfully")
        print(f"Generated file: {filename}")
        print("=" * 70 + "\n")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Process interrupted by user")
        print("=" * 70 + "\n")
    except Exception as e:
        print(f"\n\n❌ FATAL ERROR: {e}")
        print("=" * 70 + "\n")
        raise


if __name__ == "__main__":
    main()

