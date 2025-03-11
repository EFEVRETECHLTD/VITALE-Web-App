@echo off
echo Starting React app with network access...
echo.
echo Your local IP address is:
ipconfig | findstr "IPv4"
echo.
echo Other computers on the network can access the app at:
echo http://192.168.10.110:3000
echo.
npm start
