from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    jwt_secret: str
    football_api_key: str = ""
    frontend_url: str = "http://localhost:5173"
    cron_secret: str = ""


settings = Settings()
