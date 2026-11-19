/* talk.js: everything people say out loud in the meeting, shown as live captions.
   Edit freely. In exchanges, H is the meeting's host and A, B, C are three other people.
   Slots: {A}, {B}, {C} or {H} the first name of that person in the exchange, {other} another person's first name, {you} your first name (lines with it are skipped for a guest),
   {num} a small number, {pct} a percentage, {k} a round number of thousands, {day} a weekday. */

/* Before the meeting gets going. */
const SMALL_TALK = [
  [['A', 'Morning, everyone.'], ['B', 'Hey, morning! How was your weekend?'], ['A', 'Pretty quiet, honestly. We mostly stayed in and watched movies.'], ['B', 'Honestly, that sounds perfect.']],
  [['B', 'Can everyone hear me okay?'], ['C', 'Yep, loud and clear.'], ['B', 'Great. New headset, so I wasn’t sure.']],
  [['A', 'Is it just me, or is it freezing today?'], ['C', 'It’s not just you. I’m wearing two sweaters.'], ['A', 'Same. My coffee went cold in about five minutes.']],
  [['C', 'Did anyone catch the game last night?'], ['B', 'Only the second half. That ending was wild.'], ['C', 'I couldn’t believe that last minute.'], ['A', 'I had no idea there was a game, so I’ll just nod along.']],
  [['B', 'Sorry, my dog is going to bark at some point. Someone delivers a package every day at this time.'], ['A', 'Ha, no worries. Mine does the same thing.']],
  [['A', 'Are we waiting for anyone else?'], ['H', 'Let’s give it one more minute. A couple of people said they’re running late.']],
  [['C', 'How’s the new place, {A}?'], ['A', 'Still half in boxes, but getting there.'], ['C', 'The boxes never really go away. I still have three from two years ago.']],
  [['B', 'Happy almost Friday, everyone.'], ['C', 'Don’t jinx it. It’s only {day}.'], ['B', 'A person can dream.']]
];
const OPENING = [
  'Okay, let’s give people another minute to join.',
  'Alright, I think we have most people. Let’s get started.',
  'Thanks, everyone, for making the time today.',
  'Quick reminder that this meeting is being noted, so we’ll share a summary after.',
  'Here’s the plan for today. We’ve got four things to get through, so let’s keep it moving.'
];
/* How the host moves to the next agenda item. {item} is its name. */
const NEXT_ITEM = ['Okay, next up: {item}.', 'Let’s move on to {item}.', 'Great. Shall we jump to {item}?', 'Alright, that brings us to {item}.', 'Next on the list is {item}.'];

/* Four agenda items per topic, each with its own lines, so the conversation moves forward. */
const AGENDA = {
  'Budget review': [
    { item: 'the overall picture', lines: ['So this is the draft budget for next quarter.', 'Overall spend is flat, but the mix has shifted quite a bit.', 'We’re about {pct} percent under where we were this time last year.', 'Most of the savings came from vendor consolidation.', 'We found roughly {k} thousand by merging two of our tools.', 'The forecast assumes no big surprises, which is always brave.', 'I’d like everyone to sanity check their own lines by {day}.', 'Overall I think it’s a realistic plan.'] },
    { item: 'software and tools', lines: ['Software licences are the biggest jump, mostly from renewals.', 'Two tools went up in price with almost no warning.', 'We have {num} licences nobody has logged into for three months.', 'Can we cancel those, or are they tied to a contract?', 'I’ll check with procurement on the renewal dates.', 'We should push back on that price increase.', 'There might be a cheaper plan that covers what we use.', 'Let’s not switch tools mid-quarter, though.'] },
    { item: 'headcount', lines: ['Headcount is the one line we haven’t locked yet.', 'If we approve the two new roles, we’re roughly two percent over.', 'The second role could start next quarter instead.', 'That would bring us back under the limit.', 'The team is stretched, so I’d really like the first one now.', 'Could we use a contractor for a few months instead?', 'Contractors cost more per month, but there’s no long commitment.', 'Let’s model both options and decide next week.'] },
    { item: 'travel and events', lines: ['Travel is still capped at last year’s level.', 'I’d rather trim the events line than cut training.', 'The conference in spring is the one that really matters.', 'Can we send two people instead of four?', 'Virtual tickets are about a third of the price.', 'Team offsites stay, but we’ll keep them local.', 'Facilities costs dropped now that we gave up the second floor.', 'Anything under five thousand can stay with the team leads.'] }
  ],
  'Customer success': [
    { item: 'renewals', lines: ['Renewals this month are looking strong.', 'We’re at {pct} percent of the renewal target with a week to go.', 'Two larger accounts are still deciding.', 'One of them asked for a longer contract with a discount.', 'I think we can offer that if they commit to two years.', 'The other one is mostly worried about the price increase.', 'Let’s get them a call with product to show what’s coming.', 'I’ll update the renewal tracker after this.'] },
    { item: 'escalations', lines: ['We had two escalations last week, both resolved now.', 'The first was a billing mix-up on our side.', 'We refunded them and they were pretty gracious about it.', 'The second was a bug that support couldn’t reproduce at first.', 'Engineering found it on {day} and the fix is live.', 'I wrote up what happened so we can learn from it.', 'Support response times are under four hours on average.', 'That’s the best we’ve done all year.'] },
    { item: 'customer health', lines: ['Health scores for the enterprise group are mostly green.', 'Churn risk is mostly in the smaller plans.', 'Let’s flag the {num} accounts that haven’t logged in this month.', 'I’d like us to reach out before renewal, not after.', 'A quick check-in call usually does the trick.', 'Their main ask is better reporting.', 'The new help centre articles cut tickets by about ten percent.', 'The onboarding survey scores went up again.'] },
    { item: 'wins and stories', lines: ['They loved the training session we ran for their team.', 'Their admin sent a really nice note to {other}.', 'We should share that case study with sales.', 'They agreed to be a reference, which is huge.', 'One customer called us the best part of their week, which made my day.', 'I’ll put the quotes in the shared folder.', 'Let’s do a short write-up for the newsletter.', 'Great work, everyone. That’s a really good month.'] }
  ],
  'Engineering standup': [
    { item: 'yesterday and today', lines: ['Yesterday I finished the login refactor.', 'Today I’m picking up the flaky test in checkout.', 'I spent most of yesterday in code review, honestly.', 'Today I’m pairing with {other} on the caching bug.', 'I’m finishing the migration script this morning.', 'The settings screen is almost done. Just the edge cases left.', 'I’m out tomorrow afternoon, just a heads up.', 'Nothing exciting on my side. Steady progress.'] },
    { item: 'blockers', lines: ['No blockers on my side.', 'I’m blocked on the API keys for staging.', 'Who owns those now?', 'I can get you the keys right after this.', 'I’m still waiting on design for the empty states.', 'They said by {day}, so it should be fine.', 'The build has been slow all week.', 'Let’s look at the build times after standup.'] },
    { item: 'the release', lines: ['The deploy went out this morning without issues.', 'We saw a spike in errors last night, but it was a third party outage.', 'Performance on the dashboard page is much better now.', 'Load time dropped by about {pct} percent.', 'We should keep an eye on memory, though.', 'The next release is planned for {day}.', 'Let’s freeze the branch the day before.', 'I’ll write the release notes.'] },
    { item: 'reviews and housekeeping', lines: ['I’ve got a pull request up if anyone has time to review.', 'There are {num} reviews waiting longer than two days.', 'Let’s try to clear those today.', 'Can we keep this to fifteen minutes today?', 'Let’s take the database discussion offline.', 'I’ll set up a separate call for that.', 'Also, please update your tickets before the end of the day.', 'That’s it from me.'] }
  ],
  'Finance': [
    { item: 'the quarter at a glance', lines: ['Revenue came in slightly ahead of forecast.', 'Let me walk you through the quarter on one slide.', 'If you look at the third column, that’s year over year.', 'We’re up about {pct} percent compared to the same quarter last year.', 'Most of the growth came from existing customers.', 'New business was a little softer than we hoped.', 'Overall, a solid quarter.', 'Any questions on the headline numbers?'] },
    { item: 'margins and costs', lines: ['Gross margin held steady at around sixty percent.', 'Operating expenses were up, mostly from hiring.', 'Hosting costs grew faster than revenue, which we need to watch.', 'We’re renegotiating that contract next month.', 'Most of the variance is timing, not a real change.', 'Marketing spend landed right on budget.', 'Travel was well under, as expected.', 'I’d like every department to review their accruals.'] },
    { item: 'cash and collections', lines: ['Cash position is healthy, with about eighteen months of runway.', 'Receivables are taking longer to collect this quarter.', 'About {k} thousand is more than sixty days overdue.', 'Most of that is one customer who changed their payment system.', 'We’ve been in touch and they’ve promised to pay by {day}.', 'The currency swings hurt us in Europe.', 'We might look at hedging next year.', 'Nothing alarming, just something to keep an eye on.'] },
    { item: 'the outlook', lines: ['We’re revising the full year outlook upward a little.', 'The pipeline supports that, as long as two big deals close.', 'We’ll close the books by the tenth.', 'Audit prep starts next month.', 'Please send any open invoices to finance this week.', 'The board pack goes out next {day}.', 'I’ll share the slides after the call.', 'Any questions on the numbers before I move on?'] }
  ],
  'HR': [
    { item: 'the new policy', lines: ['Thanks for joining. This is a quick update on the new policy.', 'The hybrid schedule stays at three days in the office.', 'Teams can choose which days, as long as there’s some overlap.', 'We tried to keep it flexible on purpose.', 'If you have a special situation, talk to your manager first.', 'Managers will get a short guide before the rollout.', 'It takes effect on the first of next month.', 'The handbook will be updated by next week.'] },
    { item: 'benefits', lines: ['Open enrolment for benefits starts on the first.', 'The main change is a new dental provider.', 'Premiums stay the same for most plans.', 'Parental leave is going up to sixteen weeks.', 'We’re adding two extra wellness days this year.', 'You can use them whenever you like, no questions asked.', 'There’s a short video explaining everything on the intranet.', 'Please make your choices before the deadline.'] },
    { item: 'reviews and training', lines: ['Performance reviews move to twice a year.', 'The first round will be lighter than usual.', 'We want it to be a conversation, not a form.', 'Please complete the training module by the end of the month.', 'It takes about {num} minutes, I promise.', 'About {pct} percent of you have already done it, so thank you.', 'Managers will see who still needs to finish.', 'There’s a new course on giving feedback, too.'] },
    { item: 'questions', lines: ['There’s a question in the chat about contractors.', 'Nothing changes for contractors right now.', 'Someone asked about the holiday calendar.', 'The holiday calendar is already on the intranet.', 'If you have questions, the HR inbox is the best place.', 'We’ll hold office hours on {day} for anything that’s unclear.', 'We’re running a short survey on the onboarding experience.', 'Thanks for all the good questions.'] }
  ],
  'Leadership': [
    { item: 'the big picture', lines: ['Let’s start with the big picture.', 'Our top three priorities haven’t changed.', 'Customer feedback is the strongest it’s been all year.', 'Growth is on track, but it’s uneven across teams.', 'I want every team to own one clear goal for the quarter.', 'Let’s be honest about what we’re not going to do.', 'I’m worried we’re spreading ourselves too thin.', 'Focus is the theme for the next few months.'] },
    { item: 'hiring', lines: ['Hiring is slower than planned, and that’s the main risk.', 'We have {num} open roles that have been open for over two months.', 'The market is tough for senior engineers right now.', 'Could we look at more junior hires with good mentoring?', 'I like that, as long as we have the people to support them.', 'Referrals have been our best source by far.', 'Let’s boost the referral bonus for a quarter.', 'I’ll take that one to finance.'] },
    { item: 'the partnership decision', lines: ['We need a decision on the partnership by next week.', 'The upside is real, but so is the distraction.', 'They want an answer before their board meets.', 'I’d want a short trial before we sign anything long term.', 'Legal has some concerns about the data terms.', 'Who owns the follow-up on this?', 'Let’s revisit this in two weeks with data.', 'I’ll set up a call with their team.'] },
    { item: 'communication', lines: ['The board meeting is in three weeks.', 'I’d like a one-page summary from each team.', 'Let’s align on the message before it goes out company-wide.', 'People want to know where we’re headed, not every detail.', 'We should celebrate the launch. The team did great work.', 'Let’s do a proper shout-out at the town hall.', 'I’ll draft the update and share it by {day}.', 'Good discussion, everyone.'] }
  ],
  'Marketing': [
    { item: 'campaign results', lines: ['The campaign went live on Monday.', 'Click-through is well above our benchmark.', 'Paid social is doing better than search this time.', 'The video ad is our best performer by far.', 'It’s about {pct} percent ahead of the static version.', 'We’re seeing a lot of traffic from the newsletter.', 'The landing page conversion rate dipped a little on mobile.', 'Budget is about sixty percent spent.'] },
    { item: 'the website', lines: ['The new homepage is live on staging.', 'Load time on mobile still needs work.', 'Let’s A/B test the two headlines next week.', 'I prefer the shorter one, personally.', 'The signup form has too many fields.', 'Can we cut it to three?', 'I’ll ask the web team for an estimate.', 'Brand guidelines are updated in the shared drive.'] },
    { item: 'the webinar', lines: ['The webinar has over three hundred sign-ups.', 'That’s more than double last time.', 'We have two speakers confirmed and one maybe.', 'Rehearsal is on {day}.', 'I’d like sales to follow up on those leads within a day.', 'Can we send a reminder email the morning of?', 'Let’s keep the tone friendly but confident.', 'I’ll share the slide template today.'] },
    { item: 'next month', lines: ['The partner co-marketing piece goes out on the fifteenth.', 'We’re planning a small push around the product update.', 'I’d like to try a podcast sponsorship as a test.', 'It’s around {k} thousand for a month.', 'Let’s see the audience numbers before we commit.', 'Social content calendar is almost full.', 'We’ll share a full report at the end of the month.', 'Great work on this one, everyone.'] }
  ],
  'Product roadmap': [
    { item: 'what shipped', lines: ['Here’s what shipped in the last six weeks.', 'The new editor is out to everyone now.', 'Adoption is about {pct} percent of active users already.', 'Support tickets about it are lower than we expected.', 'The export feature got a lot of love on social.', 'We fixed {num} of the top ten reported bugs.', 'Not everything landed, but the big pieces did.', 'Huge thanks to the team for that.'] },
    { item: 'next quarter', lines: ['Here’s the roadmap for the next two quarters.', 'The top request from customers is still better search.', 'Reporting gets a full redesign this quarter.', 'We’re moving offline mode into Q2.', 'The beta for the mobile app starts next month.', 'Design has early mock-ups ready to share.', 'Let me pull those up.', 'This is still rough, so be kind.'] },
    { item: 'trade-offs', lines: ['We’re cutting two smaller features to make room.', 'I know that’s going to disappoint a few customers.', 'Engineering estimates about six weeks for search.', 'Let’s scope that before we commit to a date.', 'Integrations are a big ask from the enterprise side.', 'Could we do a lighter version first?', 'I want to validate this with {num} customers first.', 'Let’s not promise dates externally yet.'] },
    { item: 'research and feedback', lines: ['User research starts on {day}.', 'We’ll talk to customers on different plans.', 'I’d love a couple of volunteers to sit in.', 'It’s really eye-opening to hear them directly.', 'We’ll review the roadmap again after the research.', 'Any feedback on priorities, send it my way.', 'The roadmap doc is linked in the chat.', 'Comments are open until the end of the week.'] }
  ],
  'Sales': [
    { item: 'the number', lines: ['We’re at about eighty percent of target with three weeks left.', 'The east region is ahead, and the west is catching up.', 'New logos are strong, expansions a little behind.', 'I think we land at around a hundred and two percent.', 'That depends on two deals in legal right now.', 'Our win rate against competitors went up.', 'The new pricing page is helping with smaller deals.', 'Good momentum overall.'] },
    { item: 'big deals', lines: ['Two big deals are in legal review right now.', 'The first one is about {k} thousand a year.', 'They asked for a discount, but I held the line.', 'Their security team sent a forty page questionnaire.', 'I need help from product on one security question.', 'The demo yesterday went really well.', 'Their head of operations was the one asking all the questions.', 'I’m hopeful we close by {day}.'] },
    { item: 'pipeline', lines: ['Pipeline looks healthy for next quarter.', 'We have about three times coverage, which is where we want it.', 'Can marketing send more leads from the webinar?', 'The inbound quality has been really good lately.', 'Our renewals team flagged a few upsell chances.', 'Let’s focus on deals that can close this month.', 'I’ll update the forecast in the CRM tonight.', 'Please do the same before {day}.'] },
    { item: 'shout-outs', lines: ['Great work on the call yesterday, by the way.', '{other} turned that objection around really nicely.', 'The new hires are ramping faster than expected.', 'One of them closed their first deal last week.', 'Let’s share that call recording as an example.', 'Team lunch is on me if we hit the number.', 'No pressure, of course.', 'Thanks, everyone. Let’s finish strong.'] }
  ],
  'Town hall': [
    { item: 'welcome and news', lines: ['Welcome, everyone, and thanks for joining.', 'It’s been a big quarter, so let’s get into it.', 'First, a warm welcome to our new team members.', 'We have {num} new people this month alone.', 'Please say hi to them in the chat.', 'We hit our main goal two weeks early.', 'Customer numbers are up about twenty percent.', 'That’s a team effort, so thank you.'] },
    { item: 'team updates', lines: ['A huge thank you to the support team for a busy month.', 'Let’s give a shout-out to the launch team.', 'Engineering shipped more this quarter than any before.', 'Marketing’s webinar broke our sign-up record.', 'Sales had their best month of the year.', 'And finance closed the books a day early, which never happens.', 'The new office opens in the spring.', 'There will be a proper party, I promise.'] },
    { item: 'what’s next', lines: ['Next quarter is about focus and quality.', 'We’re going to do fewer things, better.', 'Each team will share their goals by {day}.', 'We’re also improving the onboarding for new hires.', 'Please fill out the engagement survey this week.', 'It really does shape what we do.', 'Last year’s survey is why we added the wellness days.', 'So your answers matter.'] },
    { item: 'questions', lines: ['We’ll leave time for questions at the end.', 'There’s a question in the chat about remote work.', 'Nothing is changing with remote work this year.', 'Someone asked if the slides will be shared.', 'Slides will be shared after the meeting.', 'Another question about the holiday party.', 'Yes, it’s happening, and yes, there will be food.', 'Thanks again, everyone. Have a great rest of your day.'] }
  ]
};

/* Everyday meeting lines that fit any topic. */
const MEETING_LINES = [
  'Okay, so where were we?', 'Let me share a bit of context first.', 'I think that makes sense, as long as we keep it simple.',
  'Can everyone see my screen? Just give me a thumbs up.', 'Let me pull that up real quick.',
  'Sorry, I was on mute. Can you hear me now?', 'Let’s park that and come back to it at the end.',
  'I don’t want to go too deep into the weeds here.', 'Does anyone have anything to add before we move on?',
  'I’ll drop the link in the chat.', 'So, long story short, we’re in a good place.', 'I’ll take that as an action item.',
  'Let’s make sure we capture that in the notes.', 'Sorry, someone’s at the door. One second.',
  'I can send a quick summary after this.', 'Sorry, my internet is a bit unstable today.', 'Can you see the spreadsheet now?',
  'It’s on the second tab.', 'Let me stop sharing for a second.', 'Okay, I’m back. Sorry about that.',
  'Can we get {other}’s view on this?', 'I think we’re mostly aligned.', 'Let’s not overthink it.',
  'Maybe we try it for a month and see.', 'I’ll check and confirm by {day}.', 'We’re running a bit behind, so let’s keep going.',
  'There’s a doc for this somewhere. I’ll find it.', 'The short version is that it’s on track.', 'I’ll keep this brief.'
];
/* Lines that answer the person who spoke before. Only used when someone new takes the floor. */
const REPLY_LINES = [
  'Sorry, go ahead.', 'No, you go first.', 'That’s a really good point, actually.', 'Just to build on what {other} said,',
  'I’m not sure I agree, but I see where you’re coming from.', 'Let me think about that and get back to you.',
  'Good question. I’ll follow up after the call.', 'Sorry, you cut out for a second there. Could you repeat that?',
  'Can you go back one slide?', 'Is that written down somewhere?', 'Just to make sure I understand, are we saying the deadline moves?',
  'We talked about this last week, right?', 'I might have missed this, but who owns it?', 'That’s fair.', 'I like that idea.',
  'I think {other} had a hand up.', 'Sorry, I was double muted. Could you say that again?', 'Totally agree with {other} on that.'
];
/* Short sounds people make while someone else is talking. */
const BACKCHANNEL = ['Mm-hmm.', 'Right.', 'Yeah.', 'Got it.', 'Makes sense.', 'Okay.', 'Agreed.', 'Sure.', 'Yep, that works.', 'Totally.', 'Oh, nice.'];

/* Light moments. Only used when the setting allows jokes and side-tracks. */
const JOKES = [
  [['A', 'Sorry, my cat just walked across the keyboard. If you got a message that says “jjjjjjjj”, that was her.'], ['B', '[laughter]'], ['C', 'Honestly, she makes a good point.']],
  [['A', 'I promise this is the last slide.'], ['B', 'You said that three slides ago.'], ['C', '[laughter]'], ['A', 'Okay, okay. Second to last.']],
  [['B', 'Sorry, I was talking on mute for about two minutes. It was a great speech, you missed out.'], ['A', '[laughter]'], ['H', 'Classic. Go again, we’re listening.']],
  [['C', 'Can everyone see my screen?'], ['A', 'We can see your desktop. Nice wallpaper, by the way.'], ['B', '[laughter]'], ['C', 'Oh no. Okay, one second.']],
  [['A', 'I think my internet is powered by a hamster today.'], ['B', 'Give the hamster a raise.'], ['C', '[laughter]']],
  [['B', 'This could have been an email.'], ['H', 'I heard that.'], ['B', 'Kidding! Mostly.'], ['A', '[laughter]']],
  [['C', 'Sorry, that was my kid asking if this is a real job.'], ['A', '[laughter]'], ['B', 'Some days I wonder too.']],
  [['A', 'Let’s circle back to that.'], ['B', 'We’ve circled back to it so many times it’s basically a roundabout.'], ['C', '[laughter]']],
  [['B', 'I’ll be quick.'], ['A', 'Famous last words.'], ['C', '[laughter]'], ['B', 'Fair. I’ll be medium.']],
  [['C', 'Is anyone else’s coffee already gone?'], ['A', 'I’m on my third.'], ['B', 'Third? It’s not even lunch.'], ['A', '[laughter] Don’t judge me.']]
];
/* Side-tracks: the meeting drifts for a moment, then gets back on track. */
const SIDE_TRACKS = [
  [['A', 'Quick question, is anyone else’s building doing fire drills this week?'], ['B', 'Yes! Ours went off right in the middle of a call yesterday.'], ['C', 'Ours is tomorrow. I’ve been warned.'], ['H', 'Okay, let’s get back to it before ours goes off too.']],
  [['B', 'Sorry, totally off topic, but {A}, is that a new background?'], ['A', 'Ha, yes. It’s supposed to be a beach in Portugal.'], ['B', 'Very relaxing. I’m jealous.'], ['H', 'Alright, back to the beach of work.']],
  [['C', 'Did everyone see the email about the office coffee machine?'], ['A', 'The fancy one? I heard it’s finally fixed.'], ['B', 'It makes a weird noise now, but the coffee is good.'], ['C', 'That’s all I ask.'], ['H', 'Anyway. Where were we?']],
  [['A', 'Random, but has anyone tried that new lunch place on the corner?'], ['C', 'Yes, the noodles are amazing.'], ['B', 'Adding it to my list.'], ['H', 'Okay, food talk after the call. Let’s keep going.']],
  [['B', 'Sorry, my neighbour is drilling. Can you hear that?'], ['A', 'A little, yeah.'], ['C', 'It sounds like a very ambitious project.'], ['B', 'He’s been at it for three weeks. I think he’s building a second house.'], ['H', '[laughter] Okay, let’s move on.']],
  [['C', 'Before I forget, it’s {other}’s birthday on {day}.'], ['A', 'Oh, happy early birthday!'], ['B', 'We should do something.'], ['C', 'Cake is non-negotiable.'], ['H', 'Agreed. Okay, back to the agenda.']],
  [['A', 'Is it just me or is the weather completely confused this week?'], ['B', 'Sun in the morning, rain at lunch, snow by dinner.'], ['C', 'I’ve given up and just carry everything.'], ['H', 'Okay, weather report done. Let’s keep moving.']],
  [['B', 'Totally unrelated, but did anyone else watch that new series everyone’s talking about?'], ['C', 'I’m two episodes in. No spoilers.'], ['A', 'My lips are sealed.'], ['H', 'Alright, let’s get back on track.']]
];
/* Now and then the host asks you something. You can't answer out loud, which is very realistic. */
const ASK_YOU = [
  [['H', '{you}, anything to add from your side?'], ['pause', 4500], ['H', 'I think {you} might be on mute. No worries, drop it in the chat if anything comes up.']],
  [['H', 'What do you think, {you}?'], ['pause', 4000], ['B', 'I think {you} froze for a second.'], ['H', 'Okay, we can come back to that.']]
];

/* The last few minutes: wrapping up, goodbyes, and the host ending the meeting. */
/* The host's closing: time check, recap of the agenda, action items, next meeting, last questions. */
const WRAP_START = ['Okay, we’re almost at time, so let’s start wrapping up.', 'I’m conscious of time, so let’s wrap up here.', 'We’ve got a few minutes left, so let me sum up.'];
const RECAP = ['Quick recap. Today we covered {items}.', 'So, to sum up, we went through {items}.', 'Just to recap, we talked about {items}.'];
/* Action items by topic. {other} is someone in the call. */
const ACTION_ITEMS = {
  'Budget review': ['{other} will model both headcount options by {day}.', 'Procurement checks the renewal dates on those unused licences.', 'Everyone reviews their own budget lines before sign-off on Friday.'],
  'Customer success': ['{other} sets up check-ins with the quiet accounts.', 'We share the new case study with sales this week.', 'The renewal tracker gets updated today.'],
  'Engineering standup': ['{other} gets the staging keys sorted right after this.', 'Let’s clear the old pull requests by the end of the day.', 'Separate call for the database question.'],
  'Finance': ['Every department reviews their accruals by {day}.', '{other} follows up on the overdue invoice.', 'I’ll send the slides and the board pack draft.'],
  'HR': ['Managers share the guide with their teams this week.', 'Please finish the training module by the end of the month.', 'Office hours are on {day} for any questions.'],
  'Leadership': ['Each team sends a one-page summary by {day}.', '{other} takes the referral bonus idea to finance.', 'I’ll set up the call with the partner’s team.'],
  'Marketing': ['{other} asks the web team for an estimate on the signup form.', 'Sales follows up on the webinar leads within a day.', 'We decide on the podcast test once we see the audience numbers.'],
  'Product roadmap': ['{other} finds customers for the research sessions.', 'Comments on the roadmap doc are open until Friday.', 'No dates go out externally yet.'],
  'Sales': ['Everyone updates the forecast before {day}.', '{other} gets the security answers from product.', 'Let’s share that call recording with the new hires.'],
  'Town hall': ['Slides go out after the meeting.', 'Please fill out the engagement survey this week.', 'Teams share their goals by {day}.']
};
const ACTIONS_GENERIC = ['{other} will follow up on the open questions.', 'I’ll send the notes and action items after this.', 'Let’s check progress at the next meeting.'];
const WRAP_END = ['Same time next week, everyone.', 'I’ll send the summary to everyone after this.', 'Anything else before we wrap?'];
const WRAP_REPLIES = ['Nothing from me.', 'All good here.', 'No, I think we covered it.', 'Just a quick thank you for organising.', 'Nope, that was really helpful.'];
const GOODBYES = ['Thanks, everyone!', 'Thanks, bye!', 'Have a good one.', 'See you next week.', 'Thanks, all. Talk soon.', 'Bye, everyone!', 'Thank you, take care.'];
const HOST_CLOSING = ['Great, thanks so much, everyone. I’ll end the meeting here.', 'Thanks, everyone. I’m going to end it now. Have a great day.'];

/* Fill the slots in a line. */
function fillSlots(line, names) {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  return line
    .replace(/\{other\}/g, () => names.other || 'everyone')
    .replace(/\{you\}/g, () => names.you || '')
    .replace(/\{num\}/g, () => pick(['two', 'three', 'four', 'five', 'six']))
    .replace(/\{pct\}/g, () => pick(['eight', 'twelve', 'fifteen', 'eighteen', 'twenty', 'twenty-five', 'thirty']))
    .replace(/\{k\}/g, () => pick(['twenty', 'thirty-five', 'forty', 'sixty', 'eighty', 'a hundred and twenty']))
    .replace(/\{day\}/g, () => pick(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']));
}
