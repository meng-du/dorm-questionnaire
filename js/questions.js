var roster_questions = {questions: [
    'Consider the people you like to spend your free time with. Since you arrived at UCLA, who are the people ' +
    'you\'ve socialized with most often? (examples: eat meals with, hang out with, study with, spend time with.)',
    'Whose social media posts or messages (such as texts, group messages) do you see often?',
    'People often want to be more like other people because of their personality traits or characteristics, ' +
    'for example: sense of humor, interests, lifestyle, knowledge, being likable, kindness.<br>Who do <i>you</i> ' +
    'want to be more like (in these or other ways), even if you are not friends with them?',
]}
var tie_questions = {questions: [
    'How much time do you spend with <strong>*</strong>?',
    'How close do you feel to <strong>*</strong>?',
]};
var friend_questions = {questions: ['Are these pairs of people friends with each other?']};
var slider_configs = [{
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
}];
var question_texts = [{questions: []}, roster_questions, tie_questions, friend_questions];
