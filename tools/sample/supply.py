"""Find silent, still footage of each filmed person: stretches where they neither talk nor move out of frame.
It is used while they listen to others. 'inside' marks footage that also plays as part of an answer.

usage: supply.py SEAM MIN_SECONDS OUT.json [short]   ('short' marks 'inside' against the 15-minute version's answers)
"""
import sys, os, json, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hour_script import PEOPLE, PAIR
from resolve import chat_lines, resolve
from motion import motion_flags, FPS

def used_windows(seam, rounds):
    used = {}
    for r in rounds:
        a, b = PAIR[r['sess']]
        L = chat_lines(f'{seam}/tr', r['sess'], r['chat'], [PEOPLE[a][1], PEOPLE[b][1]])
        used[(r['sess'], r['chat'])] = resolve(r, L)
    return used

def quiet_spans(seam, fid, sess, chat, pid, min_len):
    vad = [json.loads(l) for l in open(f'{seam}/tr/{fid}.vad.jsonl')]
    tr = chat_lines(f'{seam}/tr', sess, chat, [pid])
    talk = sorted([(v['start'], v['end']) for v in vad] + [(l['start'], l['end']) for l in tr])
    k = np.load(f'{seam}/meta/{fid}.keypoints.npy'); dur = len(k) / FPS
    bad = motion_flags(k, 0, len(k))
    gaps = []; t = 0.5
    for a, b in talk + [(dur - 0.5, dur)]:
        if a - 0.4 > t: gaps.append((t, a - 0.4))
        t = max(t, b + 0.4)
    out = []
    for a, b in gaps:   # split on moments where they move
        fa, fb = int(a * FPS), int(b * FPS); seg_start = None
        for f in range(fa, fb + 1):
            ok = f < fb and not bad[min(f, len(bad) - 1)]
            if ok and seg_start is None: seg_start = f
            if not ok and seg_start is not None:
                if (f - seg_start) / FPS >= min_len: out.append((round(seg_start / FPS, 2), round(f / FPS, 2)))
                seg_start = None
    return out

def supply(seam, min_len, rounds):
    todo = [l.split()[0] for l in open(f'{seam}/dl/todo.txt')]
    used = used_windows(seam, rounds); res = {}
    for who, (sess, pid) in PEOPLE.items():
        spans = []
        for fid in todo:
            v, s, i, p = fid.split('_')
            if s != sess or p[1:] != pid or not os.path.exists(f'{seam}/meta/{fid}.keypoints.npy'): continue
            chat = i[-3:]
            for a, b in quiet_spans(seam, fid, sess, chat, pid, min_len):
                u = used.get((sess, chat))
                spans.append({'chat': chat, 'a': a, 'b': b, 'inside': bool(u and not (b <= u[0] or a >= u[1]))})
        res[who] = spans
        tot = sum(x['b'] - x['a'] for x in spans); out = sum(x['b'] - x['a'] for x in spans if not x['inside'])
        print(who, 'quiet', round(tot / 60, 1), 'min; outside answers', round(out / 60, 1), 'min;', len(spans), 'pieces')
    return res

if __name__ == '__main__':
    seam, min_len, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    if len(sys.argv) > 4 and sys.argv[4] == 'short':
        from short_script import ROUNDS
    else:
        from hour_script import ROUNDS
    json.dump(supply(seam, min_len, ROUNDS), open(out, 'w'))
