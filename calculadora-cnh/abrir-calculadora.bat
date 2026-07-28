@echo off
cd /d "%~dp0"
echo Abrindo a Calculadora CNH, aguarde...
start "" cmd /c "timeout /t 3 >nul && start http://localhost:5173"
npm.cmd run dev
