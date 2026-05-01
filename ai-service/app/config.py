"""Cấu hình từ biến môi trường (load từ .env)."""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: int = int(os.getenv("DB_PORT", "5432"))
    db_name: str = os.getenv("DB_NAME", "mypham")
    db_user: str = os.getenv("DB_USER", "mypham")
    db_password: str = os.getenv("DB_PASSWORD", "mypham123")

    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    embed_model: str = os.getenv("EMBED_MODEL", "models/text-embedding-004")
    chat_model: str = os.getenv("CHAT_MODEL", "models/gemini-1.5-flash")

    port: int = int(os.getenv("PORT", "8000"))
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

    @property
    def db_dsn(self) -> str:
        return (
            f"postgresql://{self.db_user}:{self.db_password}@"
            f"{self.db_host}:{self.db_port}/{self.db_name}"
        )


settings = Settings()
