# Network Radar — Backend

API e scanner de rede para o Network Radar.

## Stack

- FastAPI
- Scapy (ARP scanning)
- WebSocket (tempo real)
- Pydantic (validação)

## Requisitos

- Python 3.11+
- Permissões de administrador (para ARP scan)

## Instalação

```bash
cd network-radar-backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

## Executar

```bash
# Windows (como Administrador):
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Linux (com sudo):
sudo venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Acesse: http://localhost:8000

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Status da API |
| GET | `/api/network` | Info da rede local |
| GET | `/api/devices` | Lista dispositivos |
| GET | `/api/devices/{ip}` | Detalhes de um device |
| POST | `/api/devices/{ip}/scan-ports` | Scan de portas |
| POST | `/api/scan` | Iniciar scan da rede |
| GET | `/api/scan/status` | Status do scan |
| WS | `/ws` | WebSocket |

## WebSocket

Conecte em `ws://localhost:8000/ws`

### Eventos recebidos

```json
{ "type": "connected", "data": {} }
{ "type": "scan_started", "data": {} }
{ "type": "device_found", "data": { "ip": "...", "mac": "..." } }
{ "type": "device_updated", "data": { "ip": "...", "status": "..." } }
{ "type": "scan_completed", "data": { "devices": [...] } }
```

### Comandos

```
ping     → responde pong
scan     → inicia novo scan
```

## Estrutura

```
app/
├── main.py          # FastAPI app
├── config.py        # Configurações
├── models.py        # Schemas
├── websocket.py     # Gerenciador WS
└── scanner/
    ├── arp.py       # Scan ARP
    ├── ports.py     # Scan de portas
    └── oui.py       # MAC → Fabricante
```

## Notas

- O scan ARP requer permissões elevadas
- A base OUI inclui fabricantes comuns; baixe a versão completa da IEEE se necessário
- Em Windows, pode ser necessário instalar o Npcap
