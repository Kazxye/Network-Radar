from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "Network Radar"
    debug: bool = True
    
    scan_timeout: float = 3.0
    port_scan_timeout: float = 1.0
    common_ports: list[int] = [
        21, 22, 23, 25, 53, 80, 110, 143, 443, 445,
        993, 995, 3306, 3389, 5432, 5900, 8080, 8443
    ]

settings = Settings()
