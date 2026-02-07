import os
import time
import uuid
import boto3
import requests
import whisper
import torch

# Global state for model caching
current_model = None
current_model_name = None
current_device = None

def get_model(model_name="base", use_gpu=True):
    global current_model, current_model_name, current_device
    
    device = "cuda" if use_gpu and torch.cuda.is_available() else "cpu"
    
    # If model is already loaded with same config, return it
    if current_model is not None and current_model_name == model_name and current_device == device:
        return current_model
    
    print(f"Loading Whisper model: {model_name} on {device}...")
    
    # Unload previous model if exists to free memory
    if current_model is not None:
        del current_model
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            
    try:
        current_model = whisper.load_model(model_name, device=device)
        current_model_name = model_name
        current_device = device
        print("Model loaded.")
        return current_model
    except Exception as e:
        print(f"Error loading model: {e}")
        # Fallback to base on CPU if failure
        if device == "cuda":
            print("Falling back to CPU...")
            return get_model(model_name, use_gpu=False)
        raise e

def transcribe_audio(file_path: str, mode: str = "local", prompt: str = None, language: str = None, model_name: str = "base", use_gpu: bool = True):
    """
    Transcribe audio using either local Whisper or AWS Cloud (via Amazon Transcribe).
    """
    if mode == "cloud":
        return transcribe_cloud(file_path, language)
    else:
        return transcribe_local(file_path, prompt, language, model_name, use_gpu)

def transcribe_local(file_path: str, prompt: str = None, language: str = None, model_name: str = "base", use_gpu: bool = True):
    """
    Transcribe audio using the local Whisper model.
    """
    if not os.path.exists(file_path):
        return {"error": "File not found"}
    
    try:
        model = get_model(model_name, use_gpu)
        
        # Use beam search for better quality
        options = {
            "beam_size": 5,
            "best_of": 5,
            "patience": 1.0
        }
        if prompt:
            options["initial_prompt"] = prompt
        if language and language != "auto":
            # Whisper expects 2-letter code (e.g. "ja") usually, but "ja-JP" might fail.
            # Truncate to first 2 characters if it looks like a locale code.
            if "-" in language:
                 options["language"] = language.split("-")[0]
            else:
                 options["language"] = language

        result = model.transcribe(file_path, **options)
        return {"text": result["text"]}
    except Exception as e:
        return {"error": str(e)}

def transcribe_cloud(file_path: str, language: str = "auto"):
    """
    Transcribe audio using AWS Amazon Transcribe.
    Requires AWS credentials and AWS_BUCKET_NAME environment variable.
    """
    bucket_name = os.environ.get("AWS_BUCKET_NAME")
    region = os.environ.get("AWS_REGION")
    
    if not bucket_name:
        return {"error": "AWS_BUCKET_NAME environment variable not set"}
    
    if not region:
        return {"error": "AWS_REGION environment variable not set"}

    if not os.path.exists(file_path):
        return {"error": "File not found"}

    try:
        s3 = boto3.client('s3', region_name=region)
        transcribe = boto3.client('transcribe', region_name=region)
        
        file_name = os.path.basename(file_path)
        object_name = f"kakioko/{uuid.uuid4()}-{file_name}"
        
        # 1. Upload to S3
        s3.upload_file(file_path, bucket_name, object_name)
        
        # 2. Start Transcription Job
        job_name = f"kakioko-{uuid.uuid4()}"
        media_uri = f"s3://{bucket_name}/{object_name}"
        
        transcription_job_args = {
            "TranscriptionJobName": job_name,
            "Media": {'MediaFileUri': media_uri},
            "MediaFormat": file_name.split('.')[-1],
        }

        if language == "auto":
            transcription_job_args["IdentifyLanguage"] = True
        else:
            transcription_job_args["LanguageCode"] = language or 'ja-JP'

        transcribe.start_transcription_job(**transcription_job_args)
        
        # 3. Poll for completion
        while True:
            status = transcribe.get_transcription_job(TranscriptionJobName=job_name)
            job_status = status['TranscriptionJob']['TranscriptionJobStatus']
            
            if job_status in ['COMPLETED', 'FAILED']:
                break
            time.sleep(2)
            
        if job_status == 'COMPLETED':
            transcript_uri = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
            response = requests.get(transcript_uri)
            data = response.json()
            # Clean up S3
            s3.delete_object(Bucket=bucket_name, Key=object_name)
            return {"text": data['results']['transcripts'][0]['transcript']}
        else:
            return {"error": "Transcription job failed"}
            
    except Exception as e:
        return {"error": str(e)}
