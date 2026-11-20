"""Turn the hour script's text markers into exact source seconds, using the chat transcripts."""
import json, os, re
def norm(s): return re.sub(r"[^a-z0-9' ]", '', s.lower()).strip()
def chat_lines(tr_dir, sess, chat, pids):
    out = []
    for p in pids:
        f = f'{tr_dir}/V03_{sess}_I00000{chat}_P{p}.jsonl'
        for l in open(f):
            try: d = json.loads(l)
            except Exception: continue
            ws = [w for w in d.get('words', []) if w.get('start') is not None and w.get('end') is not None]
            out.append({'p': p, 'start': d['start'], 'end': d['end'], 'text': d['transcript'].strip(), 'words': ws})
    return sorted(out, key=lambda x: x['start'])
def find(lines, text, after=-1):
    t = norm(text)
    for l in lines:
        if l['start'] > after and norm(l['text']).startswith(t): return l
    raise SystemExit(f'not found: {text!r}')
def resolve(r, lines):
    s = r['start']
    if isinstance(s, str): s = round(find(lines, s)['start'] - 0.3, 2)
    s = max(0.0, s)
    if 'end_before' in r:
        nxt = find(lines, r['end_before'], s)
        prev = [l['end'] for l in lines if l['end'] <= nxt['start'] + 0.05 and l['start'] >= s]
        e = round(min(nxt['start'] - 0.3, (max(prev) + 0.5) if prev else nxt['start'] - 0.3), 2)
    else:
        e = r['end']
        if isinstance(e, str): e = round(find(lines, e, s)['end'] + 0.4, 2)
    return s, e
