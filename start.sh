#!/bin/bash

# ── Colors ────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ── Project root (wherever this script is placed) ─────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLLENS_DIR="$SCRIPT_DIR"
COMPILER_DIR="$SCRIPT_DIR/online-compiler"

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║         SkillLens Launcher           ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"

# ── Cleanup function — kills all background jobs on Ctrl+C ────
cleanup() {
  echo -e "\n${YELLOW}⏹  Shutting down all services...${NC}"
  kill $(jobs -p) 2>/dev/null
  docker stop skilllens-redis 2>/dev/null
  echo -e "${GREEN}✅ All services stopped.${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Step 1: Check Docker is running ───────────────────────────
echo -e "${BLUE}[1/4] Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# ── Step 2: Start Redis ───────────────────────────────────────
echo -e "\n${BLUE}[2/4] Starting Redis...${NC}"
docker stop skilllens-redis 2>/dev/null
docker rm skilllens-redis 2>/dev/null
docker run -d \
  --name skilllens-redis \
  -p 6379:6379 \
  redis:7-alpine > /dev/null
sleep 2
echo -e "${GREEN}✅ Redis started on port 6379${NC}"

# ── Step 3: Install compiler backend deps if needed ───────────
echo -e "\n${BLUE}[3/4] Setting up compiler backend...${NC}"
if [ ! -d "$COMPILER_DIR/node_modules" ]; then
  echo -e "${YELLOW}   Installing compiler dependencies...${NC}"
  cd "$COMPILER_DIR" && npm install --silent
fi
echo -e "${GREEN}✅ Compiler backend ready${NC}"

# ── Step 4: Install frontend deps if needed ───────────────────
echo -e "\n${BLUE}[4/4] Setting up SkillLens frontend...${NC}"
if [ ! -d "$SKILLLENS_DIR/node_modules" ]; then
  echo -e "${YELLOW}   Installing frontend dependencies...${NC}"
  cd "$SKILLLENS_DIR" && npm install --silent
fi
echo -e "${GREEN}✅ Frontend ready${NC}"

# ── Start all services ────────────────────────────────────────
echo -e "\n${CYAN}🚀 Starting all services...${NC}\n"

# Start compiler backend
cd "$COMPILER_DIR"
echo -e "${BLUE}▶  Compiler backend  → http://localhost:4000${NC}"
node src/server.js > /tmp/compiler-backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 2

# Start worker
echo -e "${BLUE}▶  Code worker       → connected to Redis${NC}"
REDIS_URL=redis://localhost:6379 node src/workers/codeWorker.js > /tmp/compiler-worker.log 2>&1 &
WORKER_PID=$!

sleep 1

# Start frontend
cd "$SKILLLENS_DIR"
echo -e "${BLUE}▶  SkillLens frontend → http://localhost:3000${NC}"
npm run dev > /tmp/skilllens-frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3

# ── Status check ──────────────────────────────────────────────
echo -e "\n${CYAN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All services are running!${NC}"
echo -e "${CYAN}══════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 SkillLens App   →  ${GREEN}http://localhost:3000${NC}"
echo -e "  ⚙️  Compiler API   →  ${GREEN}http://localhost:4000${NC}"
echo -e "  🗄️  Redis          →  ${GREEN}localhost:6379${NC}"
echo ""
echo -e "  📋 Logs:"
echo -e "     Backend  → /tmp/compiler-backend.log"
echo -e "     Worker   → /tmp/compiler-worker.log"
echo -e "     Frontend → /tmp/skilllens-frontend.log"
echo ""
echo -e "${YELLOW}  Press Ctrl+C to stop all services${NC}"
echo -e "${CYAN}══════════════════════════════════════════${NC}\n"

# ── Keep script alive and show live logs ──────────────────────
tail -f /tmp/compiler-backend.log /tmp/compiler-worker.log /tmp/skilllens-frontend.log &

# Wait for all background jobs
wait