# Kakioko (カキオコ)

プライバシー重視の AI 文字起こしアプリケーション。
デフォルトではローカルの Whisper モデルを使用して音声データを外部に送信することなく文字起こしを行います。
必要に応じて AWS クラウド (Amazon Transcribe) を利用することも可能です。

## 特徴

- **プライバシーファースト**: ローカル処理がデフォルト。音声データはあなたのPCから出ません。
- **モダンなUI**: Next.js と TailwindCSS による美しいインターフェース。
- **録音機能**: ブラウザ上で直接録音して文字起こしが可能。
- **クラウドフォールバック**: 処理速度や精度が必要な場合は、AWS クラウドを利用可能 (要設定)。

## 必要要件

- **Python 3.10+**: バックエンドの実行に必要
- **Node.js 18+**: フロントエンドの実行に必要
- **FFmpeg**: ローカルでの音声処理に必要
  - Ubuntu: `sudo apt install ffmpeg`
  - Mac: `brew install ffmpeg`

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/hideyuki/kakioko.git
cd kakioko
```

### 2. バックエンド (Python) のセットアップ

```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

### 3. フロントエンド (Next.js) のセットアップ

```bash
cd frontend
npm install
cd ..
```

## 実行方法

ターミナルを2つ開き、以下を実行してください。

**ターミナル 1 (バックエンド)**
```bash
source backend/venv/bin/activate
cd backend
uvicorn main:app --reload --port 8000
```

**ターミナル 2 (フロントエンド)**
```bash
cd frontend
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## クラウドモード (AWS) の設定

クラウドモード (Amazon Transcribe) を使用する場合は、以下の環境変数を設定してバックエンドを起動してください。

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=ap-northeast-1
export AWS_BUCKET_NAME=your_s3_bucket_name
```
