import json
import os
import base64
import uuid
import boto3

ADMIN_PASSWORD = "somnium2024"

def handler(event: dict, context) -> dict:
    """Загрузка фото и видео товаров в S3-хранилище."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Admin-Password",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    headers = event.get("headers") or {}
    admin_pwd = headers.get("x-admin-password") or headers.get("X-Admin-Password", "")
    if admin_pwd != ADMIN_PASSWORD:
        return {"statusCode": 403, "headers": cors, "body": json.dumps({"error": "Нет доступа"})}

    body = json.loads(event.get("body") or "{}")
    file_data = body.get("file")        # base64 строка
    file_name = body.get("name", "")    # оригинальное имя файла
    file_type = body.get("type", "")    # MIME-тип

    if not file_data or not file_name:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Нужны file и name"})}

    # Определяем расширение и папку
    ext = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else "bin"
    is_video = file_type.startswith("video/") or ext in ("mp4", "mov", "avi", "webm")
    folder = "products/videos" if is_video else "products/images"
    key = f"{folder}/{uuid.uuid4().hex}.{ext}"

    # Декодируем base64
    if "," in file_data:
        file_data = file_data.split(",", 1)[1]
    file_bytes = base64.b64decode(file_data)

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(
        Bucket="files",
        Key=key,
        Body=file_bytes,
        ContentType=file_type or ("video/mp4" if is_video else "image/jpeg"),
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/{key}"
    return {
        "statusCode": 200,
        "headers": cors,
        "body": json.dumps({"url": cdn_url, "is_video": is_video}, ensure_ascii=False),
    }
