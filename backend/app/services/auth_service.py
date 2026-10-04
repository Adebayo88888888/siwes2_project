from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError
from jose import jwt
from passlib.context import CryptContext
from app.config.settings import Settings

settings = Settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password[:72], hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password[:72])

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
        return encoded_jwt

    def get_current_user(self, token: str) -> str:
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
            email: str = payload.get("sub")
            if email:
                return email
        except Exception:
            pass
        return "guest@efiko.ai" 