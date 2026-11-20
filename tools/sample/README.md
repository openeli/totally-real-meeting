# Building the real-video meeting

These scripts made the files in `sample/`. You only need them to change or extend that meeting.

1. Download each clip's `.mp4`, `.wav` and metadata (`transcript`, `vad`, `boxes_and_keypoints/keypoints`) from the
   Seamless Interaction dataset: `https://dl.fbaipublicfiles.com/seamless_interaction/{label}/{split}/...`
   (file ids and splits are listed in `assets/filelist.csv` of github.com/facebookresearch/seamless_interaction).
2. `pip install kokoro-onnx soundfile numpy` and download `kokoro-v1.0.onnx` and `voices-v1.0.bin`
   from the kokoro-onnx GitHub releases, then run `python tts_lines.py MODEL_DIR TTS_OUT` for the camera-off lines.
3. `python build_sample.py SEAMLESS_DIR TTS_OUT OUT_DIR`: crops each person to a webcam-style view that follows
   the face, builds one full-length video per filmed person and one voice track per camera-off person, and writes
   `timeline.json` (who talks when, caption word timings, camera-off moments from `motion.py`, when people leave).
   Add `--timeline-only` to redo just the timings.
4. `python to_js.py OUT_DIR/timeline.json ../../sample/timeline.js`, then copy the media into `sample/`.

Footage: Seamless Interaction by Meta, CC BY-NC 4.0. Voices: Kokoro, Apache 2.0.
