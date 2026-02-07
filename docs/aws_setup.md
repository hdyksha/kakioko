# AWS Setup Guide for Kakioko

To use the cloud transcription feature (Amazon Transcribe), you need to set up an AWS IAM User with minimal permissions.

## 1. Create an S3 Bucket

1. Log in to the [AWS Console](https://console.aws.amazon.com/s3/).
2. Navigate to **S3** service.
3. Click **Create bucket**.
4. Choose a unique name (e.g., `kakioko-transcription-bucket`).
5. Choose the region close to you (e.g., `ap-northeast-1` for Tokyo).
6. Keep other settings as default and click **Create bucket**.

## 2. Create an IAM Policy

1. Navigate to **IAM** service in AWS Console.
2. Click **Policies** -> **Create policy**.
3. Click the **JSON** tab and paste the following policy.
   *Replace `YOUR_BUCKET_NAME` with the actual name of the bucket you created in step 1.*

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/kakioko/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "transcribe:StartTranscriptionJob",
                "transcribe:GetTranscriptionJob"
            ],
            "Resource": "*"
        }
    ]
}
```
4. Click **Next**, give the policy a name (e.g., `KakiokoTranscribePolicy`), and click **Create policy**.

## 3. Create an IAM User

1. Navigate to **Users** -> **Create user**.
2. Enter a username (e.g., `kakioko-app-user`).
3. Click **Next**.
4. Select **Attach policies directly**.
5. Search for and select the `KakiokoTranscribePolicy` you just created.
6. Click **Next** -> **Create user**.

## 4. Get Access Keys

1. Click on the newly created user `kakioko-app-user`.
2. Go to the **Security credentials** tab.
3. Scroll down to **Access keys** and click **Create access key**.
4. Select **Application running outside AWS** (or "Other").
5. Click **Next** -> **Create access key**.
6. **Important:** Copy the `Access key ID` and `Secret access key` immediately. You will not be able to see the secret key again.

## 5. Configure Application

1. In the `backend` directory, duplicate `.env.example` to `.env`.
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Edit `backend/.env` with your credentials:
   ```ini
   AWS_ACCESS_KEY_ID=your_access_key_id_here
   AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
   AWS_REGION=ap-northeast-1
   AWS_BUCKET_NAME=your_bucket_name_here
   ```

You are now ready to use the "Cloud" transcription mode!
