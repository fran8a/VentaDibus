from authlib.integrations.starlette_client import OAuth
from app.config.settings import settings
import httpx
from typing import Optional, Dict

oauth = OAuth()

oauth.register(
    name='google',
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)


class GoogleOAuthService:
    @staticmethod
    async def get_authorization_url(redirect_uri: str) -> str:
        """Obtener URL de autorización de Google"""
        request = type('Request', (), {'url_for': lambda x: redirect_uri})()
        return await oauth.google.authorize_redirect(request, redirect_uri)
    
    @staticmethod
    async def get_user_info(code: str) -> Optional[Dict]:
        """Obtener información del usuario desde Google"""
        try:
            # Intercambiar código por token
            async with httpx.AsyncClient() as client:
                token_response = await client.post(
                    'https://oauth2.googleapis.com/token',
                    data={
                        'code': code,
                        'client_id': settings.google_client_id,
                        'client_secret': settings.google_client_secret,
                        'redirect_uri': settings.google_redirect_uri,
                        'grant_type': 'authorization_code'
                    }
                )
                
                if token_response.status_code != 200:
                    return None
                
                token_data = token_response.json()
                access_token = token_data.get('access_token')
                
                # Obtener información del usuario
                user_response = await client.get(
                    'https://www.googleapis.com/oauth2/v2/userinfo',
                    headers={'Authorization': f'Bearer {access_token}'}
                )
                
                if user_response.status_code != 200:
                    return None
                
                return user_response.json()
        except Exception as e:
            print(f"Error getting user info: {e}")
            return None
