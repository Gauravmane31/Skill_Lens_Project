#!/bin/bash

# ── Colors ────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ── Project root (this script lives in <root>/scripts) ────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CLIENT_DIR="$ROOT_DIR/client"
SERVER_DIR="$ROOT_DIR/server"

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║         SkillLens Launcher           ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"

# ── Cleanup function — kills all background jobs on Ctrl+C ────
cleanup() {
  echo -e "\n${YELLOW}⏹  Shutting down all services...${NC}"
  kill $(jobs -p) 2>/dev/null
  echo -e "${GREEN}✅ All services stopped.${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Step 1: Install server deps if needed ──────────────────────
echo -e "${BLUE}[1/3] Setting up backend (server)...${NC}"
if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo -e "${YELLOW}   Installing server dependencies...${NC}"
  (cd "$SERVER_DIR" && npm install --silent)
fi
echo -e "${GREEN}✅ Server ready${NC}"

# ── Step 2: Install client deps if needed ──────────────────────
echo -e "\n${BLUE}[2/3] Setting up frontend (client)...${NC}"
if [ ! -d "$CLIENT_DIR/node_modules" ]; then
  echo -e "${YELLOW}   Installing client dependencies...${NC}"
  (cd "$CLIENT_DIR" && npm install --silent)
fi
echo -e "${GREEN}✅ Client ready${NC}"

# ── Step 3: Start both services ────────────────────────────────
echo -e "\n${BLUE}[3/3] Starting all services...${NC}\n"

echo -e "${BLUE}▶  Backend server → http://localhost:5000${NC}"
(cd "$SERVER_DIR" && npm run dev) > /tmp/skilllens-server.log 2>&1 &
SERVER_PID=$!

sleep 2

echo -e "${BLUE}▶  Frontend client → http://localhost:3000${NC}"
(cd "$CLIENT_DIR" && npm run dev) > /tmp/skilllens-client.log 2>&1 &
CLIENT_PID=$!

sleep 2

# ── Status check ──────────────────────────────────────────────
echo -e "\n${CYAN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All services are running!${NC}"
echo -e "${CYAN}══════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 SkillLens App   →  ${GREEN}http://localhost:3000${NC}"
echo -e "  ⚙️  Backend API    →  ${GREEN}http://localhost:5000${NC}"
echo ""
echo -e "  📋 Logs:"
echo -e "     Server → /tmp/skilllens-server.log"
echo -e "     Client → /tmp/skilllens-client.log"
echo ""
echo -e "${YELLOW}  Press Ctrl+C to stop all services${NC}"
echo -e "${CYAN}══════════════════════════════════════════${NC}\n"

# ── Keep script alive and show live logs ──────────────────────
tail -f /tmp/skilllens-server.log /tmp/skilllens-client.log &

# Wait for all background jobs
wait
