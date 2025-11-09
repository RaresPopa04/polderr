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

app = FastAPI(
    title="Polderr API",
    description="API for municipality monitoring platform",
    version="1.0.0"
)


@app.on_event("startup")
async def startup_event():
    """Process CSV data on startup"""
    csv_file = "rijswijk_feed_news.csv"
    
    if os.path.exists(csv_file):
        print("\n" + "=" * 70)
        print("STARTUP: Processing CSV data...")
        print("=" * 70)
        
        try:
            llm_client = LlmClient()
            service = EventProcessingService(llm_client)
            service.process_csv_events_to_posts(csv_file)
            
            print(f"\n✓ Successfully processed CSV data!")
            print(f"  Total Events: {len(db.get_all_events())}")
            print(f"  Total Posts: {len(db.get_all_posts())}")
            print("=" * 70 + "\n")
        except Exception as e:
            print(f"\n✗ Error processing CSV: {e}")
            print("=" * 70 + "\n")
    else:
        print(f"\nWarning: CSV file '{csv_file}' not found. Starting with empty database.\n")

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
