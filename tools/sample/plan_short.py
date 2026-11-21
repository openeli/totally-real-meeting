"""Lay out the 15-minute video-first meeting from short_script.py.

Writes plan.json (what each filmed person's picture shows at every moment) and timeline.json for the page
(joins, leaves, who is talking, cameras off, caption cues, and the chat messages with their times).

Cameras: on for as much of the meeting as the footage allows. Around each answer the picture runs on from the
same chat (silent and still before and after). Between answers each person is shown listening, using silent,
still footage from their other chats, each piece once. When that runs out, their camera goes off. A walk or turn
out of frame switches it off for a moment (motion.py).
usage: plan_short.py SEAM OUT_DIR
"""
import sys, os, json, random
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hour_script import PEOPLE, PAIR
from short_script import CLOCK, JOIN, OPEN, ROUNDS, CLOSE, LEAVE_ORDER, CAM_OFF
from resolve import chat_lines, resolve
from motion import motion_flags, spans as flag_spans, FPS
from supply import supply

SEAM, OUT = sys.argv[1:3]
os.makedirs(OUT, exist_ok=True)
rnd = random.Random(11)
fid = lambda who, chat: f'V03_{PEOPLE[who][0]}_I00000{chat}_P{PEOPLE[who][1]}'
_kp = {}
def kp(who, chat):
    k = fid(who, chat)
    if k not in _kp: _kp[k] = np.load(f'{SEAM}/meta/{k}.keypoints.npy')
    return _kp[k]
def own_talk(who, chat):
    f = fid(who, chat)
    v = [json.loads(l) for l in open(f'{SEAM}/meta/{f}.vad.jsonl')]
    t = chat_lines(f'{SEAM}/tr', PEOPLE[who][0], chat, [PEOPLE[who][1]])
    return sorted([(x['start'], x['end']) for x in v] + [(x['start'], x['end']) for x in t])
def still(who, chat, a, b):
    n = int((b - a) * FPS)
    return n <= 0 or not motion_flags(kp(who, chat), a, n).any()

# ---------- the timeline ----------
chat = []; rounds = []; t = 0.0
def post(items):
    global t
    for who, text in items:
        if who == 'pause': t += text; continue
        chat.append({'at': round(t, 2), 'who': who, 'text': text}); t += 1.0
post(OPEN)
for i, r in enumerate(ROUNDS):
    a, b = PAIR[r['sess']]
    L = chat_lines(f'{SEAM}/tr', r['sess'], r['chat'], [PEOPLE[a][1], PEOPLE[b][1]])
    s, e = resolve(r, L)
    asked = round(t, 2)
    if r['ask']: post(r['ask']); t += 5.0                    # time to read the question
    rounds.append({'i': i, 'sess': r['sess'], 'chat': r['chat'], 'src': [s, e], 'at': round(t, 2), 'asked': asked, 'people': [a, b]})
    t += e - s
    t += 1.5; post(r['after']); t += 3.0
post(CLOSE)
TALK_END = round(t, 2)
LEAVE = {}; lt = TALK_END + 2.0
for w in LEAVE_ORDER: LEAVE[w] = round(lt, 2); lt += rnd.uniform(1.6, 3.0)
END = round(lt + 2.5, 2)
print('talk end', round(TALK_END / 60, 2), 'min; end', END)

# ---------- each filmed person's picture ----------
pieces = {w: [] for w in PEOPLE}     # [meeting_a, meeting_b, chat, src_a, audio]
for r in rounds:
    s, e = r['src']; dur = e - s
    for w in r['people']:
        talk = own_talk(w, r['chat'])
        last = max([b for a, b in talk if b < s + 0.2] + [0])
        pre = max(0.0, min(20.0, s - 0.1, s - last - 0.5, r['at'] - JOIN.get(w, 0)))
        while pre > 2 and not still(w, r['chat'], s - pre, s): pre -= 1.0
        if pre < 2: pre = 0.0
        nxt_talk = min([a for a, b in talk if a > e - 0.2] + [1e9])
        post_ = max(0.0, min(30.0, nxt_talk - e - 0.6, len(kp(w, r['chat'])) / FPS - e - 0.5))
        while post_ > 2 and not still(w, r['chat'], e, e + post_): post_ -= 1.0
        if post_ < 2: post_ = 0.0
        if pre: pieces[w].append([r['at'] - pre, r['at'], r['chat'], s - pre, False])
        pieces[w].append([r['at'], r['at'] + dur, r['chat'], s, True])
        if post_: pieces[w].append([r['at'] + dur, r['at'] + dur + post_, r['chat'], e, False])

quiet = supply(SEAM, 6, ROUNDS)
for w in PEOPLE:
    pool = [q for q in quiet[w] if q['b'] - q['a'] >= 6]
    pool.sort(key=lambda q: (q['inside'], -(q['b'] - q['a'])))   # long pieces nobody sees elsewhere first
    ps = sorted(pieces[w])
    lo = JOIN[w] + rnd.uniform(1, 4) if w in JOIN else 0.0; hi = LEAVE[w]
    gaps = []; cur = lo
    for a, b, *_ in ps:
        if a - cur > 1: gaps.append([cur, a])
        cur = max(cur, b)
    if hi - cur > 1: gaps.append([cur, hi])
    for g0, g1 in gaps:
        cur = g0
        while g1 - cur > 3 and pool:
            # a short break with the camera off now and then, the way people do
            if cur > g0 and rnd.random() < 0.12: cur += rnd.uniform(6, 14); continue
            q = pool.pop(0)
            take = min(q['b'] - q['a'] - 0.4, g1 - cur, rnd.uniform(18, 45))
            if take < 4: continue
            if take < q['b'] - q['a'] - 10:          # put the unused rest back for later
                pool.append({**q, 'a': q['a'] + take + 0.4}); pool.sort(key=lambda x: (x['inside'], -(x['b'] - x['a'])))
            pieces[w].append([cur, cur + take, q['chat'], q['a'] + 0.2, False]); cur += take
    pieces[w] = [[round(a, 3), round(b, 3), c, round(s, 3), au] for a, b, c, s, au in sorted(pieces[w])]
    print(w, 'unused quiet footage', round(sum(q['b'] - q['a'] for q in pool) / 60, 1), 'min')

# ---------- timeline for the page ----------
cues = []; speaking = {}; cam_on = {}
for w, ps in pieces.items():
    on = []
    for a, b, c, s, audio in ps:
        mot = [m for m in flag_spans(motion_flags(kp(w, c), s, int(round((b - a) * FPS))), a) if m[1] - m[0] >= 3.5]
        cur = a
        for ma, mb in mot:
            if ma > cur: on.append([cur, ma])
            cur = max(cur, mb)
        if b > cur: on.append([cur, b])
    for xa, xb in CAM_OFF.get(w, []):   # spans marked off by hand in short_script.py
        on = [x for a, b in on for x in ([a, min(b, xa)], [max(a, xb), b]) if x[1] - x[0] > 0.05]
    cam_on[w] = on
def complement(on, lo, hi):
    out = []; cur = lo
    for a, b in sorted(on):
        if a - cur > 0.05: out.append([round(cur, 2), round(a, 2)])
        cur = max(cur, b)
    if hi - cur > 0.05: out.append([round(cur, 2), round(hi, 2)])
    return [x for x in out if x[1] - x[0] >= 1.2 or x[0] <= lo + 0.01]
cam_off = {w: complement(cam_on[w], JOIN.get(w, 0), LEAVE[w] + 1) for w in PEOPLE}
for r in rounds:
    s, e = r['src']; off = r['at'] - s
    for w in r['people']:
        r.setdefault('skip', {})[w] = 0
        for l in open(f'{SEAM}/meta/{fid(w, r["chat"])}.vad.jsonl'):
            d = json.loads(l); a, b = max(d['start'], s), min(d['end'], e)
            if b > a: speaking.setdefault(w, []).append([round(a + off, 2), round(b + off, 2)])
        for l in chat_lines(f'{SEAM}/tr', r['sess'], r['chat'], [PEOPLE[w][1]]):
            ws = [x for x in l['words'] if s <= x['start'] < e]
            if ws: cues.append({'who': w, 'start': round(ws[0]['start'] + off, 2), 'end': round(min(ws[-1]['end'], e) + off, 2),
                                'text': ' '.join(x['word'] for x in ws), 'words': [round(x['start'] + off, 2) for x in ws]})
cues.sort(key=lambda c: c['start'])
for w in speaking: speaking[w].sort()
timeline = {'clock': CLOCK, 'end': END, 'talkEnd': TALK_END, 'join': JOIN, 'leave': LEAVE, 'speaking': speaking, 'camOff': cam_off, 'cues': cues, 'chat': chat}
json.dump(timeline, open(f'{OUT}/timeline.json', 'w'))
json.dump({'end': END, 'lines': [], 'rounds': rounds, 'pieces': pieces, 'join': JOIN, 'leave': LEAVE}, open(f'{OUT}/plan.json', 'w'), indent=1)
for w in PEOPLE:
    on = sum(b - a for a, b in cam_on[w])
    print(f'{w:7s} camera on {on / 60:5.1f} of {(LEAVE[w] - JOIN.get(w, 0)) / 60:.1f} min; {len(pieces[w])} pieces; {len(cam_off[w])} off spans')
print('cues', len(cues), 'chat', len(chat))
