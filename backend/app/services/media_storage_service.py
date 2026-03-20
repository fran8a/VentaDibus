from __future__ import annotations

import mimetypes
import re
from pathlib import Path
from urllib.parse import unquote
from uuid import uuid4

import requests
from fastapi import UploadFile

from app.config.settings import settings


LOCAL_UPLOAD_DIR = Path("uploads")


def _sanitize_extension(filename: str | None, content_type: str | None) -> str:
    if filename:
        suffix = Path(filename).suffix.lower()
        if suffix:
            return suffix

    if content_type:
        guessed = mimetypes.guess_extension(content_type)
        if guessed:
            return guessed

    return ".bin"


def _build_file_name(prefix: str | None, filename: str | None, content_type: str | None) -> str:
    ext = _sanitize_extension(filename, content_type)
    token = uuid4().hex
    clean_prefix = re.sub(r"[^a-zA-Z0-9_-]", "", (prefix or "").strip())
    return f"{clean_prefix}_{token}{ext}" if clean_prefix else f"{token}{ext}"


def _normalized_mode() -> str:
    return settings.media_storage_mode.strip().lower()


def _is_supabase_mode() -> bool:
    return _normalized_mode() == "supabase"


def _get_supabase_public_prefix() -> str:
    if not settings.supabase_url:
        return ""
    return f"{settings.supabase_url.rstrip('/')}/storage/v1/object/public/{settings.supabase_storage_bucket}/"


def _extract_supabase_object_path(url: str) -> str | None:
    prefix = _get_supabase_public_prefix()
    if not prefix or not url.startswith(prefix):
        return None
    return unquote(url[len(prefix):])


def _delete_local_file_if_exists(image_url: str) -> None:
    relative_path = image_url.lstrip("/")
    file_path = Path(".") / relative_path
    if file_path.exists() and file_path.is_file():
        file_path.unlink()


def save_upload_file(upload: UploadFile, folder: str, *, prefix: str | None = None) -> str:
    file_name = _build_file_name(prefix, upload.filename, upload.content_type)
    object_path = f"{folder.strip('/')}/{file_name}"

    if _is_supabase_mode():
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise RuntimeError("Supabase storage mode requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")

        content = upload.file.read()
        upload_endpoint = (
            f"{settings.supabase_url.rstrip('/')}/storage/v1/object/"
            f"{settings.supabase_storage_bucket}/{object_path}"
        )
        response = requests.post(
            upload_endpoint,
            headers={
                "apikey": settings.supabase_service_role_key,
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "Content-Type": upload.content_type or "application/octet-stream",
                "x-upsert": "false",
            },
            data=content,
            timeout=30,
        )
        if response.status_code >= 400:
            raise RuntimeError(f"Failed to upload file to Supabase storage: {response.text}")

        public_prefix = _get_supabase_public_prefix()
        if not public_prefix:
            raise RuntimeError("Could not build Supabase public URL")

        return f"{public_prefix}{object_path}"

    upload_dir = LOCAL_UPLOAD_DIR / folder.strip("/")
    upload_dir.mkdir(parents=True, exist_ok=True)
    local_path = upload_dir / file_name
    with local_path.open("wb") as buffer:
        buffer.write(upload.file.read())

    return f"/{upload_dir.as_posix()}/{file_name}"


def delete_uploaded_file(image_url: str) -> None:
    if not image_url:
        return

    if image_url.startswith("/uploads/"):
        _delete_local_file_if_exists(image_url)
        return

    if _is_supabase_mode():
        object_path = _extract_supabase_object_path(image_url)
        if not object_path or not settings.supabase_url or not settings.supabase_service_role_key:
            return

        delete_endpoint = (
            f"{settings.supabase_url.rstrip('/')}/storage/v1/object/{settings.supabase_storage_bucket}"
        )
        requests.delete(
            delete_endpoint,
            headers={
                "apikey": settings.supabase_service_role_key,
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "Content-Type": "application/json",
            },
            json=[object_path],
            timeout=30,
        )
