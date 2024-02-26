'use strict';

var roster_questions = [  // page 1
    'Consider the people you like to spend your free time with. Who are the people you socialize with most often? ' +
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
    'How close do you feel to the following people?',
    'How often do you interact with the following people, either <u>in person, calling/texting, or online</u>?'
];
var close_slider = {
    step: 1, min: 1, max: 4, value: 0,
    ticks: [1, 2, 3, 4],
    ticks_labels: ['Not very close',
                   'Somewhat close',
                   'Very close',
                   'Extremely close'],
}
var freq_slider = {
    step: 1, min: 1, max: 5, value: 0,
    ticks: [1, 2, 3, 4, 5],
    ticks_labels: ['Never',
                   'About once a week or less',
                   '2-3 times a week',
                   '4-5 times a week',
                   'Almost everyday or more'],
};
var tie_strength_slider_configs = [close_slider, freq_slider];

var likert_questions = {questions:[  // page 3
    'Please indicate how often each of the statements below is descriptive of you.',
    'Below are statements people often use to describe themselves. ' +
    'Please use the scale below to indicate the degree to which these statements accurately describe you. ' +
    'There are no right or wrong answers.',
    'Please indicate whether you agree or disagree with the following statements.',
    'I see myself as:'
], slider_texts: [[
    'I lack companionship.',
    'There is no one I can turn to.',
    'I am an outgoing person.',
    'I feel left out.',
    'I feel isolated from others.',
    'I can find companionship when I want it.',
    'I am unhappy being so withdrawn.',
    'People are around me but not with me.'
],[
    'I view challenging situations as an opportunity to grow and learn.',
    'I seek out situations where it is likely that I will have to think in depth about something.',
    'I enjoy learning about subjects that are unfamiliar to me.',
    'I find it fascinating to learn new information.',
    'Thinking about solutions to difficult conceptual problems can keep me awake at night.',
    'I can spend hours on a single problem because I just can\'t rest without knowing the answer.',
    'I feel frustrated if I can\'t figure out the solution to a problem, so I work even harder to solve it.',
    'I work relentlessly at problems that I feel must be solved.',
    'The smallest doubt can stop me from seeking out new experiences.',
    'I cannot handle the stress that comes from entering uncertain situations.',
    'I find it hard to explore new places when I lack confidence in my abilities.',
    'It is difficult to concentrate when there is a possibility that I will be taken by surprise.',
    'Risk-taking is exciting to me.',
    'When I have free time, I want to do things that are a little scary.',
    'Creating an adventure as I go is much more appealing than a planned adventure.',
    'I prefer friends who are excitingly unpredictable.',
    'I ask a lot of questions to figure out what interests other people.',
    'When talking to someone who is excited, I am curious to find out why.',
    'When talking to someone, I try to discover interesting details about them.',
    'I like finding out why people behave the way they do.',
    'When other people are having a conversation, I like to find out what it\'s about.',
    'When around other people, I like listening to their conversations.',
    'When people quarrel, I like to know what\'s going on.',
    'I seek out information about the private lives of people in my life.'
],
[
    'I find it hard to imitate the behavior of other people.',
    'At parties and social gatherings, I do not attempt to do or say things that others will like.',
    'I can only argue for ideas which I already believe.',
    'I can make impromptu speeches even on topics about which I have almost no information.',
    'I guess I put on a show to impress or entertain others.',
    'I would probably make a good actor. ',
    'In a group of people, I am rarely the center of attention.',
    'In different situations and with different people, I often act like very different persons.',
    'I am not particularly good at making other people like me.',
    'I\'m not always the person I appear to be.',
    'I would not change my opinions (or the way I do things) in order to please someone or win their favor.',
    'I have considered being an entertainer.',
    'I have never been good at games like charades or improvisational acting.',
    'I have trouble changing my behavior to suit different people and different situations.',
    'At a party I let others keep the jokes and stories going.',
    'I feel a bit awkward in public and do not show up quite as well as I should.',
    'I can look anyone in the eye and tell a lie with a straight face (if for a right end).',
    'I may deceive people by being friendly when I really dislike them.'
],
[
    'Extraverted, enthusiastic.',
    'Critical, quarrelsome.',
    'Dependable, self-disciplined.',
    'Anxious, easily upset.',
    'Open to new experiences, complex.',
    'Reserved, quiet.',
    'Sympathetic, warm.',
    'Disorganized, careless.',
    'Calm, emotionally stable.',
    'Conventional, uncreative.'
]
], sliders: [{
    step: 1, min: 1, max: 4, value: 0,
    ticks: [1, 2, 3, 4],
    ticks_labels: ['Never',
                   'Rarely',
                   'Sometimes',
                   'Often'],
}, {
    step: 1, min: 1, max: 7, value: 0,
    ticks: [1, 2, 3, 4, 5, 6, 7],
    ticks_labels: ['Does not describe me at all',
                   'Barely describes me',
                   'Somewhat describes me',
                   'Neutral',
                   'Generally describes me',
                   'Mostly describes me',
                   'Completely describes me'],
}, {
    step: 1, min: 1, max: 2, value: 0,
    ticks: [1, 2],
    ticks_labels: ['True',
                   'False'],
}, {
    step: 1, min: 1, max: 7, value: 0,
    ticks: [1, 2, 3, 4, 5, 6, 7],
    ticks_labels: ['Disagree strongly',
                   'Disagree moderately',
                   'Disagree a little',
                   'Neither agree or disagree',
                   'Agree a little',
                   'Agree moderately',
                   'Agree strongly'],
}]};
var payment_question = ['Thank you for completing the survey! How would you like to be paid?'];
var question_texts = [{}, roster_questions, tie_strength_questions, likert_questions, {}, payment_question];

// constants
var ROSTER_PAGE = 1;
