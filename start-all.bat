@echo off
echo Starting BookVerse Application...
echo.

echo Starting Java Backend in a new window...
start "BookVerse Backend" cmd /k "cd backend-java && d:\untitled\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run"

echo Starting Vite Frontend in a new window...
start "BookVerse Frontend" cmd /k "npm run dev"

echo.
echo Both services are starting. Please wait for the backend bits.
echo Java Backend: http://localhost:8081
echo Vite Frontend: http://localhost:3001
echo.
pause
