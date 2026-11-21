"""Keep cameras calm in a prepared meeting, so the grid never flickers.

calm_cameras.py TIMELINE.js CUTS_DIR PREFIX [--check]

Rules, for every filmed tile:
- once a camera goes off it stays off for at least MIN_OFF seconds, and once on it stays on for at least MIN_ON;
- across the whole meeting, two camera changes are at least GAP seconds apart (so two tiles never change together);
- the footage never jumps while the camera is on: every visible cut (found by cuts.py) sits inside an off span.
It only ever turns cameras off for longer, never on, because the videos are black wherever the camera was off.
The person's voice is untouched: someone who talks while their camera is off is simply heard with their camera off.
--check only reports whether the timeline already follows the rules."""
import json, re, sys

MIN_OFF, MIN_ON, GAP = 45.0, 59.9, 19.9   # seconds; restitch.py uses 45, 60 and 20
path, cuts_dir, prefix = sys.argv[1], sys.argv[2], sys.argv[3]
check = '--check' in sys.argv
text = open(path).read()
m = re.search(r'^(.*?= )(\{.*\});\s*$', text, re.S)
head, tl = m.group(1), json.loads(m.group(2))
join, leave, end = tl.get('join', {}), tl.get('leave', {}), tl['end']

def on_spans(w):
    lo, hi = join.get(w, 0), leave.get(w, end) + 1
    out, cur = [], lo
    for a, b in sorted(tl['camOff'].get(w, [])):
        if a > cur + 0.05: out.append([cur, a])
        cur = max(cur, b)
    if hi > cur + 0.05: out.append([cur, hi])
    return out

def talk(w, a, b):
    return sum(max(0, min(b, y) - max(a, x)) for x, y in tl['speaking'].get(w, []))

def events(spans, w):
    """Camera changes the viewer sees: an on at the start of a span (unless it starts at join), an off at its end (unless it lasts until they leave)."""
    ev = []
    for a, b in spans:
        if a > join.get(w, 0) + 0.05: ev.append((a, w, 'on'))
        if b < min(leave.get(w, end), end) - 1.5: ev.append((b, w, 'off'))   # the camera ending as they leave is not a change
    return ev

def problems(cams, cuts):
    out = []
    for w, sp in cams.items():
        for i, (a, b) in enumerate(sp):
            touches_join = a <= join.get(w, 0) + 0.05; touches_leave = b >= min(leave.get(w, end), end) - 1.5
            if b - a < MIN_ON and not (touches_join or touches_leave): out.append(f'{w} on only {b - a:.1f}s at {a:.1f}')
            if i and a - sp[i - 1][1] < MIN_OFF: out.append(f'{w} off only {a - sp[i - 1][1]:.1f}s at {sp[i - 1][1]:.1f}')
        for t in cuts.get(w, []):
            if any(a + 0.1 < t < b - 0.1 for a, b in sp): out.append(f'{w} footage jumps on camera at {t:.1f}')
    ev = sorted(e for w, sp in cams.items() for e in events(sp, w))
    for x, y in zip(ev, ev[1:]):
        if y[0] - x[0] < GAP: out.append(f'{x[1]} {x[2]} at {x[0]:.1f} and {y[1]} {y[2]} at {y[0]:.1f} are {y[0] - x[0]:.1f}s apart')
    return out, ev

people = list(tl['camOff'].keys())
cuts = {}
for w in people:
    try: cuts[w] = [t for t, size in json.load(open(f'{cuts_dir}/{prefix}-{w}.json'))]
    except FileNotFoundError: cuts[w] = []
cams = {w: on_spans(w) for w in people}

if not check:
    # 1. split at every visible cut
    for w in people:
        sp = []
        for a, b in cams[w]:
            pts = [a] + [t for t in cuts[w] if a + 0.1 < t < b - 0.1] + [b]
            sp += [[x, y] for x, y in zip(pts, pts[1:])]
        cams[w] = sp
    value = lambda w, a, b: (b - a) + 4 * talk(w, a, b)   # seconds on camera, talking counts four times
    for _ in range(200):
        changed = False
        # 2. per person: short off gaps are widened by trimming the cheaper side, short on spans are dropped
        for w in people:
            sp = sorted(cams[w]); lo, hi = join.get(w, 0), leave.get(w, end) + 1
            for i in range(1, len(sp)):
                gap = sp[i][0] - sp[i - 1][1]
                if gap < MIN_OFF - 0.01:
                    need = MIN_OFF - gap
                    a0, b0 = sp[i - 1]; a1, b1 = sp[i]
                    cost_l = value(w, b0 - need, b0); cost_r = value(w, a1, a1 + need)
                    if cost_l <= cost_r: sp[i - 1][1] = b0 - need
                    else: sp[i][0] = a1 + need
                    changed = True
            keep = [s for s in sp if s[1] - s[0] >= MIN_ON or (s[0] <= lo + 0.05 and s[1] - s[0] > 0) or (s[1] >= hi - 0.1 and s[1] - s[0] > 0)]
            if len(keep) != len(sp): changed = True
            cams[w] = keep
        # 3. meeting wide: changes too close together. An on can move later, an off can move earlier.
        probs, ev = problems(cams, {})
        for x, y in zip(ev, ev[1:]):
            if y[0] - x[0] >= GAP: continue
            need = GAP - (y[0] - x[0])
            opts = []
            if y[2] == 'on': opts.append((y, +need + 0.01))
            if x[2] == 'off': opts.append((x, -need - 0.01))
            if not opts:   # x is an on and y an off: push x past y, or pull y before x
                opts = [(x, (y[0] - x[0]) + GAP + 0.01), (y, -(y[0] - x[0]) - GAP - 0.01)]
            def cost(o):
                (t, w, kind), d = o
                s = next(s for s in cams[w] if abs((s[0] if kind == 'on' else s[1]) - t) < 1e-6)
                return value(w, t, t + d) if d > 0 else value(w, t + d, t)
            (t, w, kind), d = min(opts, key=cost)
            for s in cams[w]:
                if kind == 'on' and abs(s[0] - t) < 1e-6: s[0] += d
                if kind == 'off' and abs(s[1] - t) < 1e-6: s[1] += d
            cams[w] = [s for s in cams[w] if s[1] - s[0] > 0.5]
            changed = True
            break
        if not changed: break
    for w in people:
        lo, hi = join.get(w, 0), leave.get(w, end) + 1
        off, cur = [], lo
        for a, b in sorted(cams[w]):
            if a > cur + 0.05: off.append([round(cur, 2), round(a, 2)])
            cur = max(cur, b)
        if hi > cur + 0.05: off.append([round(cur, 2), round(hi, 2)])
        tl['camOff'][w] = off
    cams = {w: on_spans(w) for w in people}
    open(path, 'w').write(head + json.dumps(tl, separators=(',', ':'), ensure_ascii=False) + ';\n')

probs, ev = problems(cams, cuts)
for w in people:
    on = sum(b - a for a, b in cams[w]); span = leave.get(w, end) + 1 - join.get(w, 0)
    said = talk(w, 0, 1e9); seen = sum(talk(w, a, b) for a, b in cams[w])
    print(f'{w:7s} camera on {on / 60:4.1f} of {span / 60:4.1f} min, {len(events(cams[w], w)):3d} changes, talking on camera {seen / max(said, 1) * 100:3.0f}%')
print(len(ev), 'camera changes in', round(end / 60, 1), 'min;', len(probs), 'problems')
for p in probs[:15]: print('  ', p)
sys.exit(1 if probs else 0)
