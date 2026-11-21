"""Build a tile video from a restitch.py plan: render_plan.py SOURCE.mp4 PLAN.npy OUT.mp4
Plays the source frames in the order the plan lists them (forwards, backwards or black for camera off) and keeps the
source's sound exactly as it was."""
import os, subprocess, sys, tempfile
import numpy as np
src, plan, dst = sys.argv[1], sys.argv[2], sys.argv[3]
FPS = 30000 / 1001
out = np.load(plan)
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames',
                            '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip() or 0)
n = int(dur) if dur else len(out)
out = np.r_[out, np.full(max(0, n - len(out)), -1)][:n]
# runs: (start source frame, length, step) with step +1, -1, or 0 for black
runs = []; i = 0
while i < n:
    if out[i] < 0:
        j = i
        while j < n and out[j] < 0: j += 1
        runs.append((-1, j - i, 0)); i = j; continue
    st = 1 if i + 1 < n and out[i + 1] == out[i] + 1 else (-1 if i + 1 < n and out[i + 1] == out[i] - 1 else 1)
    j = i + 1
    while j < n and out[j] >= 0 and out[j] == out[j - 1] + st: j += 1
    runs.append((int(out[i]), j - i, st)); i = j
enc = ['-c:v', 'libx264', '-crf', '27', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-g', '120', '-an']
tmp = tempfile.mkdtemp(dir=os.path.dirname(os.path.abspath(dst)))
files = []
for k, (s, L, st) in enumerate(runs):
    f = f'{tmp}/{k:05d}.mp4'; files.append(f)
    if st == 0:
        cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'color=black:s=854x480:r=30000/1001', '-frames:v', str(L)] + enc + [f]
    else:
        first = s if st > 0 else s - L + 1
        vf = f'trim=start_frame=0:end_frame={L},setpts=PTS-STARTPTS' + (',reverse' if st < 0 else '')
        cmd = ['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, (first - 0.3) / FPS):.5f}', '-i', src, '-vf', vf, '-frames:v', str(L), '-r', '30000/1001'] + enc + [f]
    subprocess.run(cmd, check=True)
lst = f'{tmp}/list.txt'
open(lst, 'w').write(''.join(f"file '{f}'\n" for f in files))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-i', src, '-map', '0:v', '-map', '1:a?',
                '-c', 'copy', '-movflags', '+faststart', dst], check=True)
for f in files + [lst]: os.remove(f)
os.rmdir(tmp)
print(dst, len(runs), 'runs')
