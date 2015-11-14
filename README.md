# the Determined Dill

How far can you get the Dill out of the pickle jar?  Find out in this jumper style pickle-themed game.

## About

Built for the [2015 Minnesota Pickle Festival](http://mnpicklefestival.com/).

Artwork by Caitlin and Same of [Squawk](http://squawkproductions.com/) and code by [Alan](http://zzolo.org/).  Game play by committee.

Built with [Phaser](http://phaser.io/).  This is the first time I have made a browser game, let alone used Phaser, so decisions and conventions used here may not be best practices.  Lots of ideas and code take from examples and articles around the internets.

This should work in modern browsers, but has only been tested on newer versions of Chrome and Firefox.

## Raspberry Pi setup

Most of the configuration and setup is taken from this [Adafruit article](https://learn.adafruit.com/retro-gaming-with-raspberry-pi/overview).  The same hardware (joystick and buttons) were used.

1. `raspi-config`
    * Update Keyboard for US
    * Enable SSH
    * Change Hostname
    * Enable I2C (GPIO)
    * Currently Chromium on Raspberry Pi does not utilize the GPU for canvas.
        * [Update GPU memory](https://github.com/raspberrypi/documentation/blob/master/configuration/config-txt.md) use depending on your version of Raspberry Pi and amount of memory.
        * `sudo nano /boot/config.txt` and edit/add `gpu_mem`
1. Dependencies
    * `sudo apt-get update`
    * `curl -sLS https://apt.adafruit.com/add | sudo bash`
    * `sudo apt-get install chromium node x11-xserver-utils unclutter`
    * `npm install -g forever`
    * `npm install`
1. Hardware setup (see article)
    * Might be a [Raspberry Pi 2 with 40 pin GPIO](http://www.element14.com/community/docs/DOC-73950/l/raspberry-pi-2-model-b-gpio-40-pin-block-pinout)
    * Setting up [Retrogame.c](https://github.com/adafruit/Adafruit-Retrogame):  Overall, the need is for space, left, right keys to be setup.  Notice that its the second set of config that looks like this.
        * `{ 21, KEY_LEFT }`
        * `{ 20, KEY_RIGHT }`
        * `{ 26, KEY_UP }`
        * `{ 19, KEY_DOWN }`
        * `{ 12, KEY_SPACE }`
        * `{ 6, KEY_LEFTALT }`
        * `make retrogame`
1. Startup.  Updates paths in `raspberry-pi/startup.sh` as needed.
    * `sudo nano /etc/xdg/lxsession/LXDE-pi/autostart`
    * Add `@/bin/bash /home/pi/installed/pickle-jumper/raspbery-pi/startup.sh`
