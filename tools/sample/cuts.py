"""Find the visible cuts in a rendered tile video: moments where the footage jumps to another clip while the camera
is on. cuts.py VIDEO.mp4 OUT.json writes [[time, size], ...]. Black frames (camera off) never count as a cut."""
import json, subprocess, sys
import numpy as np
src, dst = sys.argv[1], sys.argv[2]
W, H = 64, 36
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-skip_loop_filter', 'all', '-i', src, '-vf', f'scale={W}:{H}:flags=area,format=gray',
                      '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
raw = p.stdout.read(); p.wait()
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
fps = 30000 / 1001
lit = fr.mean(axis=(1, 2)) > 12                      # not a black (camera off) frame
d = np.abs(fr[1:] - fr[:-1]).mean(axis=(1, 2))      # change from one frame to the next
cuts = []
for i in range(len(d)):
    if not (lit[i] and lit[i + 1]): continue
    lo, hi = max(0, i - 15), min(len(d), i + 16)
    around = np.median(np.r_[d[lo:i], d[i + 1:hi]]) if hi - lo > 2 else 0
    if d[i] > 6 and d[i] > 5 * (around + 0.5): cuts.append([round((i + 1) / fps, 2), round(float(d[i]), 1)])
json.dump(cuts, open(dst, 'w'))
print(src, len(fr), 'frames,', len(cuts), 'cuts')
