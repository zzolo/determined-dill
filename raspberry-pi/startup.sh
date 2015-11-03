#!/bin/bash

# Start GPIO inputs
sudo forever /home/pi/installed/Adafruit-Retrogame/retrogame;

# Go to project
cd /home/pi/installed/pickle-jumper/;

# Check if internet is connected
wget -q --tries=10 --timeout=20 --spider http://google.com > /dev/null
if [[ $? -eq 0 ]]; then
  git pull origin master;
  npm install;
else
  echo "Offline";
fi

# Start HTTP server
forever start ./node_modules/http-server/bin/http-server $(pwd) -p 8080;

# Start chromium
chromium --kiosk --ignore-certificate-errors http://127.0.0.1:8080/;
