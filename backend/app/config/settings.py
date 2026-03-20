from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Google OAuth
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str
    
    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Database (PostgreSQL — set in .env, e.g. Supabase connection string)
    database_url: str
    
    # CORS
    frontend_url: str = "http://localhost:5173"

    # Media storage
    media_storage_mode: str = "local"  # local | supabase
    public_base_url: Optional[str] = None
    supabase_url: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    supabase_storage_bucket: str = "retratos"  

    # Admins
    admin_emails: str

    @property
    def admin_emails_list(self) -> set[str]:
        return {
            email.strip().lower()
            for email in self.admin_emails.split(",")
            if email.strip()
        }
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
