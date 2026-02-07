import os
import time
import uuid
import boto3
import requests
import whisper

# Load model globally to avoid reloading on every request
# Using "large-v3-turbo" for better accuracy on GPU
model_name = os.getenv("WHISPER_MODEL", "large-v3-turbo")
print(f"Loading Whisper model: {model_name}...")
model = whisper.load_model(model_name)
print("Model loaded.")

def transcribe_audio(file_path: str, mode: str = "local", prompt: str = None, language: str = None):
    """
    Transcribe audio using either local Whisper or AWS Cloud (via Amazon Transcribe).
    """
    if mode == "cloud":
        return transcribe_cloud(file_path)
    else:
        return transcribe_local(file_path, prompt, language)

def transcribe_local(file_path: str, prompt: str = None, language: str = None):
    """
    Transcribe audio using the local Whisper model.
    """
    if not os.path.exists(file_path):
        return {"error": "File not found"}
    
    try:
        # Use beam search for better quality
        options = {
            "beam_size": 5,
            "best_of": 5,
            "patience": 1.0
        }
        if prompt:
            options["initial_prompt"] = prompt
        if language:
            options["language"] = language

        result = model.transcribe(file_path, **options)
        return {"text": result["text"]}
    except Exception as e:
        return {"error": str(e)}

def transcribe_cloud(file_path: str):
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
        
        transcribe.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={'MediaFileUri': media_uri},
            MediaFormat=file_name.split('.')[-1],
            LanguageCode='ja-JP' # Defaulting to Japanese as per user name/context
        )
        
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
