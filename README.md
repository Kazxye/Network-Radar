# Network Radar

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)
![Scapy](https://img.shields.io/badge/Scapy-2.5-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

**Ferramenta de monitoramento de rede local em tempo real com interface estilo radar.**

</div>

---

## Preview

O Network Radar escaneia sua rede local usando ARP e exibe os dispositivos encontrados em uma interface visual interativa com animação de radar.

### Funcionalidades

- **Descoberta automática** — Detecta dispositivos na rede via ARP scan
- **Ping sweep** — Acorda dispositivos dormindo (celulares, IoT) antes do scan
- **Identificação de fabricante** — Resolve MAC address para vendor (Apple, Samsung, etc)
- **Port scanning** — Detecta portas abertas e serviços
- **Tempo real** — Atualização via WebSocket
- **Interface interativa** — Radar animado com filtros e busca

---

## Estrutura

```
Network Radar/
├── network-radar-frontend/     # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/         # Radar, DeviceList, Dashboard
│   │   ├── hooks/              # useNetworkData (WebSocket)
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # Positioning, helpers
│   └── package.json
│
├── network-radar-backend/      # FastAPI + Scapy
│   ├── app/
│   │   ├── main.py             # API endpoints
│   │   ├── models.py           # Pydantic schemas
│   │   ├── websocket.py        # Connection manager
│   │   └── scanner/            # ARP, ports, OUI
│   ├── data/
│   │   └── oui.txt             # MAC vendor database
│   └── requirements.txt
│
└── README.md
```

---

## Requisitos

- **Node.js** 18+
- **Python** 3.11+
- **Npcap** (Windows) — https://npcap.com/#download
- **Permissões de administrador** (para ARP scan)

---

## Instalação

### Backend

```bash
cd network-radar-backend

# Criar ambiente virtual
python -m venv venv

# Ativar (Windows)
venv\Scripts\activate

# Ativar (Linux/Mac)
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### Frontend

```bash
cd network-radar-frontend

npm install
```

---

## Executar

### 1. Backend (como Administrador)

```bash
cd network-radar-backend
venv\Scripts\activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend

```bash
cd network-radar-frontend
npm run dev
```

### 3. Acessar

- **Frontend:** http://localhost:5173
- **API:** http://localhost:8000
- **Docs:** http://localhost:8000/docs

---

## API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Status da API |
| GET | `/api/network` | Info da rede local |
| GET | `/api/devices` | Lista dispositivos |
| GET | `/api/devices/{ip}` | Detalhes de um device |
| POST | `/api/devices/{ip}/scan-ports` | Scan de portas |
| POST | `/api/scan` | Iniciar scan |
| GET | `/api/scan/status` | Status do scan |
| WS | `/ws` | WebSocket |

---

## WebSocket Events

### Servidor → Cliente

```javascript
{ type: "connected", data: {} }
{ type: "scan_started", data: {} }
{ type: "device_found", data: { ip, mac, vendor, ... } }
{ type: "device_updated", data: { ip, status, ... } }
{ type: "scan_completed", data: { devices, scan_duration } }
```

### Cliente → Servidor

```
ping    // responde com pong
scan    // inicia novo scan
```

---

## Stack

### Frontend
- React 18
- TypeScript
- Vite
- Framer Motion
- Lucide Icons
- WebSocket API

### Backend
- FastAPI
- Scapy (ARP/ICMP)
- Pydantic
- Uvicorn
- AsyncIO

---

## Notas

### Windows
- Instale o **Npcap** com "WinPcap API-compatible Mode"
- Execute o backend como **Administrador**

### MAC Randomizado
Celulares modernos usam MAC aleatório por privacidade. Para ver o fabricante real, desative "Endereço Privado" nas configurações de Wi-Fi do dispositivo.

### Dispositivos não aparecem?
O ping sweep acorda dispositivos dormindo, mas alguns podem não responder. Tente:
1. Desbloquear a tela do celular durante o scan
2. Verificar se não há AP Isolation no roteador
3. Confirmar que todos estão na mesma sub-rede

---

## Licença

MIT © 2024
