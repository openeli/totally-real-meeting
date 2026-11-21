"""Speak every line of the comedy meeting with Kokoro. Cached by voice and text. usage: tts_humor.py MODEL_DIR OUT_DIR"""
import sys, json, hashlib, os
import soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from humor_script import VOICES, SCRIPT
models, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
def key(who, text): return hashlib.sha1(f'{VOICES[who]}|{text}'.encode()).hexdigest()[:12]
lines = [(r[-2], r[-1]) for r in SCRIPT if r[0] not in ('pause', 'chat')]
meta_p = f'{out}/tts.json'
meta = json.load(open(meta_p)) if os.path.exists(meta_p) else {}
k = None
for who, text in lines:
    kk = key(who, text)
    if kk in meta and os.path.exists(f'{out}/{kk}.wav'): continue
    if k is None:
        from kokoro_onnx import Kokoro
        k = Kokoro(models + '/kokoro-v1.0.onnx', models + '/voices-v1.0.bin')
    v = VOICES[who]
    a, sr = k.create(text, voice=v, speed=1.05 if who in ('nate', 'brenda') else 1.0, lang='en-gb' if v.startswith('b') else 'en-us')
    sf.write(f'{out}/{kk}.wav', a, sr)
    meta[kk] = {'who': who, 'text': text, 'dur': round(len(a) / sr, 3)}
json.dump(meta, open(meta_p, 'w'), indent=1)
tot = sum(meta[key(w, t)]['dur'] for w, t in lines)
print(len(lines), 'lines', round(tot / 60, 2), 'min of speech;', sum(len(t.split()) for w, t in lines), 'words')
