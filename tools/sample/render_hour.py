"""Render one filmed person's full-length track for the hour meeting from plan.json.

Each run of footage is cropped to a webcam-like framing that follows the face, the background is
blurred (MediaPipe selfie segmenter through LiteRT), and everything outside the runs is black
(the page shows their avatar then). Their own voice plays only during their answers.

usage: render_hour.py SEAM PLAN_DIR SEG_MODEL WHO [--from S --to S]   (--from/--to: a test slice)
"""
import sys, os, json, subprocess, time
import numpy as np, cv2, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hour_script import PEOPLE
from ai_edge_litert.interpreter import Interpreter
FPS = 30000 / 1001; SR = 48000
W, H = 854, 480
SEAM, PD, MODEL, WHO = sys.argv[1:5]
args = sys.argv[5:]
T0 = float(args[args.index('--from') + 1]) if '--from' in args else 0.0
plan = json.load(open(f'{PD}/plan.json'))
T1 = float(args[args.index('--to') + 1]) if '--to' in args else plan['end']
sess, pid = PEOPLE[WHO]
fid = lambda chat: f'V03_{sess}_I00000{chat}_P{pid}'

# join pieces that continue the same chat into one run, so the framing never jumps inside it
runs = []
for a, b, chat, s, audio in plan['pieces'][WHO]:
    if runs and runs[-1]['chat'] == chat and abs(runs[-1]['b'] - a) < 0.05 and abs(runs[-1]['s'] + (runs[-1]['b'] - runs[-1]['a']) - s) < 0.05:
        runs[-1]['b'] = b
    else:
        runs.append({'a': a, 'b': b, 'chat': chat, 's': s})

def crop_path(k, f0, n):
    idx = np.clip(np.arange(f0, f0 + n), 0, len(k) - 1)
    nose = k[idx, 0, :2].astype(np.float64); eyes = ((k[idx, 1, :2] + k[idx, 2, :2]) / 2).astype(np.float64)
    sh = np.abs(k[idx, 5, 0] - k[idx, 6, 0])
    ok = (k[idx, 0, 2] > 0.5) & (k[idx, 5, 2] > 0.4) & (k[idx, 6, 2] > 0.4)
    if not ok.any():
        ok = k[idx, 0, 2] > 0.2
    good = np.where(ok)[0]
    for arr in (nose, eyes):
        for d in range(2): arr[:, d] = np.interp(np.arange(n), good, arr[good, d])
    allok = (k[:, 0, 2] > 0.5) & (k[:, 5, 2] > 0.4) & (k[:, 6, 2] > 0.4)
    width = 2.7 * np.median(np.abs(k[allok, 5, 0] - k[allok, 6, 0]))    # one framing size per chat
    win = int(FPS * 1.6); ker = np.ones(win) / win
    sm = lambda x: np.convolve(np.pad(x, (win // 2, win - 1 - win // 2), mode='edge'), ker, mode='valid')
    return sm(nose[:, 0]), sm(eyes[:, 1]), width

seg = Interpreter(model_path=MODEL, num_threads=1); seg.allocate_tensors()
sin = seg.get_input_details()[0]; sout = seg.get_output_details()[0]
SH, SW = sin['shape'][1:3]
prev_mask = None
def blur_bg(img):
    """img: HxWx3 uint8 RGB. Background softly blurred like a call app's blur."""
    global prev_mask
    x = cv2.resize(img, (SW, SH), interpolation=cv2.INTER_AREA).astype(np.float32)[None] / 255.0
    seg.set_tensor(sin['index'], x); seg.invoke()
    m = seg.get_tensor(sout['index'])[0, :, :, 0]
    m = prev_mask * 0.45 + m * 0.55 if prev_mask is not None else m     # steadier edges from frame to frame
    prev_mask = m
    m = cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)
    m = cv2.GaussianBlur(np.clip((m - 0.3) / 0.4, 0, 1).astype(np.float32), (0, 0), 3)[..., None]
    small = cv2.resize(img, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    bg = cv2.resize(cv2.GaussianBlur(small, (0, 0), 4), (W, H), interpolation=cv2.INTER_LINEAR)
    return (img * m + bg * (1 - m)).astype(np.uint8)

out_dir = f'{PD}/render'; os.makedirs(out_dir, exist_ok=True)
tag = '' if (T0 == 0 and T1 == plan['end']) else f'_{int(T0)}-{int(T1)}'
vid_path = f'{out_dir}/{WHO}{tag}_v.mp4'
n_total = int(round((T1 - T0) * FPS))
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30000/1001', '-i', '-',
                        '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '28', '-g', '120', '-threads', '2',
                        '-an', vid_path], stdin=subprocess.PIPE)
black = np.zeros((H, W, 3), np.uint8).tobytes()
fi = 0; t_start = time.time(); live = 0
def write_black(upto):
    global fi
    while fi < upto: enc.stdin.write(black); fi += 1
for r in runs:
    a, b = max(r['a'], T0), min(r['b'], T1)
    if b <= a: continue
    i0 = int(np.ceil((a - T0) * FPS)); i1 = int(np.floor((b - T0) * FPS))
    write_black(i0)
    n = i1 - i0
    if n <= 0: continue
    src0 = r['s'] + (T0 + i0 / FPS - r['a'])
    k = np.load(f'{SEAM}/meta/{fid(r["chat"])}.keypoints.npy')
    cx, ey, cw = crop_path(k, int(round(src0 * FPS)), n)
    s = 0.5
    cw = int(min(cw * s, 1080)) // 2 * 2; ch = int(cw * 9 / 16) // 2 * 2
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-threads', '3', '-ss', f'{src0:.3f}', '-i', f'{SEAM}/dl/{fid(r["chat"])}.mp4', '-frames:v', str(n),
                            '-vf', 'scale=1080:1920:flags=bilinear', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    fb = 1080 * 1920 * 3; last = None; prev_mask = None
    for j in range(n):
        buf = dec.stdout.read(fb)
        if len(buf) < fb: buf = last
        last = buf
        fr = np.frombuffer(buf, np.uint8).reshape(1920, 1080, 3)
        x0 = int(np.clip(cx[j] * s - cw / 2, 0, 1080 - cw)); y0 = int(np.clip(ey[j] * s - 0.42 * ch, 0, 1920 - ch))
        img = cv2.resize(fr[y0:y0 + ch, x0:x0 + cw], (W, H), interpolation=cv2.INTER_AREA)
        enc.stdin.write(blur_bg(img).tobytes()); fi += 1
    dec.stdout.close(); dec.wait(); live += n
    el = time.time() - t_start
    print(f'{WHO} run {r["chat"]} {a:.1f}-{b:.1f} done; {live} live frames, {live / max(el, 1e-3):.1f} fps', flush=True)
write_black(n_total)
enc.stdin.close(); enc.wait()

# their voice: only during their own answers
track = np.zeros(int(round((T1 - T0) * SR)) + SR, np.float32)
for r in plan['rounds']:
    if WHO not in r['people']: continue
    s, e = r['src']; skip = r.get('skip', {}).get(WHO, 0)
    a = r['at'] - T0
    if a + (e - s) < 0 or a > T1 - T0: continue
    w, sr = sf.read(f'{SEAM}/dl/{fid(r["chat"])}.wav', dtype='float32'); assert sr == SR
    if w.ndim > 1: w = w.mean(1)
    w = w[int(s * SR):int(e * SR)].copy()
    if skip > s: w[:int((skip - s) * SR)] = 0
    fade = int(0.05 * SR); w[:fade] *= np.linspace(0, 1, fade); w[-fade:] *= np.linspace(1, 0, fade)
    i = int(round(a * SR)); lo = max(0, -i); j = min(len(track), i + len(w))
    if j > max(i, 0): track[max(i, 0):j] += w[lo:lo + j - max(i, 0)]
speech = track[np.abs(track) > 0.01]
if len(speech): track *= 0.06 / max(np.sqrt(np.mean(speech ** 2)), 1e-6)
track = np.clip(track[:int(round((T1 - T0) * SR))], -1, 1)
sf.write(f'{out_dir}/{WHO}{tag}.wav', track, SR)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', vid_path, '-i', f'{out_dir}/{WHO}{tag}.wav',
                '-af', 'highpass=f=90,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=150',
                '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '56k', '-ac', '1',
                '-movflags', '+faststart', f'{out_dir}/{WHO}{tag}.mp4'], check=True)
print(WHO, 'DONE', os.path.getsize(f'{out_dir}/{WHO}{tag}.mp4') // 1000000, 'MB', round(time.time() - t_start), 's')
