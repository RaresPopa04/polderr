from llm.LlmClient import LlmClient
from models.Post import Post
from database import db
import csv
import os
from datetime import datetime
from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.PromptTemplates.Prompts import build_sentiment_prompt
from Services.EventAssigningService import EventAssigningService

class EventProcessingService:
    def __init__(self, llm_client:LlmClient):
        self.llm_client = llm_client
        self.event_assigning_service = EventAssigningService(llm_client)

    def process_csv_events_to_posts(self, csv_file: str = None):
        """
        Process all 24 hourly CSV files and convert rows to Post objects in the database
        
        DOES NOT USE THE CSV_FILE INPUT, AS ALL THE CSV FILES WILL BE USED
        
        CSV format: link, message, date_iso8601, comments_json

        Returns: number of posts processed
        """
        # Process all 24 hourly CSV files
        csv_directory = "csv_timestamps"
        csv_files = [f"snapshot_{i:02d}.csv" for i in range(24)]
        
        print("\n" + "=" * 70)
        print("PROCESSING 24 HOURLY CSV FILES")
        print("=" * 70)
        
        for i, csv_filename in enumerate(csv_files):
            print(f"\n[{i+1}/24] Processing {csv_filename}...")
            csv_path = os.path.join(csv_directory, csv_filename)
            
            if not os.path.exists(csv_path):
                print(f"Warning: File '{csv_path}' not found, skipping...")
                continue
                
            with open(csv_path, 'r', encoding='utf-8') as file:
                reader = csv.reader(file)
                next(reader)

                needed_posts = 1

                for row in reader:
                    if len(row) < 3:
                        continue
                    if needed_posts <= 0:
                        break
                    
                    needed_posts -= 1

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

                        post = Post(
                            link=link,
                            content=content,
                            date=post_date,
                            source=source
                        )
                        db.add_post(post)
                        self.event_assigning_service.assign_posts_to_events(post)

                    except Exception as e:
                        print(f"Error processing row: {e}")
                        continue
        
        print("\n" + "=" * 70)
        print("COMPLETED PROCESSING ALL FILES")
        print("=" * 70)