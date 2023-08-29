# WebDrop

P2P file transfer in browser similar to Apple's AirDrop.

Simply go to the website [WebDrop.Space](https://WebDrop.Space) on the devices, choose files and share !

No installations whatsoever, just a website !

Made with [P2PT](https://github.com/subins2000/p2pt), WebRTC 🔥. No servers involved, 99% your browser, 1% WebTorrent Trackers.

## Features

* Easy to use
* Auto discover devices in the same network (LAN)
* Resume connection interrupted downloads
* No file download limit
* Download straight to your downloads folder without waiting
* Share through internet with a room code !
* Easily share Text Messages too !

## Why

[THIS!](https://twitter.com/SubinSiby/status/1264340589367029760)

Case 1: I want to share files with my friend's phone or computer, but we don't have a USB cable. I have a file sharing app A, my friend have B. Both of us argue "A is better", "No, B is better". The app installation size is 50MB, is half bloatware and the arguing cost us 15 minutes. If it's an iPhone & an Android, ohnooooo. Bonus: iPhone + Android + Windows PC together 🙂

Case 2: I want to copy a text from my phone to computer, arghh😫 I have to open WhatsApp Web/Telegram now, send a message to myself -_- 😒

Both the above problems are solved with [WebDrop](https://WebDrop.Space). Simply open the website on any number of your devices (even simultaneously) and share files & messages !

### Development

Clone the repo and do :

```
yarn install
yarn serve
```

WebTorrent trackers list is included in `src/main.ts`. You may want to change that or add/start your [own tracker](https://github.com/subins2000/p2pt/blob/master/startTracker.js) locally for development.

File is shared via streams using [simple-peer-files library](https://github.com/subins2000/simple-peer-files).

#### Starting Local Tracker

Install [bittorrent-tracker] globally :

```
yarn global add bittorrent-tracker
```

Download [this script](https://github.com/subins2000/p2pt/blob/master/startTracker.js) and run it. It only requires `bittorrent-tracker`.

## Thanks

* [Radhika Sharma](https://twitter.com/radhikaa2001) for the [logo](https://WebDrop.Space/favicon.png)
* [Buefy](https://buefy.org/)
* [Material Design Icons](https://materialdesignicons.com/)
* [WebTorrent](https://webtorrent.io)
