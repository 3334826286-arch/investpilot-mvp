from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "InvestPilot API"
    app_version: str = "0.2.1"
    release_channel: str = "public-beta"
    log_level: str = "INFO"
    env: str = "development"
    api_prefix: str = "/v1"
    cors_origins: str = "*"
    slow_request_threshold_ms: int = 1200
    advanced_data_mode: str = "hybrid"
    preferred_fundamentals_provider: str = "AKShare / Eastmoney"
    preferred_news_provider: str = "Eastmoney News"
    preferred_research_provider: str = "Eastmoney Research"
    premium_fundamentals_provider: str = "Daloopa"
    premium_news_provider: str = "Dow Jones Factiva"
    external_request_timeout_seconds: int = 15
    cache_ttl_seconds: int = 300
    market_cache_ttl_seconds: int = 180
    stock_cache_ttl_seconds: int = 600
    screener_cache_ttl_seconds: int = 600
    calendar_cache_ttl_seconds: int = 1800
    search_cache_ttl_seconds: int = 900
    document_cache_ttl_seconds: int = 1800
    default_watch_symbols: str = "300750,601899,000333,688111,600036"

    model_config = SettingsConfigDict(
        env_prefix="INVESTPILOT_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @property
    def watch_symbols(self) -> list[str]:
        return [item.strip() for item in self.default_watch_symbols.split(",") if item.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
