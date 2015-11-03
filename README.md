# Pickle Jumper

Pickle Jumper, a Doodle Jump copy cat, for the MN Pickle Festival (and beyond).

## Notes

* http://blog.lessmilk.com/how-to-make-flappy-bird-in-html5-1/
* http://gamedevacademy.org/platformer-tutorial-with-phaser-and-tiled/
* http://codepen.io/jackrugile/pen/fqHtn
* https://www.raspberrypi.org/documentation/usage/gpio-plus-and-raspi2/

## Raspberry Pi setup

Most of the configuration and setup is taken from this [Adafruit article](https://learn.adafruit.com/retro-gaming-with-raspberry-pi/overview).  The same hardware (joystick and buttons) were used.

1. `raspi-config`
    * Update Keyboard for US
    * Enable SSH
    * Change Hostname
    * Enable I2C (GPIO)
1. Dependencies
    * `sudo apt-get update`
    * `curl -sLS https://apt.adafruit.com/add | sudo bash`
    * `sudo apt-get install chromium node x11-xserver-utils unclutter`
    * `npm install -g forever`
    * `npm install`
1. Hardware setup (see article)
    * If using new Raspberry Pi with [40 pin GPIO](http://pi4j.com/pins/model-b-plus.html)
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
    * Add `bash /home/pi/installed/pickle-jumper/raspbery-pi/startup.sh`
