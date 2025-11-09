from llm.LlmClient import LlmClient
from models.Post import Post
from database import db
import csv
import os
from datetime import datetime
from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.PromptTemplates.Prompts import build_sentiment_prompt
from Services.EventAssigningService import EventAssigningService

# CONFIGURATION: Control how many posts to process
RIJSWIJK_FEED_LIMIT = 5  # Number of posts to process from rijswijk_feed_news.csv (None = all)
NUM_SNAPSHOT_FILES = 5   # Number of snapshot files to process (0-24)

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

            post = Post.create_with_enrichment(
                link=link,
                content=content,
                date=post_date,
                source=source
            )
            db.add_post(post)
            self.event_assigning_service.assign_posts_to_events(post)
            return True
            
        except Exception as e:
            print(f"Error processing row: {e}")
            return False

    def process_csv_events_to_posts(self, csv_file: str = None):
        """
        Process rijswijk_feed_news.csv first, then snapshot files from csv_timestamps/
        and convert rows to Post objects in the database
        
        DOES NOT USE THE CSV_FILE INPUT - processes rijswijk_feed_news.csv then all snapshots
        
        Configuration:
            RIJSWIJK_FEED_LIMIT: Number of posts to process from rijswijk_feed_news.csv (None = all)
            NUM_SNAPSHOT_FILES: Number of snapshot files to process (0-24)
        
        CSV format: link, message, date_iso8601, comments_json

        Returns: number of posts processed
        """
        print("\n" + "=" * 70)
        print("PROCESSING CSV FILES")
        print("=" * 70)
        
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
                    
                    if self._process_csv_row(row):
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
                    
                    if self._process_csv_row(row):
                        needed_posts -= 1
        
        print("\n" + "=" * 70)
        print("COMPLETED PROCESSING ALL FILES")
        print("=" * 70)