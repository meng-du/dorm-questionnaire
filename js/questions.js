var roster_questions = [  // page 1
    'Consider the people you like to spend your free time with. Who are the people you\'ve socialized with most often? ' +
    '(Examples: eat meals with, hang out with, study with, spent time with.)',

    'Who do you work with most often or go to for academic support? ' +
    '(Examples: go to class with, work on homework sets together, study for tests together, do projects together).',

    'Whom do you share good news with?',

    'Who would you talk to if something bad or upsetting happened to you?',

    'Who makes you feel supported and cared for?',

    'Who usually makes you feel positive (e.g., happy, enthusiastic)?',

    'Whose social media posts or messages (such as texts, group messages) or social media posts do you see most often?'
];
var tie_strength_questions = [  // page 2
    'How close do you feel to <strong>*</strong>?',
    'How often do you interact with <strong>*</strong>, either <u>in person or online</u>?'
];
var freq_slider = {
    step: 1, min: 1, max: 6, value: 0,
    ticks: [1, 2, 3, 4, 5, 6],
    ticks_labels: ['Never',
                   'Less than once a week',
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
var slider_configs = [freq_slider, close_slider];

var likert_questions = {questions:[  // page 3
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
var question_texts = [roster_questions, tie_strength_questions, likert_questions, payment_question];

// constants
var ROSTER_PAGE = 0;
