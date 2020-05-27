var time_instr = {past_q:
    ['For the following question, please think back to <u>before</u> the "safer at home" policy was implemented in ' +
    'mid-March ("<span class="precovid">pre-COVID</span>").'],
    current_q:
    ['For the following questions, please consider the time <u>since</u> the "safer at home" policy was implemented in ' +
    'mid-March ("<span class="duringcovid">during-COVID</span>").<br><br>Please consider all people that you interact ' +
    'with <span class="duringcovid">during-COVID</span>, even if you have already listed them earlier in the survey.']};
var roster_questions = {initial: [
    'Whose messages (such as texts, group messages) or social media posts do you see often?',
    'People often want to be more like other people because of their personality traits or characteristics, ' +
    'for example: sense of humor, interests, lifestyle, knowledge, being likable, kindness.<br><br>Who do <i>you</i> ' +
    'want to be more like (in these or other ways), even if you are not friends with them?'
], past_q: [
    'Consider the people you liked to spend your free time with. <span class="precovid"><i>Pre-COVID</i></span>, ' +
    'who were the people you socialized with most often? (Examples: ate meals with, hung out with, studied with, ' +
    'spent time with.)'
], current_q: [
    'Consider the people you like to spend your free time with. <span class="duringcovid"><i>During-COVID</i></span>, ' +
    'who are the people you\'ve socialized with <strong>in person</strong> most often? (Examples: eat meals with, ' +
    'hang out with, study with, spent time with.)<br><br>Please include all people that you socialize with now, even if ' +
    'you have already listed them earlier in the survey.',
    'Consider the people you like to spend your free time with. <span class="duringcovid"><i>During-COVID</i></span>, ' +
    'who are the people you\'ve <strong>virtually</strong> socialized with most often? (Examples: virtually spend time ' +
    'with, hang out with, study with).<br><br>Please include all people that you socialize with now, even if you have ' +
    'already listed them earlier in the survey.'
]};
var person_questions = {past_q: [
    '<span class="precovid"><i>Pre-COVID</i></span>, how often did you interact with <strong>*</strong>, ' +
    'either in person or online?',
    '<span class="duringcovid"><i>During-COVID (since the "safer at home" policy was implemented)</i></span>, ' +
    'how often do you interact with <strong>*</strong>, either in person or online?',
    '<span class="precovid"><i>Pre-COVID</i></span>, how close did you feel to <strong>*</strong>?',
    '<span class="duringcovid"><i>During-COVID</i></span>, how close do you feel to <strong>*</strong>?',
    'How far away did you live to <strong>*</strong> <span class="precovid"><i>pre-COVID</i></span>?',
    'How far away do you live to <strong>*</strong> now (<span class="duringcovid"><i>during-COVID</i></span>)?',
    'How long have you known <strong>*</strong>?',
], current_q: [
    '<span class="precovid"><i>Pre-COVID</i></span>, how often did you interact with <strong>*</strong>, ' +
    'either in person or online?',
    '<span class="duringcovid"><i>During-COVID</i></span>, how often do you interact with <strong>*</strong>, ' +
    'either in person or online?',
    '<span class="precovid"><i>Pre-COVID</i></span>, how close did you feel to <strong>*</strong>?',
    '<span class="duringcovid"><i>During-COVID</i></span>, how close do you feel to <strong>*</strong>?',
    'How far away did you live to <strong>*</strong> <span class="precovid"><i>pre-COVID</i></span>?',
    'How far away do you live to <strong>*</strong> now (<span class="duringcovid"><i>during-COVID</i></span>)?',
    'How long have you known <strong>*</strong>?',

    '<span class="duringcovid"><i>During-COVID</i></span>, how often do you socially interact with <strong>*</strong> <u>1-on-1</u> through ...',
    '... 1-on-1 video chat (Zoom, FaceTime, etc.) or phone call?<span hidden>*</span>',
    '... 1-on-1 text messaging (iMessage, private message on GroupMe, WhatsApp, etc.) or 1-on-1 messages on social media ' +
    '(direct messages on Facebook, Instagram, TikTok, etc.)?<span hidden>*</span>',
    '... 1-on-1 in-person (face-to-face)?<span hidden>*</span>',
    '... other ways (specify)?<span hidden>*</span> ' +'<input type="text" id="other-txt1" class="form-control" style="width:100%" ' +
         'placeholder="For example, video games, games over video chat"/>',
    '<span class="duringcovid"><i>During-COVID</i></span>, how often do you socially interact with <strong>*</strong> <u>in a group setting</u> through ...',
    '... group conference call or group video chat (Zoom, FaceTime, etc.)?<span hidden>*</span>',
    '... group text messaging (iMessage, group message on Groupme, WhatsApp, etc.) or group messages on social media ' +
    '(group on Facebook, Instagram, TikTok, etc.)?<span hidden>*</span>',
    '... in-person (face-to-face) in a group setting?<span hidden>*</span>',
    '... other ways (specify)?<span hidden>*</span> ' +'<input type="text" id="other-txt2" class="form-control" style="width:100%" ' +
         'placeholder="For example, video games, games over video chat"/>'
], followup: [
    '<span class="duringcovid"><i>During-COVID</i></span>, how often do you socially interact with <strong>*</strong> <u>1-on-1</u> through ...',
    '... 1-on-1 video chat (Zoom, FaceTime, etc.) or phone call?<span hidden>*</span>',
    '... 1-on-1 text messaging (iMessage, private message on GroupMe, WhatsApp, etc.) or 1-on-1 messages on social media ' +
    '(direct messages on Facebook, Instagram, TikTok, etc.)?<span hidden>*</span>',
    '... 1-on-1 in-person (face-to-face)?<span hidden>*</span>',
    '... other ways (specify)?<span hidden>*</span> ' +'<input type="text" id="other-txt1" class="form-control" style="width:100%" ' +
         'placeholder="For example, video games, games over video chat"/>',
    '<span class="duringcovid"><i>During-COVID</i></span>, how often do you socially interact with <strong>*</strong> <u>in a group setting</u> through ...',
    '... group conference call or group video chat (Zoom, FaceTime, etc.)?<span hidden>*</span>',
    '... group text messaging (iMessage, group message on Groupme, WhatsApp, etc.) or group messages on social media ' +
    '(group on Facebook, Instagram, TikTok, etc.)?<span hidden>*</span>',
    '... in-person (face-to-face) in a group setting?<span hidden>*</span>',
    '... other ways (specify)?<span hidden>*</span> ' +'<input type="text" id="other-txt2" class="form-control" style="width:100%" ' +
         'placeholder="For example, video games, games over video chat"/>'
]};
var freq_slider1 = {
    step: 1, min: 1, max: 5, value: 0,
    ticks: [1, 2, 3, 4, 5],
    ticks_labels: ['Less than once a week',
                   'About once a week',
                   '2-3 times a week',
                   '4-5 times a week',
                   'Almost everyday'],
};
var close_slider = {
    step: 1, min: 1, max: 4, value: 0,
    ticks: [1, 2, 3, 4],
    ticks_labels: ['Not very close',
                   'Somewhat close',
                   'Very close',
                   'Extremely close'],
}
var dist_slider = {
    step: 1, min: 1, max: 8, value: 0,
    ticks: [1, 2, 3, 4, 5, 6, 7, 8],
    ticks_labels: ['Roommate/same house',
                   'Same building (but not roommates)',
                   'Same neighborhood',
                   'Same city',
                   'Same state (different city)',
                   'Same country (different state)',
                   'Different country (same continent)',
                   'Different continent'],
};
var time_slider = {
    step: 1, min: 1, max: 5, value: 0,
    ticks: [1, 2, 3, 4, 5],
    ticks_labels: ['Less than 1 month',
                   'Since the start of the school year (fall 2019)',
                   'About 1 year',
                   'A few years',
                   'More than 5 years'],
};
var freq_slider2 = {
    step: 1, min: 1, max: 5, value: 0,
    ticks: [1, 2, 3, 4, 5],
    ticks_labels: ['Once a month or less',
                   'A few times a month',
                   'Once a week',
                   'Multiple times a week',
                   'At least once a day'],
}
var slider_configs = {past_q: [freq_slider1, freq_slider1, close_slider, close_slider,
                               dist_slider, dist_slider, time_slider],
                      current_q: [freq_slider1, freq_slider1, close_slider, close_slider,
                                  dist_slider, dist_slider, time_slider,
                                  {}, freq_slider2, freq_slider2, freq_slider2, freq_slider2,
                                  {}, freq_slider2, freq_slider2, freq_slider2, freq_slider2]};

var friend_questions = {past_q: [
    'Were these pairs of people connected with each other <span class="precovid"><i>pre-COVID</i></span>?<br><br>' +
    'Please choose "connected" if they have socialized with each other regularly, or "not connected" otherwise.'],
    current_q: []};
var attitude_questions = {questions:[
    'We are now interested in your thoughts and attitudes toward current events. Please indicate how much you agree or ' +
    'disagree with the following statements.',
    'Indicate how often each of the statements below is descriptive of you.',
    'How much do you agree with the following statements?<br><br>' +
    '<small>These questions ask about your attitudes and interpretations regarding some of the issues and behaviors that are ' +
    'common among college students. When questions ask about what kinds of behaviors or opinions seem “normal,” you can just ' +
    'consider college students in general as your reference point.</small>'
], slider_qs: [[
    'COVID-19 poses a large threat to me personally.',
    'COVID-19 poses a large threat to people in my immediate community, including my family, friends, and neighbors.',
    'The COVID-19 pandemic is likely to end by the summer, and life will soon return to normal.',
    'Having public places (e.g., parks, beaches) open right now is too risky.',
    'Having “non-essential” businesses (e.g., retail shops, gyms) open right now is too risky.'
],[
    'I lack companionship.',
    'There is no one I can turn to.',
    'I am an outgoing person.',
    'I feel left out.',
    'I feel isolated from others.',
    'I can find companionship when I want it.',
    'I am unhappy being so withdrawn.',
    'People are around me but not with me.'
],[
    'Traveling is an important way to learn about other cultures.',
    'It\'s important to get 6-8 hours of sleep every night.',
    'The primary goal of college is to get good grades and succeed academically.',
    'Being deceitful or tricking others is OK as long as it’s relatively harmless.',
    'Food production needs to be done more sustainably.',
    'It\'s normal for people to be concerned about climate change.',
    'It\'s normal for people to drink until they can’t remember.',
    'If someone believed they were having a mental breakdown, their first inclination should be to get professional attention.',
    'Most people do not do enough physical activity.',
    'It’s normal to eat a lot of junk food.',
    'College football should be banned.',
    'It\'s normal for people to vape nicotine.',
    'It\'s normal for people to get fewer than 6 hours of sleep per night.',
    'Vaping should only be allowed in certain public places.',
    'People should pursue whatever they’re interested in, no matter what others think.',
    'A person should work out his or her own problems; getting psychological counseling should be a last resort.',
    'People should always make time for exercise, no matter how busy they are.',
    'Vaping is risky to health.',
    'It\'s normal for people to pull an all-nighter (for studying or to have fun).',
    'It\'s important to get one\'s money\'s worth in the dining hall, even if it means eating too much or eating unhealthily.',
    'Global warming is an important problem.',
    'It\'s normal for people to be friends with people who disagree with them about important issues.',
    'It\'s normal for people to be hungover on weekends.',
    'People should keep track of the nutritional content of what they eat at every meal.',
    'It\'s normal for people to consume a lot of caffeine.',
    'College is a time to try something that you’ve never tried before.',
    'It\'s normal for people to vape in general (with or without nicotine).',
    'It\'s acceptable for people to skip classes without a valid excuse.',
    'College is an exciting time to make new friends and form new connections.'
]], sliders: [{
    step: 1, min: 1, max: 5, value: 0,
    ticks: [1, 2, 3, 4, 5],
    ticks_labels: ['Strongly disagree',
                   'Disagree',
                   'Neutral',
                   'Agree',
                   'Strongly agree'],
}, {
    step: 1, min: 1, max: 4, value: 0,
    ticks: [1, 2, 3, 4],
    ticks_labels: ['Never',
                   'Rarely',
                   'Sometimes',
                   'Often'],
}, {
    step: 1, min: 1, max: 5, value: 0,
    ticks: [1, 2, 3, 4, 5],
    ticks_labels: ['Strongly disagree',
                   'Disagree',
                   'Neutral',
                   'Agree',
                   'Strongly agree'],
}]};
var payment_question = {questions: ['Thank you for completing the survey! How would you like to be paid?']};
var question_texts = [{initial: {}}, time_instr, roster_questions, person_questions, friend_questions, attitude_questions, payment_question];

// constants
var NAME_GEN_PAGE = 2;
