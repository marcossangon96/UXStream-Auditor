from fastapi import APIRouter, UploadFile, File
from app.gemini_client import analyze_video_events

router = APIRouter()

@router.post("/analyze")
async def analyze_video(file: UploadFile = File(...)):
    contents = await file.read()
    payload = {
        "filename": file.filename,
        "size_bytes": len(contents),
        "events": [
            {"timestamp": "00:02", "type": "pause", "description": "User hesitated"},
            {"timestamp": "00:15", "type": "error", "description": "User made mistake"},
            {"timestamp": "00:25", "type": "repeat", "description": "Repeated action"}
        ],
        "variables": {
            "variable1": "example adjustment 1",
            "variable2": "example adjustment 2",
            "variable3": "example adjustment 3"
        }
    }
    result = analyze_video_events(payload["events"], payload["variables"])
    return result
