from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class DeviceStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    UNKNOWN = "unknown"

class DeviceType(str, Enum):
    ROUTER = "router"
    COMPUTER = "computer"
    MOBILE = "mobile"
    SERVER = "server"
    IOT = "iot"
    PRINTER = "printer"
    UNKNOWN = "unknown"

class Port(BaseModel):
    number: int
    protocol: str = "tcp"
    service: str = ""
    state: str = "open"

class NetworkDevice(BaseModel):
    id: str
    ip: str
    mac: str
    hostname: str | None = None
    vendor: str | None = None
    device_type: DeviceType = DeviceType.UNKNOWN
    status: DeviceStatus = DeviceStatus.UNKNOWN
    last_seen: datetime
    first_seen: datetime
    ports: list[Port] = []
    response_time: float | None = None

class ScanResult(BaseModel):
    timestamp: datetime
    network_cidr: str
    gateway_ip: str
    devices: list[NetworkDevice]
    scan_duration: float

class ScanStatus(BaseModel):
    is_scanning: bool
    progress: int = 0
    devices_found: int = 0

class WSMessage(BaseModel):
    type: str
    data: dict = {}
