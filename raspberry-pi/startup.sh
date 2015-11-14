#!/bin/bash

# Start GPIO inputs
sudo /home/pi/installed/Adafruit-Retrogame/retrogame &

# Go to project
cd /home/pi/installed/determined-dill/;

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
sleep 5;

# Some serious hackery to get rid of the "Restore Session" warning
# if things are exited gracefully
# https://groups.google.com/a/chromium.org/forum/#!topic/chromium-reviews/HdvP8PttOLM
sed -i 's/"exited_cleanly": false/"exited_cleanly": true/' \
  ~/.config/chromium/Default/Preferences;

# Start chromium
chromium --kiosk --allow-file-access-from-files --disable-java --disable-restore-session-state --disable-sync --disable-translate --ignore-certificate-errors http://127.0.0.1:8080/;
