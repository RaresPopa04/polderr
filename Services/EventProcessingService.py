from llm.LlmClient import LlmClient
from models.Post import Post
from models.Event import Event
from models.Topic import Topic
from database import db
import csv
import json
import os
from datetime import datetime
from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.PromptTemplates.Prompts import build_sentiment_prompt
from Services.EventAssigningService import EventAssigningService


# # CONFIGURATION: Control how many posts to process
# RIJSWIJK_FEED_LIMIT = 0  # Number of posts to process from rijswijk_feed_news.csv (None = all)
# NUM_SNAPSHOT_FILES = 2   # Number of snapshot files to process (0-24)

class EventProcessingService:
    def __init__(self, llm_client:LlmClient):
        self.llm_client = llm_client
        self.event_assigning_service = EventAssigningService(llm_client)

    def _process_csv_row(self, row):
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

            # comments is a list of json with text and timestamp
            comments = []
            print(f"Comments: {row[3]}")
            if len(row) > 3 and row[3]:
                try:
                    comments = json.loads(row[3])
                except:
                    comments = []
            comment_count = len(comments) if isinstance(comments, list) else 0
            likes = 0
            if len(row) > 4 and row[4]:
                try:
                    likes = int(row[4])
                except:
                    likes = 0
            total_engagement = likes + comment_count    

            post = Post.create_with_enrichment(
                link=link,
                content=content,
                date=post_date,
                source=source,
                total_engagement=total_engagement
            )
            if db.add_post(post):
                self.event_assigning_service.assign_posts_to_events(post)
            return True
            
        except Exception as e:
            print(f"Error processing row: {e}")
            return False

    # def process_csv_events_to_posts(self, csv_file: str = None):
    #     """
    #     Process rijswijk_feed_news.csv first, then snapshot files from csv_timestamps/
    #     and convert rows to Post objects in the database
        
    #     DOES NOT USE THE CSV_FILE INPUT - processes rijswijk_feed_news.csv then all snapshots
        
    #     Configuration:
    #         RIJSWIJK_FEED_LIMIT: Number of posts to process from rijswijk_feed_news.csv (None = all)
    #         NUM_SNAPSHOT_FILES: Number of snapshot files to process (0-24)
        
    #     CSV format: link, message, date_iso8601, comments_json

    #     Returns: number of posts processed
    #     """
    #     print("\n" + "=" * 70)
    #     print("PROCESSING CSV FILES")
    #     print("=" * 70)
        
    #     # First, process rijswijk_feed_news.csv from the project root
    #     rijswijk_file = "rijswijk_feed_news.csv"
    #     # limit_msg = f" (limit: {RIJSWIJK_FEED_LIMIT})" if RIJSWIJK_FEED_LIMIT else " (no limit)"
    #     print(f"\n[1] Processing {rijswijk_file}{limit_msg}...")
        
    #     if os.path.exists(rijswijk_file):
    #         with open(rijswijk_file, 'r', encoding='utf-8') as file:
    #             reader = csv.reader(file)
    #             next(reader)  # Skip header
                
    #             row_count = 0
    #             for row in reader:
    #                 # Check if we've reached the limit
    #                 if RIJSWIJK_FEED_LIMIT is not None and row_count >= RIJSWIJK_FEED_LIMIT:
    #                     break
                    
    #                 if self._process_csv_row(row):
    #                     row_count += 1
                
    #             print(f"Processed {row_count} posts from {rijswijk_file}")
    #     else:
    #         print(f"Warning: File '{rijswijk_file}' not found, skipping...")
        
    #     # Then process snapshot CSV files from csv_timestamps directory
    #     csv_directory = "csv_timestamps"
    #     csv_files = [f"snapshot_{i:02d}.csv" for i in range(NUM_SNAPSHOT_FILES)]
        
    #     print(f"\n[2] Processing {len(csv_files)} snapshot files from {csv_directory}/")
        
    #     for i, csv_filename in enumerate(csv_files):
    #         print(f"\n[{i+1}/{len(csv_files)}] Processing {csv_filename}...")
    #         csv_path = os.path.join(csv_directory, csv_filename)
            
    #         if not os.path.exists(csv_path):
    #             print(f"Warning: File '{csv_path}' not found, skipping...")
    #             continue
                
    #         with open(csv_path, 'r', encoding='utf-8') as file:
    #             reader = csv.reader(file)
    #             next(reader)

    #             needed_posts = 1

    #             for row in reader:
    #                 if needed_posts <= 0:
    #                     break
                    
    #                 if self._process_csv_row(row):
    #                     needed_posts -= 1
        
    #     print("\n" + "=" * 70)
    #     print("COMPLETED PROCESSING ALL FILES")
    #     print("=" * 70)

    def load_database_from_json(self, json_file: str):
        """
        Load database from a JSON file (generated by main_generate.py)
        Reconstructs relationships from IDs/links.
        
        Args:
            json_file: Path to the JSON file containing the database
            
        Returns: Dictionary with counts of loaded items
        """
        print("\n" + "=" * 70)
        print(f"LOADING DATABASE FROM JSON: {json_file}")
        print("=" * 70)
        
        if not os.path.exists(json_file):
            raise FileNotFoundError(f"JSON file not found: {json_file}")
        
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Load posts first (they have no dependencies)
            print("\nLoading posts...")
            posts_data = data.get('posts', [])
            posts_by_link = {}
            for post_dict in posts_data:
                post = Post.from_dict(post_dict)
                db.add_post(post)
                posts_by_link[post.link] = post
            
            # Load events and reconstruct post relationships
            print("Loading events...")
            events_data = data.get('events', [])
            events_by_id = {}
            for event_dict in events_data:
                # Reconstruct posts from links (save them before from_dict wipes them)
                post_links = event_dict.get('posts', [])
                reconstructed_posts = [posts_by_link[link] for link in post_links if link in posts_by_link]
                
                # Clear similar_events for now (will reconstruct after all events loaded)
                event_dict['similar_events'] = []
                
                # Create event (decoder will set posts to [])
                event = Event.from_dict(event_dict)
                # Now manually assign the reconstructed posts
                event.posts = reconstructed_posts
                
                db.add_event(event)
                if event.event_id:
                    events_by_id[event.event_id] = event
            
            # Reconstruct similar_events relationships
            print("Reconstructing similar_events relationships...")
            for i, event_dict in enumerate(events_data):
                similar_ids = event_dict.get('similar_events', [])
                event = db.get_all_events()[i]
                event.similar_events = [events_by_id[eid] for eid in similar_ids if eid in events_by_id]
            
            # Load topics and reconstruct event relationships
            print("Loading topics...")
            topics_data = data.get('topics', [])
            for topic_dict in topics_data:
                # Reconstruct events from IDs (save them before from_dict wipes them)
                event_ids = topic_dict.get('events', [])
                print(f"  Topic '{topic_dict.get('name')}' has event IDs: {event_ids}")
                reconstructed_events = [events_by_id[eid] for eid in event_ids if eid in events_by_id]
                print(f"  Reconstructed to {len(reconstructed_events)} event objects")
                
                # Create topic (decoder will set events to [])
                topic = Topic.from_dict(topic_dict)
                # Now manually assign the reconstructed events
                topic.events = reconstructed_events
                
                # Update existing topic or add new one
                existing_topic = db.get_topic_by_id(topic.topic_id)
                if existing_topic:
                    existing_topic.events = topic.events
                    print(f"  Updated existing topic, now has {len(existing_topic.events)} events")
                    existing_topic.actionables = topic.actionables
                else:
                    db.add_topic(topic)
                    print(f"  Added new topic with {len(topic.events)} events")
            
            metadata = data.get('metadata', {})
            
            # Get loaded objects from database (not raw dicts)
            loaded_posts = db.get_all_posts()
            loaded_events = db.get_all_events()
            loaded_topics = db.get_all_topics()
            
            print(f"\n✅ Successfully loaded database!")
            print(f"  - Posts loaded: {len(loaded_posts)}")
            print(f"  - Events loaded: {len(loaded_events)}")
            print(f"  - Topics loaded: {len(loaded_topics)}")
            if metadata:
                print(f"  - Generated at: {metadata.get('generated_at', 'Unknown')}")
            print("=" * 70 + "\n")
            
            # Print sample of loaded data (first 5 posts and events)
            for post in loaded_posts[:5]:
                print(f"Post: {post.link}")
                print(f"Subject Description: {post.subject_description}")
                print("-" * 70)
            
            if len(loaded_posts) > 5:
                print(f"... and {len(loaded_posts) - 5} more posts")
                print("-" * 70)
            
            for event in loaded_events[:5]:
                print(f"Event: {event.name}")
                print(f"Case Description: {event.case_description}")
                print("-" * 70)
            
            if len(loaded_events) > 5:
                print(f"... and {len(loaded_events) - 5} more events")
                print("-" * 70)
            
            return {
                "posts": len(loaded_posts),
                "events": len(loaded_events),
                "topics": len(loaded_topics),
                "metadata": metadata
            }
            
        except Exception as e:
            print(f"\n❌ ERROR loading database from JSON: {e}")
            print("=" * 70 + "\n")
            raise