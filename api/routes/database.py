"""
Database management API endpoints
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime

# Import the save function from main_generate
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from main_generate import save_database_to_json

router = APIRouter()


@router.post("/database/save")
async def save_database():
    """
    Save the current in-memory database to a JSON file
    
    Returns:
        dict: Success message with filename and metadata
    """
    try:
        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"db_saved_{timestamp}.json"
        
        # Call the save function from main_generate
        saved_file = save_database_to_json(filename)
        
        return {
            "success": True,
            "message": "Database saved successfully",
            "filename": saved_file,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to save database: {str(e)}"
        )


@router.post("/database/save/overwrite")
async def save_database_overwrite():
    """
    Save the current in-memory database to the default db_generated.json file
    (overwrites the existing file)
    
    Returns:
        dict: Success message with filename and metadata
    """
    try:
        # Save to default filename (will overwrite)
        saved_file = save_database_to_json("db_generated.json")
        
        return {
            "success": True,
            "message": "Database saved successfully (overwritten db_generated.json)",
            "filename": saved_file,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to save database: {str(e)}"
        )

