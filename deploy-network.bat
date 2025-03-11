@echo off
echo Building production version...
call npm run build

echo.
echo Starting production server on port 3000...
echo.
echo Your local IP address is:
ipconfig | findstr "IPv4"
echo.
echo Other computers on the network can access the app at:
echo http://192.168.10.110:3000
echo.

cd build
npx serve -s -l 3000 --host 0.0.0.0
