import json
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.connections:
            self.connections.remove(websocket)
    
    async def send(self, websocket: WebSocket, message: dict):
        await websocket.send_text(json.dumps(message))
    
    async def broadcast(self, message: dict):
        dead_connections = []
        
        for connection in self.connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                dead_connections.append(connection)
        
        for conn in dead_connections:
            self.disconnect(conn)
    
    async def emit(self, event: str, data: dict = None):
        await self.broadcast({
            "type": event,
            "data": data or {}
        })

manager = ConnectionManager()
