"""Lay out the comedy meeting from humor_script.py.

Writes plan.json (voice lines for voices_hour.py, listener footage for render_hour.py) and timeline.json for the page.
The four filmed listeners never speak: they are shown listening, using silent, still footage from their chats,
each piece once, with their camera off for a short break now and then or when the footage runs out.
usage: plan_humor.py SEAM TTS_DIR OUT_DIR
"""
import sys, os, json, random, hashlib
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from humor_script import VOICES, SCRIPT, LISTENERS, JOIN
from hour_script import PEOPLE
from motion import motion_flags, spans as flag_spans, FPS
from supply import supply

SEAM, TTS, OUT = sys.argv[1:4]
os.makedirs(OUT, exist_ok=True)
tts = json.load(open(f'{TTS}/tts.json'))
tkey = lambda who, text: hashlib.sha1(f'{VOICES[who]}|{text}'.encode()).hexdigest()[:12]
rnd = random.Random(23)

# ---------- the spoken timeline ----------
lines, chat = [], []
t = 1.5
for row in SCRIPT:
    if row[0] == 'pause': t += row[1]; continue
    if row[0] == 'chat': chat.append({'at': round(t, 2), 'who': row[1], 'text': row[2]}); t += 0.4; continue
    quick = row[0] == 'quick'
    who, text = row[-2], row[-1]
    if lines: t += 0.12 if quick else rnd.uniform(0.4, 0.85)
    k = tkey(who, text); d = tts[k]['dur']
    lines.append({'who': who, 'key': k, 'at': round(t, 2), 'dur': d, 'text': text}); t += d
END = round(t + 0.35, 2)     # Doug presses "end meeting for all" mid-sentence
TALK_END = END
join = dict(JOIN)
join['nate'] = round(min(l['at'] for l in lines if l['who'] == 'nate') - 3.5, 2)
last = {w: max(l['at'] + l['dur'] for l in lines if l['who'] == w) for w in ('nate', 'tess')}
leave = {'nate': round(last['nate'] + 1.2, 2), 'tess': round(last['tess'] + 1.0, 2)}
print('meeting length', round(END / 60, 2), 'min;', len(lines), 'lines;', len(chat), 'chat messages')

# ---------- the silent listeners ----------
_kp = {}
def kp(who, c):
    f = f'V03_{PEOPLE[who][0]}_I00000{c}_P{PEOPLE[who][1]}'
    if f not in _kp: _kp[f] = np.load(f'{SEAM}/meta/{f}.keypoints.npy')
    return _kp[f]
quiet = supply(SEAM, 6, [])
pieces = {}
for w in LISTENERS:
    pool = sorted((q for q in quiet[w] if q['b'] - q['a'] >= 6), key=lambda q: -(q['b'] - q['a']))
    cur = join.get(w, 0) + rnd.uniform(0, 3); ps = []
    while END - cur > 3 and pool:
        if ps and rnd.random() < 0.1: cur += rnd.uniform(8, 20); continue      # camera off for a moment
        q = pool.pop(0)
        take = min(q['b'] - q['a'] - 0.4, END - cur, rnd.uniform(20, 50))
        if take < 4: continue
        if take < q['b'] - q['a'] - 10:
            pool.append({**q, 'a': q['a'] + take + 0.4}); pool.sort(key=lambda x: -(x['b'] - x['a']))
        ps.append([round(cur, 3), round(cur + take, 3), q['chat'], round(q['a'] + 0.2, 3), False]); cur += take
    pieces[w] = ps
    print(w, 'on camera', round(sum(b - a for a, b, *_ in ps) / 60, 1), 'of', round(END / 60, 1), 'min;', len(ps), 'pieces')

def complement(on, lo, hi):
    out = []; c = lo
    for a, b in sorted(on):
        if a - c > 0.05: out.append([round(c, 2), round(a, 2)])
        c = max(c, b)
    if hi - c > 0.05: out.append([round(c, 2), round(hi, 2)])
    return [x for x in out if x[1] - x[0] >= 1.2 or x[0] <= lo + 0.01]
cam_off = {}
for w, ps in pieces.items():
    on = []
    for a, b, c, s, _ in ps:
        mot = [m for m in flag_spans(motion_flags(kp(w, c), s, int(round((b - a) * FPS))), a) if m[1] - m[0] >= 3.5]
        cc = a
        for ma, mb in mot:
            if ma > cc: on.append([cc, ma])
            cc = max(cc, mb)
        if b > cc: on.append([cc, b])
    cam_off[w] = complement(on, join.get(w, 0), END + 1)

# ---------- talking and captions ----------
speaking, cues = {}, []
for l in lines:
    at, dur = l['at'], l['dur']
    speaking.setdefault(l['who'], []).append([round(at + 0.1, 2), round(at + dur - 0.15, 2)])
    ws = l['text'].split(); tot = sum(len(x) + 1 for x in ws); c = 0; times = []
    for x in ws: times.append(round(at + 0.15 + (dur - 0.4) * c / tot, 2)); c += len(x) + 1
    cues.append({'who': l['who'], 'start': times[0], 'end': round(at + dur - 0.15, 2), 'text': l['text'], 'words': times})
timeline = {'end': END, 'talkEnd': TALK_END, 'join': join, 'leave': leave, 'speaking': speaking, 'camOff': cam_off, 'cues': cues, 'chat': chat}
json.dump(timeline, open(f'{OUT}/timeline.json', 'w'))
json.dump({'end': END, 'lines': lines, 'rounds': [], 'pieces': pieces, 'join': join, 'leave': leave}, open(f'{OUT}/plan.json', 'w'), indent=1)
