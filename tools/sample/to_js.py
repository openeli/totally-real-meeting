"""Write a real-video meeting's timeline.json as a script the page can load: to_js.py timeline.json timeline.js KEY (short or hour)."""
import json, sys
src, dst, key = sys.argv[1], sys.argv[2], sys.argv[3]
d = json.load(open(src))
head = ('/* Timings for the real-video meeting ("With audio", ' + key + '), made by the build scripts in tools/sample from the\n'
        '   Seamless Interaction transcripts (CC BY-NC 4.0). Times are seconds from when you join: clock is what the meeting\n'
        '   clock reads then, join/leave/end/talkEnd are when things happen, speaking holds [from, to] spans per person,\n'
        '   camOff the spans with the camera off, cues each sentence with the time of every word, chat the typed messages. */\n')
open(dst, 'w').write(head + f'(window.SAMPLE_TIMELINES = window.SAMPLE_TIMELINES || {{}}).{key} = ' + json.dumps(d, separators=(',', ':'), ensure_ascii=False) + ';\n')
print(key, len(d['cues']), 'cues', d['end'], 's')
