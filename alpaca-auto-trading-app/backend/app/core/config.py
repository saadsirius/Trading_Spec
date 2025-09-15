from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # API Configuration
    app_name: str = Field(default="Alpaca Trading API", description="Application name")
    debug: bool = Field(default=False, description="Debug mode")
    version: str = Field(default="1.0.0", description="API version")
    
    # Server Configuration
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port")
    
    # Alpaca API Configuration
    alpaca_api_key_id: str = Field(..., description="Alpaca API Key ID")
    alpaca_secret_key: str = Field(..., description="Alpaca Secret Key")
    alpaca_paper_base_url: str = Field(
        default="https://paper-api.alpaca.markets",
        description="Alpaca Paper Trading Base URL"
    )
    alpaca_live_base_url: str = Field(
        default="https://api.alpaca.markets",
        description="Alpaca Live Trading Base URL"
    )
    
    # OpenAI Configuration
    openai_api_key: str = Field(..., description="OpenAI API Key")
    
    # Database Configuration
    database_url: str = Field(
        default="sqlite+aiosqlite:///./app.db",
        description="Database connection URL"
    )
    
    # Security
    secret_key: str = Field(..., description="Secret key for JWT tokens")
    access_token_expire_minutes: int = Field(
        default=30,
        description="Access token expiration time in minutes"
    )
    
    # CORS Configuration
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        description="Allowed CORS origins"
    )


# Global settings instance
settings = Settings()
