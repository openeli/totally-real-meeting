# Totally Real Meeting (prototype)

A static parody meeting site. No build step and no server.

## Files
- `index.html`: the landing page with every setting (your name, camera, app look, topic, participants, chat, light/dark theme), the "Have an idea?" popup, and the short disclaimer.
- `meeting.html`: the meeting room. It reads the settings and draws the Teamş, Zooм, Webbex or Meeţ look.
- `disclaimer.html`: the full disclaimer.
- `shared.js`: settings, parody logos, names, topics and chat lines (edit these lists to add content).
- `site.css`: styles for the landing and disclaimer pages.

## Try it
Open `index.html` in a browser. To see chat messages within seconds instead of minutes, add `&fast=1` to the end of the meeting page address.

## Publish
Drag the `site` folder onto Netlify (app.netlify.com/drop). The feedback form already has the Netlify Forms attributes, so messages show up in the Netlify dashboard. The camera needs HTTPS, which Netlify provides.

## Not built yet
- Topic audio (our own clips). The mute buttons already have a hook for it in `meeting.html` (`toggleMute`).
- Captions.
