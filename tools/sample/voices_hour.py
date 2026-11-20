"""One full-length audio track per camera-off voice (host and colleagues), from plan.json."""
import sys, json, subprocess, os
import numpy as np, soundfile as sf
PD, TTS = sys.argv[1], sys.argv[2]
plan = json.load(open(f'{PD}/plan.json')); SR = 48000
out = f'{PD}/render'; os.makedirs(out, exist_ok=True)
def level(a, target=0.06):
    sp = a[np.abs(a) > 0.01]; return a * (target / max(np.sqrt(np.mean(sp ** 2)), 1e-6)) if len(sp) else a
for who in sorted({l['who'] for l in plan['lines']}):
    track = np.zeros(int(round(plan['end'] * SR)), np.float32)
    for l in plan['lines']:
        if l['who'] != who: continue
        a, sr = sf.read(f'{TTS}/{l["key"]}.wav', dtype='float32')
        if sr != SR: a = np.interp(np.arange(int(len(a) * SR / sr)) * sr / SR, np.arange(len(a)), a).astype(np.float32)
        a = level(a); i = int(round(l['at'] * SR)); j = min(len(track), i + len(a)); track[i:j] += a[:j - i]
    sf.write(f'{out}/{who}.wav', np.clip(track, -1, 1), SR)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{out}/{who}.wav', '-af',
                    'highpass=f=110,lowpass=f=7600,acompressor=threshold=-20dB:ratio=3:attack=5:release=120',
                    '-c:a', 'aac', '-b:a', '48k', '-ac', '1', '-movflags', '+faststart', f'{out}/{who}.m4a'], check=True)
    print(who, os.path.getsize(f'{out}/{who}.m4a') // 1000, 'KB')
