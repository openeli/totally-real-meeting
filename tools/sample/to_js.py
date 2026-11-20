import json, sys
src, dst = sys.argv[1], sys.argv[2]
d = json.load(open(src))
head = ('/* Timings for the real-video meeting ("With audio"), made by the build script from the Seamless Interaction\n'
        '   transcripts (CC BY-NC 4.0) and the text-to-speech lines. end/talkEnd/leave are seconds from the start;\n'
        '   speaking holds [from, to] spans per person; cues hold each sentence with the time of every word. */\n')
open(dst, 'w').write(head + 'const SAMPLE_TIMELINE = ' + json.dumps(d, separators=(',', ':'), ensure_ascii=False) + ';\n')
print(len(d['cues']), 'cues', d['end'], 's')
