# Building the real-video meeting

These scripts made the prepared meetings: the hour-long "Team connect hour" in `sample/`, the 15-minute,
video-first "Team connect" in `sample/short/` and the comedy "Mandatory Fun: Quarterly Vibe Check" in `sample/humor/`.
You only need them to change or extend those meetings.

- `hour_script.py`: who says what, in order. The host's questions, each pair's stretch of a filmed chat
  (by second or by the words it starts and ends on), the camera-off colleagues' reactions, joins and the order people leave.
- `short_script.py`: the 15-minute version. You join at 15:00 partway through an answer; the host's questions and the
  colleagues' reactions are chat messages, so there are no computer voices.
- `humor_script.py`: the comedy. Five characters speak original lines with computer voices, four filmed coworkers sit in
  as silent listeners, and the visitor's own names (roles `p1` to `p4`) type in the chat.
- `resolve.py`: finds those start and end words in the chat transcripts.
- `motion.py`: flags moments where someone walks, leans far or turns away, so their camera goes off there.

Steps (SEAM is a folder with `dl/` for `.mp4`/`.wav`, `meta/` for keypoints, VAD and transcripts, `tr/` for transcripts
and VAD of every chat of the three pairs, and `dl/todo.txt` listing the file ids that were downloaded):

1. Download each clip's `.mp4`, `.wav` and metadata (`metadata/transcript`, `metadata/vad`, `boxes_and_keypoints/keypoints`)
   from the Seamless Interaction dataset: `https://dl.fbaipublicfiles.com/seamless_interaction/naturalistic/{split}/...`
   (file ids and splits are in `assets/filelist.csv` of github.com/facebookresearch/seamless_interaction).
2. `pip install kokoro-onnx soundfile numpy opencv-python-headless ai-edge-litert`, download `kokoro-v1.0.onnx` and
   `voices-v1.0.bin` from the kokoro-onnx GitHub releases and MediaPipe's `selfie_segmenter.tflite`.
3. `python tts_hour.py MODEL_DIR WORK/tts` speaks every host and colleague line.
4. `python supply.py SEAM 8 WORK/quiet.json` finds silent, still footage of each person, used while they listen to others.
5. `python plan_hour.py SEAM WORK/tts WORK` lays out the hour and writes `plan.json` and `timeline.json`.
6. `python render_hour.py SEAM WORK selfie_segmenter.tflite NAME` for each filmed person (they can run side by side).
   Each one is cropped to a webcam-style view that follows the face, with the background blurred; it is black wherever
   their camera is off. Add `--from S --to S` to render a short test slice, and `--blur SIGMA` for a softer background
   (default 4; the comedy uses 9, which also hides more of the camera movement).
7. `python voices_hour.py WORK WORK/tts` builds the camera-off voice tracks.
8. `python to_js.py WORK/timeline.json ../../sample/timeline.js hour`, then copy `WORK/render/*.mp4` and `*.m4a` into `sample/`.

The 15-minute version skips the voices: `python plan_short.py SEAM SHORT` (it finds the listening footage itself), then
step 6 with `SHORT` in place of `WORK`, then `python to_js.py SHORT/timeline.json ../../sample/short/timeline.js short`
and copy `SHORT/render/*.mp4` into `sample/short/`.

The comedy: `python tts_humor.py MODEL_DIR HUMOR/tts`, then `python plan_humor.py SEAM HUMOR/tts HUMOR`, then
`python voices_hour.py HUMOR HUMOR/tts`, step 6 with `HUMOR` and `--blur 9` for lauren, mike, megan and greg, then
`python to_js.py HUMOR/timeline.json ../../sample/humor/timeline.js humor` and copy `HUMOR/render/*.mp4` and `*.m4a`
into `sample/humor/`. The captions-only mode uses the same timeline and plays no files.

## Calm cameras (after any render)

The first renders stitched listening footage from many short pieces and turned cameras off for a few seconds at a time, so
tiles flickered and the picture sometimes jumped. These scripts fix a finished meeting without the source footage:

1. `python cuts.py VIDEO.mp4 OUT.json` finds every visible jump in a tile video (run it for each person; name the outputs
   `WORK/cuts-src-NAME.json`).
2. `python restitch.py TIMELINE.js VIDEO_DIR WORK` plans each tile again: every frame where the person talks stays exactly
   where it was, the rest is filled from their own quiet footage, joined only where two frames look the same, or played
   back and forth over still footage. A jump nobody can avoid becomes a short freeze, like a network hiccup, at most once
   every two minutes per person. It writes the new `camOff` into TIMELINE.js and a plan per person into WORK.
3. `python render_plan.py VIDEO.mp4 WORK/plan-NAME.npy OUT.mp4` builds the new tile video with the original sound.
4. `python calm_cameras.py TIMELINE.js CUTS_DIR KEY --check` checks the camera rule: once off, a camera stays off for at
   least 45 seconds and once on for at least a minute, two camera changes anywhere in the meeting are at least 20 seconds
   apart, and nobody's footage jumps while their camera is on.

Footage: Seamless Interaction by Meta, CC BY-NC 4.0. Voices: Kokoro, Apache 2.0. Background blur: MediaPipe selfie segmenter, Apache 2.0.
