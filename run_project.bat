@echo off
setlocal enabledelayedexpansion
title Cosmic Delivery - Launcher

echo.
echo  ###################################################
echo  #                                                 #
echo  #   COSMIC DELIVERY: REACT + FASTAPI LAUNCHER     #
echo  #                                                 #
echo  ###################################################
echo.

:: Detect if we are in the right directory
if not exist "frontend" (
    echo [ERROR] Folder 'frontend' not found! Make sure you run this from the project root.
    pause
    exit /b
)

:: Backend Start
echo [1/2] Launching Backend Server...
start "Cosmic Backend (FastAPI)" cmd /k "cd /d %~dp0backend && echo Status: Starting FastAPI... && python main.py"

:: Frontend Start
echo [2/2] Launching Frontend (Vite)...
echo.
echo [!] TIP: If this is your first run, Vite might ask to install dependencies.
echo [!] Frontend will be available at http://localhost:5173
echo.

:: Check if node_modules exists, if not, offer to install
if not exist "frontend\node_modules\" (
    echo [WARN] node_modules not found in frontend. Installing now...
    start "Cosmic Frontend (Install + Run)" cmd /k "cd /d %~dp0frontend && npm install && echo. && echo Status: Starting Dev Server... && npm run dev"
) else (
    start "Cosmic Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"
)

echo.
echo ===================================================
echo  SERVICES ARE STARTING IN SEPARATE WINDOWS
echo.
echo  Backend API:   http://localhost:8000
echo  Frontend App:  http://localhost:5173
echo ===================================================
echo.
echo Press any key to close this launcher (servers will stay active).
pause > nul
