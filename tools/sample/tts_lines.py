import sys, json, soundfile as sf
from kokoro_onnx import Kokoro
d, out = sys.argv[1], sys.argv[2]
k = Kokoro(d + '/kokoro-v1.0.onnx', d + '/voices-v1.0.bin')
LINES = [
 ('H1', 'af_heart', 1.0, "Hi everyone, thanks for jumping on. I'll keep this one short."),
 ('H2', 'af_heart', 1.0, "First, a quick look back at the studio setup. Greg, Lauren said the audio and video side was all new to her. How was it for you?"),
 ('D1', 'am_michael', 1.0, "Same here, honestly. I spent a whole afternoon just on the microphone levels."),
 ('H3', 'af_heart', 1.0, "Ha, I believe it. Okay, one last thing before we go. The shared desks are getting cluttered again. Greg, how do you keep yours under control?"),
 ('H4', 'af_heart', 1.0, "Labeled boxes. I love that, Lauren. Okay, that's time. Thanks for the updates, everyone, and have a great weekend."),
 ('D2', 'am_michael', 1.0, "Thanks, Priya. Bye, everyone."),
]
meta = {}
for key, v, sp, text in LINES:
    a, sr = k.create(text, voice=v, speed=sp, lang='en-us')
    sf.write(f'{out}/{key}.wav', a, sr)
    meta[key] = {'voice': v, 'text': text, 'dur': round(len(a) / sr, 3)}
json.dump(meta, open(f'{out}/tts.json', 'w'), indent=1)
print(json.dumps(meta, indent=1))
