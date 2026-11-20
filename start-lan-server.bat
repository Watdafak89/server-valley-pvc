@echo off
chcp 65001 >nul
title Server Valley — Classroom LAN Server
echo Starting Server Valley Classroom LAN Server on Port 8080...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0lan-server\server.ps1" -Port 8080
pause
