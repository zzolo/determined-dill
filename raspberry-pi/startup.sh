#!/bin/bash

# Start GPIO inputs
sudo /home/pi/installed/Adafruit-Retrogame/retrogame &

# Get lastest code
cd /home/pi/installed/pickle-jumper/;
git pull origin master;

# Start HTTP server
python -m SimpleHTTPServer 8080;

# Start chromium
chromium --kiosk --ignore-certificate-errors http://127.0.0.1:8080/;
