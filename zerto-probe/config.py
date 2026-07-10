from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configuración del zerto-probe. Se conecta a DOS ZVMA (Zerto Virtual
    Manager Appliance): el de origen (site remoto/producción) y el de
    destino (site de recuperación/DR).
    """
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # ZVMA de origen (site de producción / "Remote" en la UI)
    origin_zvma_host: str
    origin_zvma_username: str
    origin_zvma_password: str
    origin_zvma_label: str = "ResilienceApp Remote"

    # ZVMA de destino (site de recuperación / "Local" en la UI)
    destination_zvma_host: str
    destination_zvma_username: str
    destination_zvma_password: str
    destination_zvma_label: str = "ResilienceApp Local"

    # Cliente de Keycloak configurado en el ZVMA (10.x suele ser "zerto-client";
    # en 9.x puede ser "zerto-api" — ajustar si el login falla con invalid_client)
    keycloak_client_id: str = "zerto-client"

    # El certificado del ZVMA es autofirmado por defecto
    verify_ssl: bool = False

    # Cache de datos agregados en segundos (evita machacar la API en cada refresh del dashboard)
    cache_ttl_seconds: int = 5


@lru_cache
def get_settings() -> Settings:
    return Settings()
