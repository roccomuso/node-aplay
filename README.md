# node-aplay
ALSA aplay wrapper for Node.js

It provides basic audio capabilities.

Node-aplay works on:
  1. any Debian/Ubuntu system providing ALSA support has been installed.
  2. MAC OSX (comes with `afplay` by default)

ALSA stands for Advanced Linux Sound Architecture. It is a suite of hardware drivers, libraries and utilities which provide audio and MIDI functionality for the Linux operating system.

**aplay is a simple native ALSA wav player** (to reproduce .mp3 see *mpg321*).

[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Installation

### Debian/Ubuntu/Raspbian

Get ready.
Before we start the real work, please update the system.

    sudo apt-get update
    sudo apt-get upgrade

If you are running on Raspberry Pi, please update Raspbian

    sudo rpi-update

Install ALSA for audio playback

    sudo apt-get install alsa-base alsa-utils

### USB Audio on Raspberry Pi

If you are planning on using a USB audio on Raspberry Pi you will need to set your USB audio device as the default device.

Edit /etc/modprobe.d/alsa-base.conf and replaced the line:

    options snd-usb-audio index=-2

With the following lines:

    options snd-usb-audio index=0 nrpacks=1
    options snd-bcm2835 index=-2

After a reboot of your Raspberry Pi

    aplay -l

Should output the following:

    **** List of PLAYBACK Hardware Devices ****
    card 0: XXXX [XXXX], device 0: USB Audio [USB Audio]
    Subdevices: 1/1
    Subdevice #0: subdevice #0

Your device volume will be set to 0 by default. Use the ALSA mixer to adjust the volume using your arrow keys:

    alsamixer

### Example Usage

Get it through npm:

    $ npm install aplay --save

and then:

```javascript

var Sound = require('aplay');

// fire and forget:
new Sound().play('/path/to/the/file/filename.wav');

// with ability to pause/resume:
var music = new Sound();
music.play('/path/to/the/file/filename.wav');

setTimeout(function () {
	music.pause(); // pause the music after five seconds
}, 5000);

setTimeout(function () {
  music.resume(); // and resume it two seconds after pausing
}, 7000);

// you can also listen for various callbacks:
music.on('complete', function () {
  console.log('Done with playback!');
});

```

## Options

The constructor accepts a config object where you can provide:

- `channel`: specify a channel.

### CLI Usage

    $ node node_modules/aplay my-song.wav


It's simple as that.
