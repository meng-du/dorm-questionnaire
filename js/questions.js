var time_instr = {past_q:
    ['For the following questions, please think back to the time period before the transition to remote learning ' +
     'at UCLA (before people started leaving campus/before in-person classes were suspended)'],
    current_q:
    ['For the following questions, please consider the people you interact with now (during physical ' +
    'distancing/COVID-19 pandemic)']}
var roster_questions = {past_q: [
    'Consider the people you liked to spend your free time with. Before UCLA’s transition to remote learning, ' +
    'who were the people you socialized with most often? (Examples: ate meals with, hung out with, studied with, ' +
    'spent time with.)',
    'Whose messages (such as texts, group messages) or social media posts did you see often?',
    'People often want to be more like other people because of their personality traits or characteristics, ' +
    'for example: sense of humor, interests, lifestyle, knowledge, being likable, kindness.<br><br>Who did <i>you</i> ' +
    'want to be more like (in these or other ways), even if you were not friends with them?'
], current_q: [
    'Consider the people you like to spend your free time with. Since the transition to remote learning, ' +
    'who are the people you\'ve socialized with <strong>in person</strong> most often? (Examples: eat meals with, ' +
    'hang out with, study with, spent time with.)',
    'Consider the people you like to spend your free time with. Since the transition to remote learning, ' +
    'who are the people you\'ve <strong>virtually</strong> socialized with most often? (Examples: eat meals with, ' +
    'hang out with, study with, spend time with).',
    'Whose messages (such as texts, group messages) or social media posts do you see often?',
    'People often want to be more like other people because of their personality traits or characteristics, ' +
    'for example: sense of humor, interests, lifestyle, knowledge, being likable, kindness.<br><br>Who do <i>you</i> ' +
    'want to be more like (in these or other ways), even if you were not friends with them?',
]};
var person_questions = {past_q: [
    'How often did you interact with <strong>*</strong>, either in person or online?',
    'How close did you feel to <strong>*</strong>?',
    'How far away did you live to <strong>*</strong>?',
    'How long have you known <strong>*</strong>?'
], current_q: [
    'How close do you feel to <strong>*</strong>?',
    'How far away did you live from <strong>*</strong> <u>before</u> physical distancing?',
    'How far away do you live from <strong>*</strong> now (during physical distancing)?',
    'How long have you known <strong>*</strong>?',
    'How often do you socially interact with <strong>*</strong> <strong>1-on-1</strong> through ...',
    '... 1-on-1 video chat (Zoom, FaceTime, etc.) or phone call?<span hidden>*</span>',
    '... 1-on-1 text messaging (iMessage, private message on GroupMe, WhatsApp, etc.)?<span hidden>*</span>',
    '... 1-on-1 on social media (direct messages on Facebook, Instagram, TikTok, etc.)?<span hidden>*</span>',
    '... other ways (specify)?<span hidden>*</span> ' +'<input type="text" id="other-txt1" class="form-control" style="width:100%" ' +
         'placeholder="For example, video games, games over video chat"/>',
    'How often do you socially interact with <strong>*</strong> <strong>in a group setting</strong> through ...',
    '... group conference call or group video chat (Zoom, FaceTime, etc.)?<span hidden>*</span>',
    '... group text or group messaging (iMessage, GroupMe, WhatsApp, etc.)?<span hidden>*</span>',
    '... social media (group messages on Facebook, Instagram, TikTok, etc.)?<span hidden>*</span>',
    '... other ways (specify)?<span hidden>*</span> ' +'<input type="text" id="other-txt2" class="form-control" style="width:100%" ' +
         'placeholder="For example, video games, games over video chat"/>'
]};
var friend_questions = {past_q: [
    'Were these pairs of people connected with each other?<br><br>' +
    'Please choose "connected" if they socialized with each other regularly, or "not connected" otherwise.'],
    current_q: ['Are these pairs of people connected with each other?<br><br>' +
                'Please choose "connected" if they socialize with each other regularly, or "not connected" otherwise.']};
var payment_question = {questions: ['Thank you for completing the survey! Would you like to be paid through Bruincard or cash?']};
var freq_slider = {
    step: 1, min: 1, max: 5, value: 0,
    ticks: [1, 2, 3, 4, 5],
    ticks_labels: ['Once a month or less',
                   'A few times a month',
                   'Once a week',
                   'Multiple times a week',
                   'At least once a day'],
}
var slider_configs = {past_q: [{
    step: 1, min: 1, max: 5, value: 0,
    ticks: [1, 2, 3, 4, 5],
    ticks_labels: ['Less than once a week',
                   'About once a week',
                   '2-3 times a week',
                   '4-5 times a week',
                   'Almost everyday'],
}, {
    step: 1, min: 1, max: 4, value: 0,
    ticks: [1, 2, 3, 4],
    ticks_labels: ['Not very close',
                   'Somewhat close',
                   'Very close',
                   'Extremely close'],
}, {
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
}, {
    step: 1, min: 1, max: 5, value: 0,
    ticks: [1, 2, 3, 4, 5],
    ticks_labels: ['Less than 1 month',
                   'Since the start of the school year (fall 2019)',
                   'About 1 year',
                   'A few years',
                   'More than 5 years'],
}], current_q: [{
    step: 1, min: 1, max: 4, value: 0,
    ticks: [1, 2, 3, 4],
    ticks_labels: ['Not very close',
                   'Somewhat close',
                   'Very close',
                   'Extremely close'],
}, {
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
}, {
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
}, {
    step: 1, min: 1, max: 5, value: 0,
    ticks: [1, 2, 3, 4, 5],
    ticks_labels: ['Less than 1 month',
                   'Since the start of the school year (fall 2019)',
                   'About 1 year',
                   'A few years',
                   'More than 5 years'],
}, {}, freq_slider, freq_slider, freq_slider, freq_slider,
{}, freq_slider, freq_slider, freq_slider, freq_slider]};
var question_texts = [{past_q: {}}, time_instr, roster_questions, person_questions, friend_questions, payment_question];

// constants
var NAME_GEN_PAGE = 2;
