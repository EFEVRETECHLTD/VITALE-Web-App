# Accessing the Instrument Status Page from Another PC

This document explains how to make the Instrument Status Page accessible from other computers on your local network.

## Development Mode

To start the application in development mode with network access:

1. Run the `start-network.bat` script:
   ```
   start-network.bat
   ```

2. The script will display your computer's IP address and the URL that other computers can use to access the app.

3. On another computer in the same network, open a web browser and navigate to:
   ```
   http://192.168.10.110:3000
   ```
   (Replace the IP address with your actual IP address if different)

## Production Mode

For better performance in a production environment:

1. Run the `deploy-network.bat` script:
   ```
   deploy-network.bat
   ```

2. This will create an optimized production build and serve it over the network.

3. On another computer in the same network, open a web browser and navigate to:
   ```
   http://192.168.10.110:3000
   ```
   (Replace the IP address with your actual IP address if different)

## Troubleshooting

If other computers cannot access the application:

1. Make sure both computers are on the same network.
2. Check if your firewall is blocking port 3000. You may need to add an exception.
3. Verify that the HOST environment variable is set to "0.0.0.0" in the start script.
4. Try using your computer's hostname instead of IP address.

## For Advanced Users

If you need to change the port (default is 3000):

1. Edit the `start-network.bat` file and add `PORT=your_port_number` before the npm start command.
2. Update the URLs in this document accordingly.

## API Server

The application communicates with an API server running on port 3001. Make sure this server is also accessible over the network if you need remote functionality.
