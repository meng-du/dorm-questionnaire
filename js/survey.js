'use strict';
var hookWindow = false;

jQuery(document).ready(function() {
    var DB_ROSTER_NAME = 'test';
    var FRIEND_PAIRS_PER_PAGE = 15;
    $('.page').hide();
    var page_i = 0;
    var question_i = 0;
    var named_people = new Set([]);  // everyone named in roster-based questions

    // prevent closing window
    window.onbeforeunload = function() {
        if (hookWindow) {
            return 'Do you want to leave this page? Your progress will not be saved.';
        }
    }

    // shuffle array
    function shuffle(a) {
        if (a.length < 2) { return; }
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            let temp = a[i];
            a[i] = a[j];
            a[j] = temp;
        }
    }

    // PARSE PARAMETERS

    var parameters = window.location.search.substring(1).split(/[&=]/);
    var survey_id = parameters[1];
    var dorm_wing = parameters[3];
    if (!survey_id || !dorm_wing) {
        alert('This URL is invalid. Please contact the experimenters.');
        return;
    }

    // FIREBASE

    // initialize Firebase
    var firebaseConfig = {
        apiKey: 'AIzaSyBvPWLV2yjapJKblBLcfkVbpZC3cXtM0PU',
        authDomain: 'dorm-network.firebaseapp.com',
        databaseURL: 'https://dorm-network.firebaseio.com',
        projectId: 'dorm-network',
        storageBucket: '',
        messagingSenderId: '804230274072',
        appId: '1:804230274072:web:dd26c12bba4f85e64df76d'
    };
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();

    // get roster
    db.collection('roster').doc(DB_ROSTER_NAME).get().then((doc) => {
        var roster = doc.data()[dorm_wing];
        // success
        // set up roster options for the first few questions
        for (let name of roster) {
            $('.roster-select').append('<option>' + name + '</option>');
        }
        $('.roster-select').chosen().trigger("chosen:updated");
        $('#p' + page_i).show();

        $('#slider').slider('refresh'); // TODO
        $('.question-text').html(question_texts[page_i].questions[question_i]);

        let space = $('.chosen-drop').height() ? $('.chosen-drop').height() + 40 : 40
        $('#roster-add').css('margin-top', space + 'px');
    })
    .catch(function(error) {
        // error
        alert('Failed to access database, please check ' +
              'your internet connection and try again.\n' + error);
        console.log(error);
    });

    // ROSTER BASED QUESTIONS

    // set up roster based question with Chosen
    $('.roster-select').on('chosen:ready', function(ev, args) {
        // always show placeholder
        let sender = args.chosen;
        sender.search_field.attr('placeholder', sender.default_text);
    }).chosen({placeholder_text_multiple: 'Search here...'});
    // always show the option list
    $('.roster-select').trigger('chosen:open');
    $('.chosen-search-input').blur();

    // set up Add button
    $('#btn-roster-add').click((e) => {
        var new_name = $('#input-roster-add').val();
        if (new_name.length == 0) {
            return;
        }
        $('#select-roster').append('<option selected>' + new_name + '</option>');
        $('#select-roster').chosen().trigger("chosen:updated");
        $('#select-roster').trigger('change');
        $('#input-roster-add').val('');  // clear input
    });

    // enable/disable Next button based on input change
    $('.roster-select').change((e) => {
        if ($(e.target).val().length > 0) {
            $('#btn-next').removeClass('disabled');
        } else {
            $('#btn-next').addClass('disabled');
        }
    });

    // set up checkbox for no answer
    $('#check-no-selection').change((e) => {
        if ($(e.target).prop('checked')) {
            $('#roster-wrapper').hide();
            $('#roster-add').hide();
            $('#btn-next').removeClass('disabled');
        } else {
            $('#roster-wrapper').show();
            $('#roster-add').show();
            if ($('#select-roster').val().length == 0) {
                $('#btn-next').addClass('disabled');
            }
        }
    });

    // reset
    function roster_q_onfinish(next_q_text) {
        var data = $('#select-roster').val();
        named_people = new Set([...data, ...named_people])  // append to set
        // TODO save data (to firebase?)

        if (next_q_text) {
            $('#check-no-selection').prop('checked', false);
            $('#check-no-selection').trigger('change');
            $('.roster-select').val([]).trigger("chosen:updated");
            $('#btn-next').addClass('disabled');
        }
    }

    // TIE STRENGTH QUESTIONS

    // tick label rotation
    var slider_config_i = 0;
    $('#slider').slider(slider_configs[slider_config_i]);
    function rotate_labels(num_labels) {
        // reset
        $('.slider-tick-label').css('transform', '');
        $('.slider-tick-label-container').css('transform', '');
        // calculate
        var body_width = $('body').width();
        var rotation = 0;
        if (num_labels >= 5) {
            rotation = 32 - body_width / 30;
            rotation = (body_width < 480) ? (144 - body_width * 4 / 15) : rotation;
        } else {
            rotation = 54 - body_width / 10;
            rotation = (body_width < 380) ? (320 - body_width * 4 / 5) : rotation;
        }
        rotation = rotation > 45 ? 90 : rotation;
        // rotate
        if (rotation >= 3) {
            $('.slider-tick-label').css('transform', 'rotate(' + rotation + 'deg)');
            if (rotation > 30) {
                let translate = rotation == 90 ? 18 : 10;
                translate += num_labels < 5 ? 8 : 0;
                $('.slider-tick-label-container').css('transform', 'translateY(' + translate + 'px)');
            }
        }
    }
    rotate_labels(slider_configs[slider_config_i]['ticks'].length);

    // initialize to unselected css
    $('.label-is-selection').css('font-weight', '400');
    $('.slider-handle').css('background-image',
                            'linear-gradient(to bottom,#ccc 0,#eee 100%)');
    // slider on change/on click
    function slider_onclick(ev) {
        $('#btn-next').removeClass('disabled');
        // remove unselected css
        $('.label-is-selection').css('font-weight', '');
        $('.slider-handle').css('background-image', '');
    }
    $("#slider").on('slideStop change', slider_onclick);

    // replace * in question with user input names
    function tie_q_prepare() {
        console.log(named_people);
        if (named_people.size < 1) {
            return [];
        }
        var q_with_names = [];
        for (let q of tie_questions.questions) {
            let this_q_with_names = [];
            for (let name of named_people) {
                this_q_with_names.push(q.replace('*', name));
            }
            shuffle(this_q_with_names);
            q_with_names.push(...this_q_with_names);
        }
        return q_with_names;
    }

    // reset
    function tie_q_onfinish(next_q_text) {
        var data = $('#slider').val();
        var question = $('.question-text').get(0).textContent;
        // TODO save data

        if (!next_q_text) {
            return;
        }
        if (question.substr(0, 15) != next_q_text.substr(0, 15)) {
            // changing question, changing slider labels
            ++slider_config_i;
            $('#slider').slider('destroy');
            $('#slider').slider(slider_configs[slider_config_i]);
            $("#slider").on('slideStop change', slider_onclick);
            rotate_labels(slider_configs[slider_config_i]['ticks'].length);
        }
        // reset slider value and color
        $('#slider').val(1);
        $('#slider').slider('refresh');
        $('.label-is-selection').css('font-weight', '400');
        $('.slider-handle').css('background-image',
                                'linear-gradient(to bottom,#ccc 0,#eee 100%)');
        $('#btn-next').addClass('disabled');
    }

    // FRIENDSHIP QUESTIONS

    // replace * in question with user input names
    function friend_q_prepare() {
        if (named_people.length < 2) {
            return [];
        }
        return [];
    }

    // set up switch
    $('.multi-switch').multiSwitch({
        functionOnChange: (elt) => {
            let label = elt.parentsUntil('#pairs-container', '.row').find('.switch-label');
            if (elt.val() == 0) {
                label.text('Not friends');
                label.css('color', '#d1513f');
            } else {
                label.text('Friends');
                label.css('color', '#46a35e');
            }
        }
    });

    // NEXT BUTTON

    var q_onfinish_funcs = [roster_q_onfinish, tie_q_onfinish];

    $('#btn-next').click((e) => {
        if ($('#btn-next').hasClass('disabled')) {
            return;
        }
        // proceed
        if (question_i < question_texts[page_i].questions.length - 1) {
            // next question
            ++question_i;
            q_onfinish_funcs[page_i](question_texts[page_i].questions[question_i]);  // reset question
            $('.question-text').html(question_texts[page_i].questions[question_i]);
        } else {
            // submit data
            q_onfinish_funcs[page_i](question_texts[page_i].questions[question_i]);
            // next page
            $('#p' + page_i).hide();
            if (page_i == 0) {
                tie_questions.questions = tie_q_prepare();
                friend_questions.questions = friend_q_prepare();
                console.log(tie_questions, friend_questions);
                console.log(question_texts);
            }
            question_i = 0;
            while (page_i < $('.page').length - 1) {
                ++page_i;
                if (question_texts[page_i].questions.length > 0) {
                    $('.question-text').html(question_texts[page_i].questions[question_i]);
                    $('#p' + page_i).show();
                    if (page_i == 1) {
                        $('#slider').slider('refresh');  //TODO
                    }
                    return;
                }
            }
            if (page_i == $('.page').length) {
                $('#btn-next').hide();
                alert('DONE');
            }
        }
    });


    // hookWindow = true;
    var startTime = new Date();
});
