"""Lay out the one-hour meeting from hour_script.py.

Writes plan.json: what each filmed person's picture shows at every moment (source chat and second),
where every voice line and chat stretch lands, and the timeline the page reads
(joins, leaves, who is talking, cameras off, caption cues with word times).

Camera policy. A filmed person's camera is on while their pair answers a question. It comes on when
the host calls on them (showing the same chat just before the answer, while they are silent and still),
and stays on afterwards while the same chat keeps them silent and still. Now and then they also turn it on
for a short stretch while listening to others, using silent, still footage from their other chats, each
piece used once. Any moment where they walk off or turn away switches the camera off (motion.py).
"""
import sys, os, json, random
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hour_script import VOICES, PEOPLE, PAIR, JOIN, INTRO, ROUNDS, WRAP, LEAVE_ORDER
from resolve import chat_lines, resolve
from motion import motion_flags, spans as flag_spans, FPS

SEAM, TTS, OUT = sys.argv[1:4]
tts = json.load(open(f'{TTS}/tts.json'))
import hashlib
def tkey(who, text): return hashlib.sha1(f'{VOICES[who]}|{text}'.encode()).hexdigest()[:12]   # same key as tts_hour.py
rnd = random.Random(7)
fid = lambda who, chat: f'V03_{PEOPLE[who][0]}_I00000{chat}_P{PEOPLE[who][1]}'
_kp = {}
def kp(who, chat):
    k = fid(who, chat)
    if k not in _kp: _kp[k] = np.load(f'{SEAM}/meta/{k}.keypoints.npy')
    return _kp[k]
def own_talk(who, chat):
    """Seconds where this person speaks in this chat (VAD plus transcript)."""
    f = fid(who, chat)
    v = [json.loads(l) for l in open(f'{SEAM}/meta/{f}.vad.jsonl')]
    t = chat_lines(f'{SEAM}/tr', PEOPLE[who][0], chat, [PEOPLE[who][1]])
    return sorted([(x['start'], x['end']) for x in v] + [(x['start'], x['end']) for x in t])
def still(who, chat, a, b):
    """True when the person does not move out of frame anywhere in [a, b]."""
    k = kp(who, chat); n = int((b - a) * FPS)
    return n <= 0 or not motion_flags(k, a, n).any()

# ---------- the spoken timeline ----------
lines = []   # {who, key, at, dur}
rounds = []  # placed rounds
t = 2.0
GAP_LINE, GAP_IN, GAP_OUT, GAP_ROUND = 0.7, 0.9, 0.8, 1.6
def say(who, text, gap):
    global t
    k = tkey(who, text); d = tts[k]['dur']
    lines.append({'who': who, 'key': k, 'at': round(t, 2), 'dur': d, 'text': text}); t += d + gap
for it in INTRO:
    if it[0] == 'pause': t += it[1]
    else: say(it[0], it[1], GAP_LINE)
t += 0.8
for i, r in enumerate(ROUNDS):
    a, b = PAIR[r['sess']]
    L = chat_lines(f'{SEAM}/tr', r['sess'], r['chat'], [PEOPLE[a][1], PEOPLE[b][1]])
    s, e = resolve(r, L)
    asked = round(t, 2)
    for j, (w, x) in enumerate(r['intro']): say(w, x, GAP_IN if j == len(r['intro']) - 1 else GAP_LINE)
    rounds.append({'i': i, 'sess': r['sess'], 'chat': r['chat'], 'src': [s, e], 'at': round(t, 2), 'asked': asked, 'people': [a, b]})
    t += e - s + GAP_OUT
    for w, x in r['after']: say(w, x, GAP_LINE)
    t += GAP_ROUND - GAP_LINE
t += 0.4
for w, x in WRAP: say(w, x, GAP_LINE)
TALK_END = round(t, 2)
LEAVE = {}; lt = TALK_END + 1.2
for w in LEAVE_ORDER: LEAVE[w] = round(lt, 2); lt += rnd.uniform(1.6, 3.0)
END = round(lt + 2.5, 2)
join = dict(JOIN)
for w in ('daniel', 'hannah'):
    first = min(l['at'] for l in lines if l['who'] == w); join.setdefault(w, round(max(0.0, first - rnd.uniform(3, 6)), 2))
print('talk end', round(TALK_END / 60, 2), 'min; end', END)

# ---------- each filmed person's picture ----------
# piece: [meeting_a, meeting_b, chat, src_a, audio]  audio=True means their own voice plays
pieces = {w: [] for w in PEOPLE}
for r in rounds:
    s, e = r['src']; dur = e - s; nxt = next((x for x in rounds if x['i'] > r['i']), None)
    for w in r['people']:
        talk = own_talk(w, r['chat'])
        # before: back to the moment they were called on, while silent and still
        lead = r['at'] - max(r['asked'] - rnd.uniform(0, 6), join.get(w, 0) + 3)
        last = max([b for a, b in talk if b < s + 0.2] + [0])
        pre = max(0.0, min(lead, s - 0.1, s - last - 0.5))
        while pre > 2 and not still(w, r['chat'], s - pre, s): pre -= 1.0
        if pre < 2: pre = 0.0
        # after: the same chat, while they stay silent and still, at most 75 s, not past the next round
        nxt_on = (nxt['asked'] - 1) if nxt and w in nxt['people'] else 1e9
        room = min(75.0, nxt_on - (r['at'] + dur), len(kp(w, r['chat'])) / FPS - e - 0.5)
        if rnd.random() < 0.25: room = min(room, rnd.uniform(4, 15))    # some switch off soon after talking
        nxt_talk = min([a for a, b in talk if a > e - 0.2] + [1e9])
        post = max(0.0, min(room, nxt_talk - e - 0.6))
        step = post
        while post > 2 and not still(w, r['chat'], e, e + post): post -= 1.0
        if post < 2: post = 0.0
        if pre: pieces[w].append([r['at'] - pre, r['at'], r['chat'], s - pre, False])
        pieces[w].append([r['at'], r['at'] + dur, r['chat'], s, True])
        if post: pieces[w].append([r['at'] + dur, r['at'] + dur + post, r['chat'], e, False])
for w in pieces: pieces[w].sort()

# short listening stints from the pool of silent, still footage
quiet = json.load(open(f'{OUT}/quiet.json'))   # from supply.py
used_src = {(r['chat'], w): r['src'] for r in rounds for w in r['people']}
for w, (sess, pid) in PEOPLE.items():
    pool = [q for q in quiet[w] if q['b'] - q['a'] >= 10]
    rnd.shuffle(pool)
    pool.sort(key=lambda q: q['inside'])          # footage nobody sees elsewhere first
    slots = [(join.get(w, 0) + rnd.uniform(4, 12), 0.0)] + [(r['at'], r['src'][1] - r['src'][0]) for r in rounds if w not in r['people']]
    for at, span in slots:
        if not pool: break
        if span and (at < join.get(w, 0) + 20 or rnd.random() < 0.3): continue
        a0 = at + (rnd.uniform(5, max(6, span * 0.5)) if span else 0)
        q = pool.pop(0)
        length = min(q['b'] - q['a'] - 0.5, rnd.uniform(16, 48))
        a, b = a0, a0 + length
        if any(not (b + 25 < p[0] or a - 25 > p[1]) for p in pieces[w]): pool.append(q); continue
        # not footage that plays in a round within 4 minutes of here
        rd = next((x for x in rounds if x['chat'] == q['chat'] and w in x['people']), None)
        if q['inside'] and rd and abs(rd['at'] - a) < 240: pool.append(q); continue
        pieces[w].append([a, b, q['chat'], q['a'] + 0.25, False])
        pieces[w].sort()
    print(w, 'unused quiet footage', round(sum(q['b'] - q['a'] for q in pool) / 60, 1), 'min')
# wrap: whoever still has the camera on from the last round keeps it on until they leave
for w in pieces:
    p = pieces[w][-1]
    if p[1] > TALK_END - 60:
        k = kp(w, p[2]); src_end = p[3] + (p[1] - p[0])
        extra = min(LEAVE[w] - p[1], len(k) / FPS - src_end - 0.5)
        talk = own_talk(w, p[2]); nxt_talk = min([a for a, b in talk if a > src_end] + [1e9])
        extra = min(extra, nxt_talk - src_end - 0.4)
        if extra > 0 and still(w, p[2], src_end, src_end + extra): p[1] += extra
for w in pieces:
    pieces[w] = [[round(a, 3), round(b, 3), c, round(s, 3), au] for a, b, c, s, au in pieces[w]]

# ---------- timeline for the page ----------
cues = []; speaking = {}; cam_on = {}
for w, ps in pieces.items():
    on = []
    for a, b, chat, s, audio in ps:
        mot = [m for m in flag_spans(motion_flags(kp(w, chat), s, int(round((b - a) * FPS))), a) if m[1] - m[0] >= 3.5]   # a quick head turn stays on
        cur = a
        for ma, mb in mot:
            if ma > cur: on.append([cur, ma])
            cur = max(cur, mb)
        if b > cur: on.append([cur, b])
    cam_on[w] = on
def complement(on, lo, hi):
    out = []; cur = lo
    for a, b in sorted(on):
        if a - cur > 0.05: out.append([round(cur, 2), round(a, 2)])
        cur = max(cur, b)
    if hi - cur > 0.05: out.append([round(cur, 2), round(hi, 2)])
    # a camera that is off for under 1.2 s just looks like a glitch: keep it on instead
    return [x for x in out if x[1] - x[0] >= 1.2 or x[0] <= lo + 0.01]
cam_off = {w: complement(cam_on[w], join.get(w, 0), LEAVE[w] + 1) for w in PEOPLE}

def add_cue(who, start, end, text, words):
    cues.append({'who': who, 'start': round(start, 2), 'end': round(end, 2), 'text': text, 'words': [round(x, 2) for x in words]})
for r in rounds:
    s, e = r['src']; off = r['at'] - s
    for w in r['people']:
        skip = 2.6 if (w == 'lauren' and r['chat'] == '093') else 0    # her mic only picked up his voice there
        r.setdefault('skip', {})[w] = skip
        for l in open(f'{SEAM}/meta/{fid(w, r["chat"])}.vad.jsonl'):
            d = json.loads(l); a, b = max(d['start'], s, skip), min(d['end'], e)
            if b > a: speaking.setdefault(w, []).append([round(a + off, 2), round(b + off, 2)])
        for l in chat_lines(f'{SEAM}/tr', r['sess'], r['chat'], [PEOPLE[w][1]]):
            ws = [x for x in l['words'] if s <= x['start'] < e and x['start'] >= skip]
            if ws: add_cue(w, ws[0]['start'] + off, min(ws[-1]['end'], e) + off, ' '.join(x['word'] for x in ws), [x['start'] + off for x in ws])
for l in lines:
    at, dur = l['at'], l['dur']
    speaking.setdefault(l['who'], []).append([round(at + 0.1, 2), round(at + dur - 0.15, 2)])
    ws = l['text'].split(); tot = sum(len(x) + 1 for x in ws); c = 0; times = []
    for x in ws: times.append(at + 0.15 + (dur - 0.4) * c / tot); c += len(x) + 1
    add_cue(l['who'], times[0], at + dur - 0.15, l['text'], times)
cues.sort(key=lambda c: c['start'])
for w in speaking: speaking[w].sort()

timeline = {'end': END, 'talkEnd': TALK_END, 'join': join, 'leave': LEAVE, 'speaking': speaking, 'camOff': cam_off, 'cues': cues}
json.dump(timeline, open(f'{OUT}/timeline.json', 'w'))
json.dump({'end': END, 'lines': lines, 'rounds': rounds, 'pieces': pieces, 'join': join, 'leave': LEAVE}, open(f'{OUT}/plan.json', 'w'), indent=1)
for w, ps in pieces.items():
    on = sum(b - a for a, b in cam_on[w]); print(f'{w:7s} camera on {on / 60:5.1f} min of {(LEAVE[w] - join.get(w, 0)) / 60:.1f};', len(ps), 'pieces;', len(cam_off[w]), 'off spans')
print('cues', len(cues))
