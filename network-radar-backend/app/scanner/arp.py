import asyncio
import socket
import time
import platform
from datetime import datetime
from scapy.all import ARP, Ether, srp, conf, get_if_list, get_if_addr

from app.models import NetworkDevice, DeviceType, DeviceStatus
from app.scanner.oui import get_vendor
from app.config import settings

conf.verb = 0

def get_working_interface():
    for iface in get_if_list():
        try:
            ip = get_if_addr(iface)
            if ip and not ip.startswith("0.") and not ip.startswith("127."):
                return iface, ip
        except:
            continue
    return None, None

def get_local_network() -> tuple[str, str]:
    iface, local_ip = get_working_interface()
    
    if local_ip:
        parts = local_ip.split(".")
        network = f"{parts[0]}.{parts[1]}.{parts[2]}.0/24"
        gateway = f"{parts[0]}.{parts[1]}.{parts[2]}.1"
        return network, gateway
    
    return "192.168.1.0/24", "192.168.1.1"

def guess_device_type(mac: str, vendor: str | None, hostname: str | None, open_ports: list[int]) -> DeviceType:
    vendor_lower = (vendor or "").lower()
    hostname_lower = (hostname or "").lower()
    
    router_keywords = ["cisco", "netgear", "tp-link", "tplink", "asus", "d-link", "linksys", "ubiquiti", "mikrotik", "huawei"]
    if any(kw in vendor_lower for kw in router_keywords):
        if 80 in open_ports or 443 in open_ports:
            return DeviceType.ROUTER
    
    mobile_keywords = ["apple", "samsung", "xiaomi", "huawei", "oneplus", "google", "motorola", "lg electronics"]
    if any(kw in vendor_lower for kw in mobile_keywords):
        if not any(p in open_ports for p in [22, 80, 443, 445]):
            return DeviceType.MOBILE
    
    printer_keywords = ["hp", "epson", "canon", "brother", "lexmark", "xerox"]
    if any(kw in vendor_lower for kw in printer_keywords):
        return DeviceType.PRINTER
    
    iot_keywords = ["amazon", "sonos", "ring", "nest", "philips hue", "espressif", "tuya", "shelly"]
    if any(kw in vendor_lower for kw in iot_keywords):
        return DeviceType.IOT
    
    if any(kw in hostname_lower for kw in ["server", "nas", "storage", "proxmox", "esxi"]):
        return DeviceType.SERVER
    
    if 22 in open_ports and 3306 in open_ports:
        return DeviceType.SERVER
    
    if any(p in open_ports for p in [445, 3389, 5900]):
        return DeviceType.COMPUTER
    
    if vendor:
        return DeviceType.COMPUTER
    
    return DeviceType.UNKNOWN

def resolve_hostname(ip: str) -> str | None:
    try:
        hostname = socket.gethostbyaddr(ip)[0]
        return hostname.split(".")[0]
    except (socket.herror, socket.gaierror, socket.timeout):
        return None

async def ping_host(ip: str) -> bool:
    try:
        param = "-n" if platform.system().lower() == "windows" else "-c"
        timeout_param = "-w" if platform.system().lower() == "windows" else "-W"
        cmd = ["ping", param, "1", timeout_param, "300", ip]
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL
        )
        await asyncio.wait_for(proc.wait(), timeout=1)
        return proc.returncode == 0
    except:
        return False

async def ping_sweep(network_base: str):
    print(f"[Scan] Ping sweep em {network_base}.0/24...")
    
    tasks = []
    for i in range(1, 255):
        ip = f"{network_base}.{i}"
        tasks.append(ping_host(ip))
    
    await asyncio.gather(*tasks)
    print("[Scan] Ping sweep concluído")

async def arp_scan(network_cidr: str, on_device_found=None) -> list[NetworkDevice]:
    devices = []
    
    iface, local_ip = get_working_interface()
    print(f"[Scan] Usando interface: {iface}")
    print(f"[Scan] IP local: {local_ip}")
    print(f"[Scan] Rede: {network_cidr}")
    
    network_base = ".".join(network_cidr.split("/")[0].split(".")[:-1])
    await ping_sweep(network_base)
    
    await asyncio.sleep(0.5)
    
    arp_request = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=network_cidr)
    
    start_time = time.time()
    
    try:
        answered, _ = await asyncio.to_thread(
            srp, arp_request, timeout=settings.scan_timeout, verbose=False, iface=iface
        )
    except Exception as e:
        print(f"[Scan] Erro no ARP: {e}")
        return devices
    
    print(f"[Scan] Encontrados: {len(answered)} dispositivos")
    
    for sent, received in answered:
        ip = received.psrc
        mac = received.hwsrc.upper()
        
        response_time = (time.time() - start_time) * 1000
        vendor = get_vendor(mac)
        hostname = resolve_hostname(ip)
        
        device = NetworkDevice(
            id=mac.replace(":", ""),
            ip=ip,
            mac=mac,
            hostname=hostname,
            vendor=vendor,
            device_type=DeviceType.UNKNOWN,
            status=DeviceStatus.ONLINE,
            last_seen=datetime.now(),
            first_seen=datetime.now(),
            ports=[],
            response_time=round(response_time, 2)
        )
        
        devices.append(device)
        
        if on_device_found:
            await on_device_found(device)
    
    return devices
