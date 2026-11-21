"""Re-cut a prepared meeting's tile videos so cameras stay calm and the footage never visibly jumps.

restitch.py TIMELINE.js VIDEO_DIR WORK [--debug]

The first renders cut listening footage together from many short pieces, and turned cameras off for a few seconds at a
time. This keeps every frame where a person talks exactly where it was (lip sync), and fills the rest from that
person's own quiet footage:
- a switch to other footage only happens where the two frames look almost the same (a seam nobody can see);
  failing that, the clip plays backwards and forwards again over still footage, which reads as natural small movement;
- a jump nobody can avoid becomes a short freeze first (a network hiccup), at most one every two minutes per person;
- a camera only goes off when there is no clean way on, then stays off for at least MIN_OFF seconds and on for MIN_ON;
- across the meeting, two camera changes are at least GAP seconds apart.
Writes WORK/plan-NAME.npy (output frame -> source frame, -1 for camera off) and the new camOff into TIMELINE.js;
render_plan.py then builds each new video from its plan, with the original sound."""
import json, os, re, subprocess, sys
import numpy as np

FPS = 30000 / 1001
MIN_OFF, GAP, MIN_ON = 45.0, 20.0, 60.0
SW, SH = 32, 18
path, vdir, work = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(work, exist_ok=True)
text = open(path).read()
mm = re.search(r'^(.*?= )(\{.*\});\s*$', text, re.S)
head, tl = mm.group(1), json.loads(mm.group(2))
end = tl['end']; join, leave = tl.get('join', {}), tl.get('leave', {})
N = int(round(end * FPS)) + 2
rng = np.random.default_rng(7)

def descriptors(w):
    cache = f'{work}/desc-{w}.npy'
    if os.path.exists(cache): return np.load(cache)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-skip_loop_filter', 'all', '-i', f'{vdir}/{w}.mp4', '-vf',
                          f'scale={SW}:{SH}:flags=area,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    d = np.frombuffer(raw, np.uint8).reshape(-1, SH * SW).astype(np.float32)
    np.save(cache, d); return d

def spans_mask(spans, n, pad=0):
    m = np.zeros(n, bool)
    for a, b in spans: m[max(0, int((a - pad) * FPS)):min(n, int((b + pad) * FPS) + 1)] = True
    return m

plans = {}; xfs = {}; fills = {}
for w in tl['camOff']:
    if not os.path.exists(f'{vdir}/{w}.mp4'): continue
    D = descriptors(w); n = min(len(D), N)
    lit = D[:n].mean(1) > 12
    step = np.r_[np.abs(D[1:n] - D[:n - 1]).mean(1), 99]           # change to the next frame
    flow = step[lit[:n] & np.r_[lit[1:n], False]]
    THR = float(np.percentile(flow, 75))                              # a seam no bigger than ordinary movement
    brk = (step > max(6, 4 * THR)) | ~lit | ~np.r_[lit[1:n], False]  # a cut, or the footage ends: never play across it
    if os.path.exists(f'{work}/cuts-src-{w}.json'):                  # cuts found by cuts.py in the source
        for tc, _ in json.load(open(f'{work}/cuts-src-{w}.json')):
            k = int(round(tc * FPS)) - 1
            if 0 <= k < n: brk[k] = True   # the boundary between frame k and k + 1
    talk = spans_mask(tl['speaking'].get(w, []), n, 0.25)
    quiet = lit & ~spans_mask(tl['speaking'].get(w, []), n, 0.6)
    # frames that must stay exactly in place: talking, plus half a second around it
    need = spans_mask(tl['speaking'].get(w, []), n, 0.5) & lit
    # how far each quiet frame can play forward without a break (for picking where to jump in)
    run = np.zeros(n, int); r = 0
    for f in range(n - 1, -1, -1):
        r = r + 1 if quiet[f] and not brk[f] else (1 if quiet[f] else 0); run[f] = r
    cand = np.where(run >= int(3 * FPS))[0]
    uses = np.zeros(n, np.int32)
    out = np.full(n, -1, np.int64); xf = np.zeros(n, bool)
    j0, j1 = int(join.get(w, 0) * FPS), min(n, int((leave.get(w, end) + 1) * FPS))
    # the stretches that must be identical, and the time each one starts
    ids = []; f = j0
    while f < j1:
        if need[f]:
            g = f
            while g < j1 and need[g]: g += 1
            ids.append((f, g)); f = g
        else: f += 1
    nxt_id = lambda t: next((a for a, b in ids if a >= t), j1)
    in_id = np.zeros(n, bool)
    for a, b in ids: in_id[a:b] = True

    THR2 = float(np.percentile(flow, 90)); HARD = 3.5 * THR2
    def best_jump(c):
        if not len(cand): return None, 1e9
        d = np.abs(D[cand] - D[c]).mean(1) + 0.15 * THR2 * uses[cand]
        d[np.abs(cand - c) < int(2 * FPS)] = 1e9
        i = int(np.argmin(d)); return int(cand[i]), float(np.abs(D[cand[i]] - D[c]).mean())
    def wlen(c):   # length of the quiet window around source frame c
        a = c
        while a > 0 and quiet[a - 1] and not brk[a - 1]: a -= 1
        return run[a] if quiet[a] else 0
    nlit = np.full(n + 1, n); 
    for f in range(n - 1, -1, -1): nlit[f] = f if lit[f] else nlit[f + 1]
    t = j0; c = -1; dirn = 1; flips = 0
    is_filler = np.zeros(n, bool)
    def seam(t, frm): return float(np.abs(D[t] - D[frm]).mean())
    while t < j1:
        prev = out[t - 1] if t > j0 else -1
        # the original footage, at its own time, is always in sync with the voice: stay on it while it runs unbroken
        if prev == t - 1 and prev >= 0 and lit[t] and not brk[t - 1]:
            out[t] = t; c = t; dirn = 1; t += 1; continue
        if in_id[t] or (lit[t] and prev >= 0 and seam(t, prev) <= THR2) or (lit[t] and prev < 0):
            if prev >= 0 and prev != t - 1:
                dd = seam(t, prev)
                if dd > HARD:     # no clean way back: the camera was off for a while just before
                    k = t - 1
                    while k >= j0 and is_filler[k] and t - k < int(MIN_OFF * FPS): out[k] = -1; is_filler[k] = False; k -= 1
                elif dd > THR2: xf[t] = True
            out[t] = t; c = t; dirn = 1; flips = 0; t += 1; continue
        if talk[t] and not lit[t]:   # they talk here but their own footage is dark: other footage would show a closed mouth
            out[t] = -1; c = -1; t += 1; continue
        # the original is black here or jumps to other footage: carry on with this person's quiet footage
        if c < 0:
            nxt = t
            while nxt < j1 and not lit[nxt]: nxt += 1
            if nxt - t < int(90 * FPS) or not len(cand): t = max(nxt, t + 1); continue
            free = cand[uses[cand] <= uses[cand].min()]
            c = int(rng.choice(free)); dirn = 1
            out[t] = c; is_filler[t] = True; uses[c] += 1; t += 1; continue
        c2 = c + dirn
        ok = 0 <= c2 < n and quiet[c2] and not (brk[c] if dirn > 0 else brk[c2])
        short = wlen(c) < int(1.5 * FPS)
        if ok and not short:
            out[t] = c2; c = c2; is_filler[t] = True; uses[c2] += 1; t += 1; continue
        q, dq = best_jump(c)
        # after two back-and-forths over the same footage, a slightly bigger (still small) step is better than rocking
        lim = THR2 if flips < 2 else 2 * THR2
        if not quiet[c]: lim = HARD          # leaving talk footage: nothing to rock on, take the closest match
        if q is not None and (dq <= lim or (short and dq <= 2 * THR2)):
            if dq > THR2: xf[t] = True
            out[t] = q; c = q; dirn = 1; flips = 0; is_filler[t] = True; uses[q] += 1; t += 1; continue
        if ok:
            out[t] = c2; c = c2; is_filler[t] = True; uses[c2] += 1; t += 1; continue
        c2 = c - dirn
        near = nlit[t] - t < int(60 * FPS) and wlen(c) >= int(3 * FPS)   # rocking over under 3 s of footage looks mechanical
        if (flips < (8 if wlen(c) >= int(3 * FPS) else 4) or near) and 0 <= c2 < n and quiet[c2] and not (brk[c2] if dirn > 0 else brk[c]):
            dirn = -dirn; flips += 1; out[t] = c2; c = c2; is_filler[t] = True; uses[c2] += 1; t += 1; continue
        c = -1; flips = 0; t += 1
    f = j0 + 1
    while f < j1:   # an off gap under half a second: the picture just holds for a moment, like a network hiccup
        if out[f] < 0 <= out[f - 1]:
            g = f
            while g < j1 and out[g] < 0: g += 1
            if g < j1 and g - f < int(0.5 * FPS) and np.abs(D[out[f - 1]] - D[out[g]]).mean() <= THR2: out[f:g] = out[f - 1]; is_filler[f:g] = True
            f = g
        else: f += 1
    # a jump nobody could avoid (the footage itself cuts while they talk): the picture freezes for a moment first,
    # the way a call does when the connection hiccups, then carries on
    # (at most one every two minutes per person; any other big jump turns the camera off for a while instead)
    last_freeze = -1e9
    for f in range(j0 + 13, j1):
        a, b = out[f - 1], out[f]
        if a >= 0 and b >= 0 and abs(int(b) - int(a)) != 1 and a != b and np.abs(D[a] - D[b]).mean() > 2 * THR2:
            if f - last_freeze > 120 * FPS and (out[f - 13:f - 1] >= 0).all():
                out[f - 12:f] = out[f - 13]; last_freeze = f
            else:
                out[f - 1] = -1
    k = j0
    while k < j1 and out[k] < 0: k += 1
    if j0 < k < j0 + int(3 * FPS): out[j0:k] = out[k]; is_filler[j0:k] = True   # on from the moment you see them
    plans[w] = out; xfs[w] = xf; fills[w] = is_filler

for w, out in plans.items(): _m = spans_mask(tl["speaking"].get(w, []), len(out)); print("before rules", w, round((out >= 0).sum() / FPS / 60, 1), "min on, talk seen", round((_m & (out >= 0)).sum() / max(1, _m.sum()) * 100), "%, off spans", sum(1 for i in range(1, len(out)) if out[i] < 0 <= out[i - 1]))
# ---------- camera changes: spans, minimum lengths, spacing across the meeting ----------
def spans_of(out):
    on = []; f = 0; n = len(out)
    while f < n:
        if out[f] >= 0:
            g = f
            while g < n and out[g] >= 0: g += 1
            on.append([f, g]); f = g
        else: f += 1
    return on
def talk_frames(w, a, b):
    m = spans_mask(tl['speaking'].get(w, []), b + 1)
    return int(m[a:b].sum())
before = {w: o.copy() for w, o in plans.items()}
for it in range(0 if "--norules" in sys.argv else 400):
    changed = False
    for w, out in plans.items():
        sp = spans_of(out); j0, j1 = int(join.get(w, 0) * FPS), min(len(out), int((leave.get(w, end) + 1) * FPS))
        for i in range(1, len(sp)):
            gap = sp[i][0] - sp[i - 1][1]
            if gap < MIN_OFF * FPS:
                k = int(MIN_OFF * FPS) - gap + 1
                a0, b0 = sp[i - 1]; a1, b1 = sp[i]
                cst = lambda a, b: 50 * talk_frames(w, a, b) + 2 * int((~fills[w][a:b]).sum()) + (b - a)
                if cst(max(a0, b0 - k), b0) <= cst(a1, min(b1, a1 + k)): out[max(a0, b0 - k):b0] = -1
                else: out[a1:min(b1, a1 + k)] = -1
                changed = True; break
        for a, b in spans_of(out):
            if b - a < MIN_ON * FPS and a > j0 + 1 and b < min(j1, len(out), int(end * FPS)) - int(1.5 * FPS): out[a:b] = -1; changed = True
    ev = []
    for w, out in plans.items():
        j0, j1 = int(join.get(w, 0) * FPS), min(len(out), int((leave.get(w, end) + 1) * FPS))
        for a, b in spans_of(out):
            if a > j0 + 1: ev.append((a, w, 'on'))
            if b < min(j1, len(out), int(end * FPS)) - int(1.5 * FPS): ev.append((b, w, 'off'))
    ev.sort()
    for x, y in zip(ev, ev[1:]):
        if y[0] - x[0] >= GAP * FPS: continue
        k = int(GAP * FPS) - (y[0] - x[0]) + 1
        opts = []
        if y[2] == 'on': opts.append(('on', y[1], y[0], y[0] + k))
        if x[2] == 'off': opts.append(('off', x[1], x[0] - k, x[0]))
        if not opts: opts = [('on', x[1], x[0], y[0] + k), ('off', y[1], x[0] - k, y[0])]
        kind, w, a, b = min(opts, key=lambda o: (o[3] - o[2]) + 50 * talk_frames(o[1], max(0, o[2]), o[3]) + 2 * int((~fills[o[1]][max(0, o[2]):o[3]]).sum()))
        plans[w][max(0, a):b] = -1; changed = True; break
    if not changed: break

stats = {}
for w, out in plans.items():
    off = []
    j0, j1 = join.get(w, 0), leave.get(w, end) + 1
    cur = j0
    for a, b in spans_of(out):
        if a / FPS > cur + 0.05: off.append([round(cur, 2), round(a / FPS, 2)])
        cur = max(cur, b / FPS)
    if j1 > cur + 0.05: off.append([round(cur, 2), round(j1, 2)])
    tl['camOff'][w] = off
    np.save(f'{work}/plan-{w}.npy', out); np.save(f'{work}/xf-{w}.npy', xfs[w])
    on = int((out >= 0).sum()); talk_all = spans_mask(tl['speaking'].get(w, []), len(out))
    seen = int((talk_all & (out >= 0)).sum())
    d1 = out[1:] - out[:-1]; ok2 = (out[1:] >= 0) & (out[:-1] >= 0); jumps = int((ok2 & (np.abs(d1) != 1)).sum()); turns = int((ok2[1:] & ok2[:-1] & (d1[1:] * d1[:-1] == -1)).sum()); fades = int(xfs[w].sum())
    stats[w] = f'on {on / FPS / 60:4.1f} min, {len(off)} off spans, talking on camera {seen / max(1, talk_all.sum()) * 100:3.0f}%, {jumps} seams ({fades} soft), {turns} turns'
    print(w, stats[w])
open(path, 'w').write(head + json.dumps(tl, separators=(',', ':'), ensure_ascii=False) + ';\n')

if "--debug" in sys.argv:
    for w in plans:
        o = before[w]; sp = spans_of(o)
        print(w, 'before on spans', [(round(a / FPS), round(b / FPS)) for a, b in sp])
        print(w, 'after  on spans', [(round(a / FPS), round(b / FPS)) for a, b in spans_of(plans[w])])
