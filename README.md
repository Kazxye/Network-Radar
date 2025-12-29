# Network Radar

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**Visualizador de rede local em tempo real com interface estilo radar.**

[Funcionalidades](#funcionalidades) •
[Instalação](#instalação) •
[Uso](#uso) •
[Estrutura](#estrutura) •
[Roadmap](#roadmap)

</div>

---

## Funcionalidades

- **Radar interativo** — Visualização animada com sweep e dispositivos posicionados por tipo
- **Descoberta de dispositivos** — Exibe IP, MAC, hostname, fabricante e portas abertas
- **Filtros e busca** — Filtre por status (online/offline) ou busque por qualquer campo
- **Tempo real** — Atualização automática do status dos dispositivos
- **Responsivo** — Funciona em desktop, tablet e mobile

## Instalação

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/network-radar.git
cd network-radar

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesse `http://localhost:5173`

## Uso

A aplicação inicia com dados mockados para demonstração. O backend com scanner real será implementado na próxima fase.

**Interações:**
- Clique em um dispositivo no radar ou na lista para ver detalhes
- Use a barra de busca para filtrar dispositivos
- Clique no ícone de filtro para opções avançadas
- Botão "Novo Scan" simula uma nova varredura

## Estrutura

```
src/
├── components/
│   ├── Radar/
│   │   ├── RadarCanvas.tsx    # SVG do radar com animação
│   │   └── RadarDevice.tsx    # Ícone de cada dispositivo
│   ├── DeviceList/
│   │   ├── DeviceList.tsx     # Lista com filtros
│   │   └── DeviceCard.tsx     # Card expandível
│   └── Layout/
│       └── Dashboard.tsx      # Layout principal
├── hooks/
│   └── useNetworkData.ts      # Estado e mock data
├── types/
│   └── network.ts             # Interfaces TypeScript
├── utils/
│   └── positioning.ts         # Cálculo de posições
└── index.css                  # Estilos globais
```

## Stack

| Tecnologia | Uso |
|------------|-----|
| **React 18** | UI components |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **Framer Motion** | Animações |
| **Lucide React** | Ícones |

## Roadmap

- [x] Interface do radar
- [x] Lista de dispositivos
- [x] Filtros e busca
- [ ] Backend com FastAPI
- [ ] Scanner ARP (Scapy)
- [ ] Resolução de fabricante (OUI)
- [ ] Port scanning
- [ ] WebSocket para tempo real
- [ ] Histórico de dispositivos
- [ ] Exportar relatório

## Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
```

## Licença

MIT © 2024
