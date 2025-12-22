from google import genai
from pathlib import Path
import time
import os

client = genai.Client(api_key=os.environ.get("API_KEY"))

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

def analyze_video_events(video_content: bytes, file_name: str):
    file_path = UPLOAD_DIR / file_name
    with open(file_path, "wb") as f:
        f.write(video_content)

    uploaded_file = client.files.upload(file=str(file_path))

    status = uploaded_file.state
    while status != "ACTIVE":
        time.sleep(1)
        uploaded_file = client.files.get(name=uploaded_file.name)
        status = uploaded_file.state

    prompt = """
You are a product experience analyst AI. Analyze the uploaded video and perform the following:

1. Detect key user events: errors, pauses, repetitions, hesitations.
2. For each event, generate an object with:
   - timestamp (format mm:ss.SS)
   - type (error | pause | repetition | hesitation)
   - severity (low | medium | high)
   - description (short English text)
3. Define as adjustable variables as considered and simulate as scenarios considered: baseline, change1, change2, etc.
4. For each scenario, provide:
   - expected impact (numeric score 0-100)
   - risk (low | medium | high)
   - trade-offs if any
5. Provide a final recommendation in clear English, add one recommendation for each of the proposed scenarios except baseline.
6. Return everything strictly as JSON with the following structure:

{
  "events": [
    {
      "timestamp": "00:12.34",
      "type": "error",
      "severity": "medium",
      "description": "User clicked wrong button"
    }
  ],
  "scenarios": {
    "baseline": {"score": 70, "risk": "medium"},
    "change1": {"score": 85, "risk": "low"},
    "change2": {"score": 60, "risk": "high"},
    etc
  },
  "recommendation": ["recommendation for change1", "recommendation for change2", etc]
}

Do not include any text outside the JSON. Only JSON output.
"""

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=[prompt, uploaded_file]
    )

    os.remove(file_path)
    client.files.delete(name=uploaded_file.name)

    result = response.candidates[0].content.parts[0].text

    result = result.strip()
    if result.startswith("```json"):
        result = result[len("```json"):].strip()
    elif result.startswith("```"):
        result = result[3:].strip()
    if result.endswith("```"):
        result = result[:-3].strip()

    return result
