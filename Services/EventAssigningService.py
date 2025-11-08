from llm.LlmClient import LlmClient
from models.Post import Post
from typing import List
from database import db

class EventAssigningService:
    def __init__(self, llm_client:LlmClient):
        self.llm_client = llm_client
        self.db = db
        
     
