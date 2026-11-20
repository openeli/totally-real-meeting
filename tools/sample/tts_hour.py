"""Speak every host/colleague line of the hour script with Kokoro. Cached by voice+text."""
import sys, json, hashlib, os
import soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hour_script import VOICES, INTRO, ROUNDS, WRAP
models, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
def key(who, text): return hashlib.sha1(f'{VOICES[who]}|{text}'.encode()).hexdigest()[:12]
lines = [l for l in INTRO if l[0] != 'pause'] + [l for r in ROUNDS for l in r['intro'] + r['after']] + WRAP
meta_p = f'{out}/tts.json'
meta = json.load(open(meta_p)) if os.path.exists(meta_p) else {}
k = None
for who, text in lines:
    kk = key(who, text)
    if kk in meta and os.path.exists(f'{out}/{kk}.wav'): continue
    if k is None:
        from kokoro_onnx import Kokoro
        k = Kokoro(models + '/kokoro-v1.0.onnx', models + '/voices-v1.0.bin')
    a, sr = k.create(text, voice=VOICES[who], speed=1.0, lang='en-gb' if VOICES[who].startswith('b') else 'en-us')
    sf.write(f'{out}/{kk}.wav', a, sr)
    meta[kk] = {'who': who, 'text': text, 'dur': round(len(a) / sr, 3)}
    print(who, meta[kk]['dur'], text[:60], flush=True)
json.dump(meta, open(meta_p, 'w'), indent=1)
print(len(lines), 'lines', round(sum(m['dur'] for m in meta.values()), 1), 's')
