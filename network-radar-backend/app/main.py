import asyncio
import time
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models import NetworkDevice, ScanResult, ScanStatus, DeviceType, DeviceStatus
from app.websocket import manager
from app.scanner import arp_scan, get_local_network, scan_ports, quick_scan, guess_device_type

devices_cache: dict[str, NetworkDevice] = {}
scan_status = ScanStatus(is_scanning=False)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 {settings.app_name} iniciando...")
    network, gateway = get_local_network()
    print(f"📡 Rede detectada: {network} (Gateway: {gateway})")
    yield
    print("👋 Encerrando...")

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/network")
async def get_network_info():
    network, gateway = get_local_network()
    return {
        "network_cidr": network,
        "gateway_ip": gateway
    }

@app.get("/api/devices")
async def get_devices():
    return list(devices_cache.values())

@app.get("/api/devices/{ip}")
async def get_device(ip: str):
    for device in devices_cache.values():
        if device.ip == ip:
            return device
    raise HTTPException(status_code=404, detail="Device not found")

@app.post("/api/devices/{ip}/scan-ports")
async def scan_device_ports(ip: str):
    for device_id, device in devices_cache.items():
        if device.ip == ip:
            ports = await scan_ports(ip)
            device.ports = ports
            device.device_type = guess_device_type(
                device.mac, 
                device.vendor, 
                device.hostname,
                [p.number for p in ports]
            )
            
            await manager.emit("device_updated", device.model_dump(mode="json"))
            return device
    
    raise HTTPException(status_code=404, detail="Device not found")

@app.get("/api/scan/status")
async def get_scan_status():
    return scan_status

@app.post("/api/scan")
async def start_scan():
    global scan_status
    
    if scan_status.is_scanning:
        raise HTTPException(status_code=409, detail="Scan already in progress")
    
    asyncio.create_task(run_scan())
    return {"message": "Scan started"}

async def run_scan():
    global scan_status, devices_cache
    
    scan_status.is_scanning = True
    scan_status.progress = 0
    scan_status.devices_found = 0
    
    await manager.emit("scan_started")
    
    network, gateway = get_local_network()
    start_time = time.time()
    
    async def on_device_found(device: NetworkDevice):
        global scan_status
        
        ports = await quick_scan(device.ip)
        device.ports = ports
        device.device_type = guess_device_type(
            device.mac,
            device.vendor,
            device.hostname,
            [p.number for p in ports]
        )
        
        if device.ip == gateway:
            device.device_type = DeviceType.ROUTER
        
        device.status = DeviceStatus.ONLINE
        
        if device.id in devices_cache:
            device.first_seen = devices_cache[device.id].first_seen
        
        devices_cache[device.id] = device
        scan_status.devices_found += 1
        
        await manager.emit("device_found", device.model_dump(mode="json"))
    
    try:
        found_ids = set()
        
        devices = await arp_scan(network, on_device_found)
        
        for device in devices:
            found_ids.add(device.id)
        
        for device_id, device in devices_cache.items():
            if device_id not in found_ids:
                device.status = DeviceStatus.OFFLINE
                await manager.emit("device_updated", device.model_dump(mode="json"))
        
        duration = (time.time() - start_time) * 1000
        
        result = ScanResult(
            timestamp=datetime.now(),
            network_cidr=network,
            gateway_ip=gateway,
            devices=list(devices_cache.values()),
            scan_duration=round(duration, 2)
        )
        
        await manager.emit("scan_completed", result.model_dump(mode="json"))
        
    except Exception as e:
        await manager.emit("scan_error", {"error": str(e)})
    
    finally:
        scan_status.is_scanning = False
        scan_status.progress = 100

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        await manager.send(websocket, {
            "type": "connected",
            "data": {"message": "Connected to Network Radar"}
        })
        
        if devices_cache:
            await manager.send(websocket, {
                "type": "devices_list",
                "data": {"devices": [d.model_dump(mode="json") for d in devices_cache.values()]}
            })
        
        while True:
            data = await websocket.receive_text()
            
            if data == "ping":
                await manager.send(websocket, {"type": "pong"})
            elif data == "scan":
                if not scan_status.is_scanning:
                    asyncio.create_task(run_scan())
                    
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
