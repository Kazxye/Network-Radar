import os
from pathlib import Path

class OUIResolver:
    def __init__(self):
        self.oui_map: dict[str, str] = {}
        self._load_database()
    
    def _load_database(self):
        oui_path = Path(__file__).parent.parent.parent / "data" / "oui.txt"
        
        if not oui_path.exists():
            return
        
        with open(oui_path, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if "(hex)" in line:
                    parts = line.split("(hex)")
                    if len(parts) == 2:
                        mac_prefix = parts[0].strip().replace("-", "").upper()
                        vendor = parts[1].strip()
                        self.oui_map[mac_prefix] = vendor
    
    def resolve(self, mac: str) -> str | None:
        mac_clean = mac.upper().replace(":", "").replace("-", "")
        prefix = mac_clean[:6]
        return self.oui_map.get(prefix)

resolver = OUIResolver()

def get_vendor(mac: str) -> str | None:
    return resolver.resolve(mac)
