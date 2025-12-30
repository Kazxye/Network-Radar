import asyncio
import socket

from app.models import Port
from app.config import settings

KNOWN_SERVICES = {
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    993: "IMAPS",
    995: "POP3S",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    5900: "VNC",
    8080: "HTTP-Proxy",
    8443: "HTTPS-Alt",
    9100: "JetDirect",
    631: "IPP",
}

async def check_port(ip: str, port: int, timeout: float = None) -> Port | None:
    """Verifica se uma porta está aberta."""
    timeout = timeout or settings.port_scan_timeout
    
    try:
        future = asyncio.open_connection(ip, port)
        reader, writer = await asyncio.wait_for(future, timeout=timeout)
        writer.close()
        await writer.wait_closed()
        
        return Port(
            number=port,
            protocol="tcp",
            service=KNOWN_SERVICES.get(port, ""),
            state="open"
        )
    except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
        return None

async def scan_ports(ip: str, ports: list[int] = None) -> list[Port]:
    """Escaneia múltiplas portas em paralelo."""
    ports = ports or settings.common_ports
    
    tasks = [check_port(ip, port) for port in ports]
    results = await asyncio.gather(*tasks)
    
    return [port for port in results if port is not None]

async def quick_scan(ip: str) -> list[Port]:
    """Scan rápido das portas mais comuns."""
    quick_ports = [22, 80, 443, 445, 3389, 8080]
    return await scan_ports(ip, quick_ports)
