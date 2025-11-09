"""
FastAPI main application
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import topics, events, search
from llm.LlmClient import LlmClient
from Services.EventProcessingService import EventProcessingService
from database import db
from llm.LlmClient import LlmClient
from Services.EventProcessingService import EventProcessingService
from database import db
from api.routes import topics, events, search, posts, forum


app = FastAPI(
    title="Polderr API",
    description="API for municipality monitoring platform",
    version="1.0.0"
)


@app.on_event("startup")
async def startup_event():
    """Load database from pre-generated JSON file on startup"""
    
    json_file = "db_generated.json"
    
    if not os.path.exists(json_file):
        print("\n" + "=" * 70)
        print("WARNING: No database file found!")
        print("=" * 70)
        print("\nPlease run: python main_generate.py")
        print("to generate the database JSON file first.\n")
        print("Starting with empty database...")
        print("=" * 70 + "\n")
        return
    
    print("\n" + "=" * 70)
    print("STARTUP: Loading database from JSON...")
    print(f"File: {json_file}")
    print("=" * 70)
    
    try:
        llm_client = LlmClient()
        service = EventProcessingService(llm_client)
        service.load_database_from_json(json_file)
        
        print(f"\n✓ Successfully loaded database!")
        print(f"  Total Topics: {len(db.get_all_topics())}")
        print(f"  Total Events: {len(db.get_all_events())}")
        print(f"  Total Posts: {len(db.get_all_posts())}")
        print("=" * 70 + "\n")
        
    except Exception as e:
        print(f"\n✗ ERROR loading database: {e}")
        print("=" * 70 + "\n")
        raise

# Configure CORS to allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(topics.router, prefix="/api", tags=["topics"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(search.router, prefix="/api", tags=["search"])
app.include_router(posts.router, prefix="/api", tags=["posts"])
app.include_router(forum.router, prefix="/api", tags=["forum"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Polderr API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
