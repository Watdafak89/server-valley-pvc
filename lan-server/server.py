#!/usr/bin/env python3
"""
Server Valley — Classroom LAN Multiplayer Server (Zero-Dependency Python 3)
Run: python3 lan-server/server.py [port]
Serves both the game files (http://<SERVER-IP>:8080/) and real-time room sync APIs.
"""
import json
import os
import socket
import sys
import time
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

LOCK = threading.Lock()
ROOMS = {}  # room_code -> { "players": {id: {...}}, "coop_units": set(), "chats": [], "seq": 0 }


def get_room(code):
    code = (code or "CLASS1").upper()
    if code not in ROOMS:
        ROOMS[code] = {"players": {}, "coop_units": set(), "chats": [], "seq": 0}
    return ROOMS[code]


def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


class ServerValleyHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def log_message(self, fmt, *args):
        # Quiet normal polling logs
        if "/api/" not in (args[0] if args else ""):
            super().log_message(fmt, *args)

    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def send_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw) if raw else {}
        except Exception:
            return self.send_json({"error": "invalid json"}, 400)

        now = time.time()

        if self.path == "/api/sync":
            with LOCK:
                room = get_room(payload.get("room"))
                player = payload.get("player")
                if isinstance(player, dict) and player.get("id"):
                    player["lastSeenServer"] = now
                    room["players"][player["id"]] = player
                    if payload.get("coopShared", True):
                        for u in player.get("completedUnits", []):
                            room["coop_units"].add(u)

                # Prune stale players (>12s silent)
                stale = [pid for pid, p in room["players"].items() if now - p.get("lastSeenServer", 0) > 12]
                for pid in stale:
                    del room["players"][pid]

                # Auto-clear room chat when other players disconnect and room has no active peers left
                chat_cleared = False
                if len(room["players"]) <= 1 and len(stale) > 0:
                    room["chats"] = []
                    room["seq"] = 0
                    chat_cleared = True

                last_seq = int(payload.get("lastChatSeq", 0))
                new_chats = [c for c in room["chats"] if c.get("seq", 0) > last_seq]

                return self.send_json({
                    "ok": True,
                    "players": list(room["players"].values()),
                    "coopUnits": sorted(room["coop_units"]),
                    "chats": new_chats,
                    "chatCleared": chat_cleared
                })

        if self.path == "/api/chat":
            with LOCK:
                room = get_room(payload.get("room"))
                entry = payload.get("entry")
                if isinstance(entry, dict) and entry.get("text"):
                    room["seq"] += 1
                    entry["seq"] = room["seq"]
                    room["chats"].append(entry)
                    if len(room["chats"]) > 80:
                        room["chats"] = room["chats"][-80:]
                return self.send_json({"ok": True, "seq": room["seq"]})

        return self.send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    lan_ip = get_lan_ip()
    print("=" * 62)
    print("  SERVER VALLEY — CLASSROOM LAN MULTIPLAYER SERVER (Python)")
    print("=" * 62)
    print(f"  เครื่องครู (Local) : http://localhost:{PORT}")
    print(f"  วง LAN ห้องแล็บ    : http://{lan_ip}:{PORT}")
    print("  ให้นักเรียนเปิดเบราว์เซอร์เข้า URL ด้านบนแล้วกดปุ่ม '👥 เล่นกับเพื่อน' -> โหมด LAN")
    print("  กด Ctrl+C เพื่อหยุดเซิร์ฟเวอร์")
    print("=" * 62)
    server = ThreadingHTTPServer(("0.0.0.0", PORT), ServerValleyHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nปิดเซิร์ฟเวอร์เรียบร้อยแล้ว")
