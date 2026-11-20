"""Build the short real-video sample meeting.

Inputs: Seamless Interaction clips (CC BY-NC 4.0) for the two on-camera people,
Kokoro TTS clips for the camera-off people. Output: one video per on-camera person
and one audio track per camera-off voice, all exactly as long as the meeting, plus
sample.json with the cast, caption cues and who-is-talking spans.
"""
import json, subprocess, sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from motion import motion_flags, spans as flag_spans
TIMELINE_ONLY = '--timeline-only' in sys.argv
import soundfile as sf

SEAM = sys.argv[1]   # scratchpad/seamless
TTS = sys.argv[2]    # scratchpad/build/tts
OUT = sys.argv[3]    # output folder
os.makedirs(OUT, exist_ok=True)
FPS = 30000 / 1001
SR = 48000
W_OUT, H_OUT = 960, 540
ID = {('093', 'greg'): 'V03_S1564_I00000093_P1546', ('093', 'lauren'): 'V03_S1564_I00000093_P4303',
      ('097', 'greg'): 'V03_S1564_I00000097_P1546', ('097', 'lauren'): 'V03_S1564_I00000097_P4303'}
tts = json.load(open(f'{TTS}/tts.json'))

# ---------- the timeline (meeting seconds) ----------
t = 1.0
lines = []          # (who, key, start)
def say(who, key, gap_after):
    global t
    lines.append((who, key, t)); t += tts[key]['dur'] + gap_after
say('priya', 'H1', 0.5)
say('priya', 'H2', 0.7)
MAIN1 = ('093', 0.25, 70.0, t); t += 70.0 - 0.25 + 0.6
say('daniel', 'D1', 0.7)
say('priya', 'H3', 0.8)
MAIN2 = ('097', 10.8, 165.0, t); t += 165.0 - 10.8 + 0.7
say('priya', 'H4', 0.4)
say('daniel', 'D2', 0.0)
TALK_END = round(t, 2)
LEAVE = {'daniel': TALK_END + 2.5, 'lauren': TALK_END + 5.0, 'greg': TALK_END + 8.0, 'aisha': TALK_END + 10.5}
END = round(TALK_END + 13.0, 2)
m1, m2 = MAIN1[3], MAIN2[3]
m1_end, m2_end = m1 + MAIN1[2] - MAIN1[1], m2 + MAIN2[2] - MAIN2[1]

# Picture for each on-camera person: (clip, src_start, meeting_start, meeting_end, audio_on)
# Between their own conversation they are listening, using stretches where they are silent.
def segs_for(who):
    tail_end = LEAVE[who] + 0.5
    if who == 'greg':
        return [('097', 200.2, 0, m1, False),
                ('093', MAIN1[1], m1, m1_end, True),
                ('093', 91.4, m1_end, m2, False),
                ('097', MAIN2[1], m2, tail_end, 'until')]   # carries straight on, he is quiet after 165 s
    return [('093', 88.9, 0, m1, False),
            ('093', MAIN1[1], m1, m1_end, True),
            ('097', 220.8, m1_end, m2 - 10.8, False),
            ('097', 0.0, m2 - 10.8, m2, False),               # runs straight into her part of the chat
            ('097', MAIN2[1], m2, m2_end, True),
            ('097', 226.0, m2_end, tail_end, False)]

def kp(clip, who):
    return np.load(f'{SEAM}/meta/{ID[(clip, who)]}.keypoints.npy')

def crop_path(clip, who, src0, n):
    """Per-frame crop centre, smoothed so it follows gently like a webcam's auto-framing."""
    k = kp(clip, who)
    f0 = int(round(src0 * FPS))
    idx = np.clip(np.arange(f0, f0 + n), 0, len(k) - 1)
    nose = k[idx, 0, :2]; eyes = (k[idx, 1, :2] + k[idx, 2, :2]) / 2
    sh = np.abs(k[idx, 5, 0] - k[idx, 6, 0])
    ok = (k[idx, 0, 2] > 0.5) & (k[idx, 5, 2] > 0.4) & (k[idx, 6, 2] > 0.4)
    if not ok.any(): raise SystemExit(f'no face in {clip} {who} {src0}')
    for arr in (nose, eyes):
        good = np.where(ok)[0]
        for d in range(2): arr[:, d] = np.interp(np.arange(n), good, arr[good, d])
    width = 2.7 * np.median(sh[ok])
    win = int(FPS * 1.6)
    ker = np.ones(win) / win
    def smooth(x): return np.convolve(np.pad(x, (win // 2, win - 1 - win // 2), mode='edge'), ker, mode='valid')
    cx = smooth(nose[:, 0]); ey = smooth(eyes[:, 1])
    return cx, ey, width

def render_segment(clip, who, src0, dur, out_path):
    n = int(round(dur * FPS))
    cx, ey, cw = crop_path(clip, who, src0, n)
    s = 0.5                                        # decode at half size (1080x1920)
    cw = int(min(cw * s, 1080)) // 2 * 2; ch = int(cw * 9 / 16) // 2 * 2
    src = f'{SEAM}/dl/{ID[(clip, who)]}.mp4'
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', f'{src0:.3f}', '-i', src, '-frames:v', str(n), '-vf', 'scale=1080:1920',
                            '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{cw}x{ch}', '-r', '30000/1001', '-i', '-',
                            '-vf', f'scale={W_OUT}:{H_OUT}:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '27',
                            '-g', '60', '-an', out_path], stdin=subprocess.PIPE)
    fb = 1080 * 1920 * 3; last = None
    for i in range(n):
        buf = dec.stdout.read(fb)
        if len(buf) < fb:
            buf = last                              # source ran short: hold the last frame
        last = buf
        fr = np.frombuffer(buf, np.uint8).reshape(1920, 1080, 3)
        x0 = int(np.clip(cx[i] * s - cw / 2, 0, 1080 - cw)); y0 = int(np.clip(ey[i] * s - 0.42 * ch, 0, 1920 - ch))
        enc.stdin.write(np.ascontiguousarray(fr[y0:y0 + ch, x0:x0 + cw]).tobytes())
    enc.stdin.close(); enc.wait(); dec.stdout.close(); dec.wait()
    return n

def wav(clip, who):
    a, sr = sf.read(f'{SEAM}/dl/{ID[(clip, who)]}.wav', dtype='float32'); assert sr == SR
    return a if a.ndim == 1 else a.mean(1)

def place(track, audio, at):
    i = int(round(at * SR)); j = min(len(track), i + len(audio)); track[i:j] += audio[:j - i]

def call_sound(in_wav, out_m4a):
    """A touch of laptop-call colour, then AAC."""
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', in_wav, '-af', 'highpass=f=110,lowpass=f=7600,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,volume=1.0',
                    '-c:a', 'aac', '-b:a', '64k', '-ac', '1', out_m4a], check=True)

def level(a, target_rms=0.06):
    speech = a[np.abs(a) > 0.01]
    r = np.sqrt(np.mean(speech ** 2)) if len(speech) else 1
    return a * (target_rms / max(r, 1e-6))

total = int(round(END * SR))
work = f'{OUT}/_work'; os.makedirs(work, exist_ok=True)
vad_spans = {}
cam_off = {'lauren': [[0, round(m1, 2)], [round(m2_end, 2), LEAVE['lauren'] + 1]]}   # camera on for her part of the call only
cues = []

def words_from_transcript(clip, who, lo, hi, offset, skip_before=0):
    out = []
    for l in open(f'{SEAM}/meta/{ID[(clip, who)]}.transcript.jsonl'):
        d = json.loads(l)
        ws = [w for w in d['words'] if lo <= w['start'] < hi and w['start'] >= skip_before and 'start' in w]
        if not ws: continue
        text = ' '.join(w['word'] for w in ws)
        out.append({'who': who, 'start': round(ws[0]['start'] - lo + offset, 2), 'end': round(min(ws[-1]['end'], hi) - lo + offset, 2),
                    'text': text, 'words': [round(w['start'] - lo + offset, 2) for w in ws]})
    return out

def vad(clip, who, lo, hi, offset, skip_before=0):
    out = []
    for l in open(f'{SEAM}/meta/{ID[(clip, who)]}.vad.jsonl'):
        d = json.loads(l)
        a, b = max(d['start'], lo, skip_before), min(d['end'], hi)
        if b > a: out.append([round(a - lo + offset, 2), round(b - lo + offset, 2)])
    return out

for who in ('greg', 'lauren'):
    parts = []; track = np.zeros(total, np.float32); spans = []
    for k, (clip, src0, a, b, audio_on) in enumerate(segs_for(who)):
        b = min(b, END); dur = b - a
        if dur <= 0: continue
        p = f'{work}/{who}_{k}.mp4'
        print(who, k, clip, src0, round(a, 2), round(b, 2), flush=True)
        if not TIMELINE_ONLY: render_segment(clip, who, src0, dur, p)
        parts.append(p)
        cam_off.setdefault(who, []).extend(flag_spans(motion_flags(kp(clip, who), src0, int(round(dur * FPS))), a))
        if audio_on:
            hi = src0 + (MAIN1[2] - MAIN1[1] if a == m1 else MAIN2[2] - MAIN2[1])
            skip = 2.6 if (who == 'lauren' and clip == '093') else 0   # her mic only picked up his voice there
            w = wav(clip, who)[int(src0 * SR):int(hi * SR)]
            if skip: w[:int((skip - src0) * SR)] = 0
            place(track, w, a)
            spans += vad(clip, who, src0, hi, a, skip)
            cues += words_from_transcript(clip, who, src0, hi, a, skip)
    if TIMELINE_ONLY: vad_spans[who] = spans; continue
    lst = f'{work}/{who}.txt'
    open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
    sf.write(f'{work}/{who}.wav', level(track), SR)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-i', f'{work}/{who}.wav',
                    '-af', 'highpass=f=90,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=150',
                    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '80k', '-ac', '1', '-shortest',
                    '-movflags', '+faststart', f'{OUT}/{who}.mp4'], check=True)
    vad_spans[who] = spans

for who in ('priya', 'daniel'):
    if TIMELINE_ONLY:
        spans = []
        for w, key, at in lines:
            if w != who: continue
            dur = tts[key]['dur']; spans.append([round(at + 0.1, 2), round(at + dur - 0.15, 2)])
            ws = tts[key]['text'].split(); total_c = sum(len(x) + 1 for x in ws); c = 0; times = []
            for x in ws: times.append(round(at + 0.15 + (dur - 0.4) * c / total_c, 2)); c += len(x) + 1
            cues.append({'who': who, 'start': times[0], 'end': round(at + dur - 0.15, 2), 'text': tts[key]['text'], 'words': times})
        vad_spans[who] = spans; continue
    track = np.zeros(total, np.float32); spans = []
    for w, key, at in lines:
        if w != who: continue
        a, sr = sf.read(f'{TTS}/{key}.wav', dtype='float32')
        if sr != SR: a = np.interp(np.arange(int(len(a) * SR / sr)) * sr / SR, np.arange(len(a)), a).astype(np.float32)
        place(track, level(a), at)
        dur = tts[key]['dur']; spans.append([round(at + 0.1, 2), round(at + dur - 0.15, 2)])
        ws = tts[key]['text'].split(); total_c = sum(len(x) + 1 for x in ws); c = 0; times = []
        for x in ws: times.append(round(at + 0.15 + (dur - 0.4) * c / total_c, 2)); c += len(x) + 1
        cues.append({'who': who, 'start': times[0], 'end': round(at + dur - 0.15, 2), 'text': tts[key]['text'], 'words': times})
    sf.write(f'{work}/{who}.wav', track, SR)
    call_sound(f'{work}/{who}.wav', f'{OUT}/{who}.m4a')
    vad_spans[who] = spans

cues.sort(key=lambda c: c['start'])
def merged(v):
    v = sorted(v); out = []
    for a, b in v:
        if out and a - out[-1][1] < 2.5: out[-1][1] = max(out[-1][1], b)
        else: out.append([a, b])
    return out
cam_off = {k: merged(v) for k, v in cam_off.items()}
print('camOff', cam_off)
json.dump({'end': END, 'talkEnd': TALK_END, 'leave': LEAVE, 'speaking': vad_spans, 'camOff': cam_off, 'cues': cues}, open(f'{OUT}/timeline.json', 'w'))
print('END', END, 'cues', len(cues))
