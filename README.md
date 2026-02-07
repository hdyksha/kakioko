# Kakioko

A privacy-focused AI transcription application.
By default, it uses a local Whisper model to transcribe audio data without sending it externally.
Optionally, you can use AWS Cloud (Amazon Transcribe) if needed.

## Features

- **Privacy First**: Local processing is the default. Audio data does not leave your PC.
- **Modern UI**: A beautiful interface built with Next.js and TailwindCSS.
- **Recording Capability**: Record and transcribe directly in the browser.
- **Cloud Fallback**: AWS Cloud can be used when processing speed or accuracy is required (requires configuration).

## Prerequisites

- **Python 3.10+**: Required to run the backend.
- **Node.js 18+**: Required to run the frontend.
- **FFmpeg**: Required for local audio processing.
  - Ubuntu: `sudo apt install ffmpeg`
  - Mac: `brew install ffmpeg`

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/hideyuki/kakioko.git
cd kakioko
```

### 2. Backend (Python) Setup

```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

### 3. Frontend (Next.js) Setup

```bash
cd frontend
npm install
cd ..
```

## How to Run

Open two terminals and run the following commands:

**Terminal 1 (Backend)**
```bash
source backend/venv/bin/activate
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 (Frontend)**
```bash
cd frontend
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

## Cloud Mode (AWS) Configuration

If you wish to use Cloud Mode (Amazon Transcribe), set the following environment variables before starting the backend.

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=ap-northeast-1
export AWS_BUCKET_NAME=your_s3_bucket_name
```
