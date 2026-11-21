"""The 15-minute "Team connect": video first, no computer voices.

You join a call that started 15 minutes ago (the clock reads 15:00), in the middle of Ryan's answer,
and it runs about 15 more minutes.

The host (camera off) types each question in the meeting chat and a filmed pair answers it out loud.
Camera-off colleagues react in the chat too. Same pairs, footage and markers as hour_script.py.
"""
from hour_script import PEOPLE, PAIR   # noqa: F401  (same filmed people)

CLOCK = 900     # the meeting clock when you join, in seconds
JOIN = {}       # everyone is already there

# each chat line: (who, text); 'pause' rows wait that many seconds
OPEN = [('pause', 0.5)]

ROUNDS = [
    dict(sess='S1982', chat='100', start="It was like the most beautiful mountains", end=215.96,
         ask=[],   # asked before you joined
         after=[('hannah', "Albania is officially on my list now")]),
    dict(sess='S1564', chat='100', start="A lot of times you're locked in", end=256.65,
         ask=[('priya', "Next: what's the most spontaneous risk you've ever taken? Greg, you signed up for the Army, right?")],
         after=[('daniel', "Wait, Greg, I had no idea you served!")]),
    dict(sess='S1321', chat='040', start="And we continued down the mountain", end=148.19,
         ask=[('priya', "Story game! Mike & Bill, build a ridiculous story one line at a time. It starts with a snowball rolling down a mountain ⛄")],
         after=[('daniel', "A drunk yeti 😂 best one yet")]),
    dict(sess='S1982', chat='235', start="So I do like heights", end_before="You know what's funny enough",
         ask=[('priya', "Let's plan a team outing. Megan, you're the one who went skydiving, right?")],
         after=[('hannah', "Skydiving is a hard no from me. Rafting maybe?")]),
    dict(sess='S1564', chat='097', start=10.8, end=165.0,
         ask=[('priya', "Confession time: the shared desks are getting cluttered again. Greg, how do you keep yours under control?")],
         after=[('daniel', "Labeled boxes, stealing that idea")]),
    dict(sess='S1321', chat='201', start=19.72, end=158.56,
         ask=[('priya', "Last one. Mike, tell us about a time you stepped up when nobody else would.")],
         after=[('hannah', "From covering one shift to getting promoted. Nice one, Mike 👏")]),
]

# Pictures nobody should see, found by eye: Bill stands up and moves around close to the camera here (motion.py misses it
# because he stays in frame). His camera stays off until he is seated again, which happens as Ryan says
# "...the guy whose house we were staying in". Seconds from when you join.
CAM_OFF = {'bill': [(0.0, 19.2), (449.3, 498.7)]}

CLOSE = [('priya', "That's time! Thanks everyone, this was really fun 😊"), ('pause', 3), ('daniel', "Thanks all, have a good weekend!")]
LEAVE_ORDER = ['daniel', 'megan', 'bill', 'hannah', 'ryan', 'lauren', 'aisha', 'mike', 'greg']
