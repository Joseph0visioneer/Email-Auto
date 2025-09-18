#!/bin/bash
# 개발 환경 시작 스크립트
# 백엔드와 프론트엔드를 동시에 실행

echo "🚀 Email Automation System - Development Environment"
echo "================================================="

# 프로젝트 루트 디렉토리로 이동
cd "$(dirname "$0")/.."

# 환경 체크
echo "📋 Checking prerequisites..."

# Node.js 체크
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Python 체크
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# MySQL 체크
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL 8.0+ first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# 백엔드 의존성 체크 및 설치
echo "🔧 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

if [ ! -f "venv/pyvenv.cfg" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

cd ..

# 프론트엔드 의존성 체크 및 설치
echo "🔧 Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

cd ..

# 환경변수 파일 체크
if [ ! -f "backend/.env" ] && [ -f "env.example" ]; then
    echo "⚙️ Creating environment file..."
    cp env.example backend/.env
    echo "📝 Please edit backend/.env with your configuration"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "⚙️ Creating frontend environment file..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > frontend/.env.local
fi

# 데이터베이스 상태 체크
echo "🔍 Checking database connection..."
if mysql -u root -e "USE email_automation;" 2>/dev/null; then
    echo "✅ Database connection successful!"
else
    echo "⚠️ Database not found or not accessible."
    echo "📝 Please create the database and run: mysql -u root -p email_automation < database/schema.sql"
fi

echo ""
echo "🎉 Setup complete! Starting development servers..."
echo ""

# 개발 서버 시작
echo "Starting backend server (localhost:5000)..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!

echo "Starting frontend server (localhost:3000)..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers are running!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:5000"
echo "📍 API Docs: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# 시그널 핸들러 설정
trap 'echo "Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID; exit' INT

# 서버들이 종료될 때까지 대기
wait

