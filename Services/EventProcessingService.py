from llm.LlmClient import LlmClient
from models.Post import Post
from database import db
import csv
from datetime import datetime
from llm.AzerionPromptTemplate import AzerionPromptTemplate
from llm.PromptTemplates.Prompts import build_sentiment_prompt

class EventProcessingService:
    def __init__(self, llm_client: LlmClient):
        self.llm_client = llm_client
    
    def process_csv_events_to_posts(self, csv_file: str):
        """
        Process CSV file and convert rows to Post objects in the database
        
        CSV format: link, message, date_iso8601, comments_json
        
        Returns: number of posts processed
        """
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            next(reader) 
            
            needed_posts = 10
            
            for row in reader:
                if len(row) < 3:
                    continue
                needed_posts -= 1
                if needed_posts <= 0:
                    break
                
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
                    
                    try:
                        sentiment_score = int(self.llm_client.generate_response(AzerionPromptTemplate(
                            prompt = build_sentiment_prompt(content)
                        )))
                        sentiment_score = max(0, min(100, sentiment_score))
                    except:
                        sentiment_score = 50
                        
                    post = Post(
                        link=link,
                        content=content,
                        date=post_date,
                        source=source,
                        satisfaction_rating=sentiment_score,
                        engagement_rating=[(post_date, 0)],
                        actionables=[]
                    )
                    
                    db.add_post(post)
                    
                except Exception as e:
                    print(f"Error processing row: {e}")
                    continue