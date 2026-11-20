# Building the real-video meeting

These scripts made the files in `sample/`, the hour-long "Team connect hour". You only need them to change or extend it.

- `hour_script.py`: who says what, in order. The host's questions, each pair's stretch of a filmed chat
  (by second or by the words it starts and ends on), the camera-off colleagues' reactions, joins and the order people leave.
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
   their camera is off. Add `--from S --to S` to render a short test slice.
7. `python voices_hour.py WORK WORK/tts` builds the camera-off voice tracks.
8. `python to_js.py WORK/timeline.json ../../sample/timeline.js`, then copy `WORK/render/*.mp4` and `*.m4a` into `sample/`.

Footage: Seamless Interaction by Meta, CC BY-NC 4.0. Voices: Kokoro, Apache 2.0. Background blur: MediaPipe selfie segmenter, Apache 2.0.
