# Totally Real Meeting (prototype)

A static parody meeting site. No build step and no server.

## Files
- `index.html`: the landing page with every setting (your name, camera, app look, topic, participants, chat, light/dark theme), the "Have an idea?" popup, and the short disclaimer.
- `meeting.html`: the meeting room. It reads the settings and draws the Teamş, Zooм, Webbex or Meeţ look, or the visitor's own custom app.
- `disclaimer.html`: the full disclaimer.
- `shared.js`: settings, parody logos, names, topics and chat lines (edit these lists to add content).
- `site.css`: styles for the landing and disclaimer pages.

## Custom options
- **Custom topic:** pick "Custom (make your own)" in the topic list, then type a meeting title and the lines people say in chat.
- **Custom app look:** pick the fifth card, then set the app name, logo letter, brand colour, logo shape and layout (controls on top, bottom bar, or floating pill).

## In the call
- **Menus:** People (mute anyone, Mute all), Raise hand, Reactions, View (gallery or speaker), More, Record (just a red pill, nothing is saved), Captions, Meeting info.
- **Share:** shares the site link (or copies it).
- **Settings:** opens inside the call, drawn like each app: a side pane in Teamş, a light dialog in Zooм, a dialog in Webbex and a white dialog with pill tabs in Meeţ.
- **Leaving:** each app has its own leave and end steps (Teamş: Leave with an End meeting option and a confirm; Zooм and Webbex: a popover with End for all and Leave; Meeţ: a leave or end choice). Then an after-call screen with Rejoin, a quality rating, and in Meeţ a 60 second countdown home.
- **Chat replies:** people answer what you type. "Hello" gets a welcome, "can you hear me?" checks your mic, "can you see me?" checks your camera. Edit or add rules in `CHAT_REPLIES` in `shared.js`.

## Try it
Open `index.html` in a browser. To see chat messages within seconds instead of minutes, add `&fast=1` to the end of the meeting page address.

## Publish (GitHub Pages)
Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`. The site appears at https://openeli.github.io/totally-real-meeting/ a minute or two later and updates on every merge to `main`. Free GitHub accounts need the repository to be public for Pages.

## Feedback messages
GitHub Pages can't receive form posts. Create a free form at formspree.io, then paste its URL into `FEEDBACK_ENDPOINT` in `shared.js`.

## Not built yet
- Topic audio (our own clips). The mute buttons already have a hook for it in `meeting.html` (`toggleMute`).
- Captions.
