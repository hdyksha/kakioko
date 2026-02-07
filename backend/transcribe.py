import os
import whisper

# Load model globally to avoid reloading on every request
# Using "base" model for balance between speed and accuracy for local dev
# Users can change this to "small", "medium", "large" etc.
model = whisper.load_model("base")

def transcribe_audio(file_path: str, mode: str = "local"):
    """
    Transcribe audio using either local Whisper or AWS Bedrock.
    """
    if mode == "cloud":
        return transcribe_bedrock(file_path)
    else:
        return transcribe_local(file_path)

def transcribe_local(file_path: str):
    """
    Transcribe audio using the local Whisper model.
    """
    if not os.path.exists(file_path):
        return {"error": "File not found"}
    
    try:
        result = model.transcribe(file_path)
        return {"text": result["text"]}
    except Exception as e:
        return {"error": str(e)}

def transcribe_bedrock(file_path: str):
    # TODO: Implement Bedrock
    return "Bedrock transcription placeholder"
