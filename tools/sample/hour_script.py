"""The one-hour "Team connect hour": who says what, in order.

A round is a question from the host (text-to-speech), a filmed pair talking it through (a stretch of one
Seamless Interaction chat), then sometimes a short reaction from a camera-off colleague.
start/end are seconds into the chat, or text: 'start' begins at the sentence that starts with that text,
'end' finishes after the sentence that starts with it, 'end_before' stops just before it.
"""
VOICES = {'priya': 'af_heart', 'daniel': 'am_michael', 'hannah': 'bf_emma'}
PEOPLE = {   # filmed people: session, participant id
    'greg': ('S1564', '1546'), 'lauren': ('S1564', '4303'),
    'mike': ('S1321', '4065'), 'bill': ('S1321', '4133'),
    'ryan': ('S1982', '5401'), 'megan': ('S1982', '5407'),
}
PAIR = {'S1564': ('greg', 'lauren'), 'S1321': ('mike', 'bill'), 'S1982': ('ryan', 'megan')}
JOIN = {'aisha': 20, 'megan': 32, 'bill': 47}

INTRO = [
    ('priya', "Hi everyone. Let's give it a minute, a few people are still joining."),
    ('pause', 6),
    ('daniel', "Morning! Can everyone hear me okay?"),
    ('priya', "Loud and clear, Daniel."),
    ('pause', 8),
    ('hannah', "Hi all. My camera's acting up today, so I'll stay off video."),
    ('priya', "No worries, Hannah."),
    ('pause', 12),
    ('priya', "Okay, welcome to team connect hour. Same format as last time. I'll throw out a question, a pair takes it, and anyone can jump in. Cameras on if you can, but no pressure."),
]

ROUNDS = [
    dict(sess='S1564', chat='093', start=0.25, end=70.0,
         intro=[('priya', "Let's start easy. Greg, Lauren said the audio and video side of the studio project was all new to her. How was it for you?")],
         after=[('daniel', "Same here, honestly. I spent a whole afternoon just on the microphone levels."), ('priya', "Ha, I believe it.")]),
    dict(sess='S1321', chat='196', start="Okay, my boss on the train", end=212.4,
         intro=[('priya', "Next one, and be honest. Tell us about someone at work you found hard to get along with. Bill, Mike, want to take this one?")],
         after=[('hannah', "Firing the one manager everybody liked? That's rough.")]),
    dict(sess='S1982', chat='233', start="So I've been driving", end=200.55,
         intro=[('priya', "Something more hopeful. Ryan, Megan, what's a goal you're working toward right now? Ryan, how's the application process going?")],
         after=[('daniel', "Good luck with it, Ryan. Fingers crossed.")]),
    dict(sess='S1564', chat='097', start=10.8, end=165.0,
         intro=[('priya', "Okay, confession time. The shared desks are getting cluttered again. Greg, how do you keep yours under control?")],
         after=[('priya', "Labeled boxes. I love that, Lauren.")]),
    dict(sess='S1321', chat='201', start=19.72, end=158.56,
         intro=[('priya', "Here's one about taking a chance. Mike, tell us about a time you stepped up when nobody else would.")],
         after=[('hannah', "From covering one shift to getting promoted. Nice one, Mike.")]),
    dict(sess='S1982', chat='092', start=1.33, end=114.8,
         intro=[('priya', "Megan, a question for you. What's a tricky situation you've had to handle on the job?")],
         after=[('daniel', "Paying someone a compliment to calm things down. I'm going to try that.")]),
    dict(sess='S1564', chat='100', start="A lot of times you're locked in", end=256.65,
         intro=[('priya', "Okay, adventurous one. What's the most spontaneous risk you've ever taken? Greg, you signed up for the Army, right?")],
         after=[('hannah', "I had no idea you served, Greg.")]),
    dict(sess='S1321', chat='204', start="Yeah, so powder coating is", end=143.56,
         intro=[('priya', "Mike, Bill, tell us about a tough goal you actually hit. Mike, weren't you explaining powder coating to Bill earlier?")],
         after=[('daniel', "Turning a big order into a race. Smart.")]),
    dict(sess='S1982', chat='099', start="In terms of helping someone else", end_before="All right.",
         intro=[('priya', "When did you last go out of your way for someone? Ryan, Megan was just telling me about a friend's move.")],
         after=[('priya', "A guy with a pickup truck. Everyone's favorite friend on moving day.")]),
    dict(sess='S1564', chat='230', start="To my mom, I told her", end=246.0,
         intro=[('priya', "Here's a fun one. Have you ever kept something from your family so they wouldn't worry? Greg?")],
         after=[('hannah', "A whole base built from nothing, and your mom thought you were doing paperwork.")]),
    dict(sess='S1321', chat='040', start="And we continued down the mountain", end=148.19,
         intro=[('priya', "Time for a quick story game. Mike and Bill, build a ridiculous story together, one line at a time. It starts with a snowball rolling down a mountain.")],
         after=[('daniel', "A drunk yeti. Honestly, best one yet.")]),
    dict(sess='S1982', chat='100', start="I would say Albania", end=215.96,
         intro=[('priya', "Ryan, what's the best trip you've ever taken on a tight budget?")],
         after=[('hannah', "Albania is officially on my list now.")]),
    dict(sess='S1564', chat='102', start="And what can you do about your file", end=237.95,
         intro=[('priya', "Lauren, any news on the card fraud mess? You said someone really helped you out.")],
         after=[('daniel', "Seven to ten business days, and then seven to ten more? That's brutal.")]),
    dict(sess='S1321', chat='195', start=119.03, end=298.78,
         intro=[('priya', "Looking back, is there a coworker you wish you'd handled differently? Mike?")],
         after=[('hannah', "A lead who micromanages everything would test anyone's patience.")]),
    dict(sess='S1982', chat='102', start="As much as I had my differences", end=159.82,
         intro=[('priya', "Ryan, who gave you a real chance when you needed one? Was it your basketball coach?")],
         after=[('priya', "A freshman on varsity. That's huge.")]),
    dict(sess='S1564', chat='098', start="Is it weird if you say something", end=231.93,
         intro=[('priya', "A tricky one now. Have you ever said something that came out harsher than you meant? Greg?")],
         after=[('daniel', "And now you both go to the gym. Happy ending.")]),
    dict(sess='S1321', chat='197', start="And then I got myself to where", end=117.56,
         intro=[('priya', "Bill, tell us about a time you helped someone who really needed it.")],
         after=[('hannah', "That's honest of you, admitting you tuned him out, Bill.")]),
    dict(sess='S1982', chat='235', start="So I do like heights", end_before="You know what's funny enough",
         intro=[('priya', "Let's plan a team outing. Megan, you're the one who went skydiving, right?")],
         after=[('daniel', "Skydiving is a hard no from me. Whitewater rafting, maybe.")]),
    dict(sess='S1564', chat='095', start=0.0, end=157.44,
         intro=[('priya', "Greg, how do you cope when plans keep changing? You've got kids, right?")],
         after=[('hannah', "The plan isn't always the plan. I might put that on a sticky note.")]),
    dict(sess='S1982', chat='104', start=1.52, end=116.9,
         intro=[('priya', "Ryan, what's the best career advice you've ever given someone?")],
         after=[('daniel', "Sports on a resume. That actually makes a lot of sense.")]),
    dict(sess='S1564', chat='104', start="And then if they specifically ask", end=151.84,
         intro=[('priya', "Last question. When someone vents to you, do you give advice, or do you just listen? Lauren, Greg?")],
         after=[]),
]

WRAP = [
    ('priya', "Okay, that's time. Thank you all, this was really fun."),
    ('priya', "Same time next month, and Hannah's picking the questions."),
    ('hannah', "Oh no. Okay, deal."),
    ('daniel', "Thanks, everyone. Have a good weekend."),
    ('priya', "Bye, everyone."),
]
LEAVE_ORDER = ['daniel', 'megan', 'bill', 'hannah', 'ryan', 'lauren', 'aisha', 'mike', 'greg']
