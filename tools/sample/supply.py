import sys, os, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hour_script import *; from resolve import *; from motion import motion_flags, FPS
SEAM = sys.argv[1]; MIN = float(sys.argv[2]) if len(sys.argv) > 2 else 5   # usage: supply.py SEAM MIN_SECONDS OUT.json
todo = [l.split()[0] for l in open(f'{SEAM}/dl/todo.txt')]
used = {}
for r in ROUNDS:
    a, b = PAIR[r['sess']]; L = chat_lines(f'{SEAM}/tr', r['sess'], r['chat'], [PEOPLE[a][1], PEOPLE[b][1]])
    used[(r['sess'], r['chat'])] = resolve(r, L)
def quiet_spans(fid, sess, chat, pid):
    vad = [json.loads(l) for l in open(f'{SEAM}/tr/{fid}.vad.jsonl')]
    tr = chat_lines(f'{SEAM}/tr', sess, chat, [pid])
    talk = sorted([(v['start'], v['end']) for v in vad] + [(l['start'], l['end']) for l in tr])
    k = np.load(f'{SEAM}/meta/{fid}.keypoints.npy'); dur = len(k) / FPS
    bad = motion_flags(k, 0, len(k))
    gaps = []; t = 0.5
    for a, b in talk + [(dur - 0.5, dur)]:
        if a - 0.4 > t: gaps.append((t, a - 0.4))
        t = max(t, b + 0.4)
    out = []
    for a, b in gaps:   # split on bad motion frames
        fa, fb = int(a * FPS), int(b * FPS); seg_start = None
        for f in range(fa, fb + 1):
            ok = f < fb and not bad[min(f, len(bad) - 1)]
            if ok and seg_start is None: seg_start = f
            if not ok and seg_start is not None:
                if (f - seg_start) / FPS >= MIN: out.append((round(seg_start / FPS, 2), round(f / FPS, 2)))
                seg_start = None
    return out
res = {}
for who, (sess, pid) in PEOPLE.items():
    tot = 0; tot_out = 0; spans = []
    for fid in todo:
        v, s, i, p = fid.split('_')
        if s != sess or p[1:] != pid or not os.path.exists(f'{SEAM}/meta/{fid}.keypoints.npy'): continue
        chat = i[-3:]
        for a, b in quiet_spans(fid, sess, chat, pid):
            u = used.get((sess, chat)); inside = u and not (b <= u[0] or a >= u[1])
            spans.append({'chat': chat, 'a': a, 'b': b, 'inside': bool(inside)})
            tot += b - a; tot_out += 0 if inside else b - a
    res[who] = spans
    print(who, 'quiet', round(tot / 60, 1), 'min; outside used windows', round(tot_out / 60, 1), 'min;', len(spans), 'spans')
json.dump(res, open(sys.argv[3] if len(sys.argv) > 3 else 'quiet.json', 'w'))
