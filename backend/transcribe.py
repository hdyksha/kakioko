import os

def transcribe_audio(file_path: str, mode: str = "local"):
    """
    Transcribe audio using either local Whisper or AWS Bedrock.
    """
    if mode == "cloud":
        return transcribe_bedrock(file_path)
    else:
        return transcribe_local(file_path)

def transcribe_local(file_path: str):
    # TODO: Implement Whisper
    return "Local transcription placeholder"

def transcribe_bedrock(file_path: str):
    # TODO: Implement Bedrock
    return "Bedrock transcription placeholder"
