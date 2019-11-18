'use strict';
var hookWindow = false;

jQuery(document).ready(function() {
    var DB_ROSTER_NAME = 'test';
    var DB_DATA_COLLECTION = 'test_data';
    var FRIEND_PAIRS_PER_PAGE = 15;
    $('.page').hide();
    $('#end').hide();
    $('#invalid').hide();
    var page_i = 0;
    var question_i = 0;
    var pair_i = 0;
    var named_people = new Set([]);  // everyone named in roster-based questions
    var data = {};

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
        var roster = doc.data()[dorm_wing].sort();
        // success
        // set up roster options for the first few questions
        for (let name of roster) {
            $('.roster-select').append('<option>' + name + '</option>');
        }
        $('.roster-select').chosen().trigger("chosen:updated");
        $('#p' + page_i).show();
    })
    .catch(function(error) {
        // error
        alert('Failed to access database, please check ' +
              'your internet connection and try again.\n' + error);
        location.reload();  // refresh page
        console.log(error);
    });

    // send data
    function save2firebase(data, q_key=-1) {
        q_key = q_key == -1 ? question_i : q_key;
        let db_key = page_i + '.' + q_key;
        db.collection(DB_DATA_COLLECTION).doc(survey_id).update({ [db_key]: data })
        .catch(function(error) {
            // error
            alert('Failed to save your data. Please check your internet connection and try again.\nIf this message shows up multiple times, please contact the experimenters.\n' + error);
            location.reload();  // refresh page
            console.log(error);
        });
    }

    // DEMOGRAPHIC QUESTIONS

    $('#country').hide();

    // set up checkbox for international zipcode
    $('#international-check').change((e) => {
        if ($(e.target).prop('checked')) {
            $('#country').show();
            $('#country').prop('required', true);
            $('#zipcode').get(0).setCustomValidity('');
        } else {
            $('#country').hide();
            $('#country').prop('required', false);
            if (! /^([0-9]{5})$/.test($('#zipcode').val())) {
                $('#zipcode').get(0).setCustomValidity('Please enter a 5-digit zipcode');
            } else {
                $('#zipcode').get(0).setCustomValidity('');
            }
        }
    });

    $('#zipcode').change(() => {
        if ($('#international-check').is(':checked')) {
            $('#zipcode').get(0).setCustomValidity('');
        } else if (! /^([0-9]{5})$/.test($('#zipcode').val())) {
            $('#zipcode').get(0).setCustomValidity('Please enter a 5-digit zipcode');
        } else {
            $('#zipcode').get(0).setCustomValidity('');
        }
    });

    function demographic_onfinish() {
        if (! $('#demographic').get(0).reportValidity()) {
            return false;
        }

        data[page_i] = {
            'other_name': $('#other-name').val(),
            major: $('#major').val(),
            zipcode: $('#zipcode').val(),
            country: $('#international-check').is(':checked') ? $('#country').val() : 'US',
            timestamp: Date.now()
        }

        save2firebase(data[page_i]);

        $('#btn-next').addClass('disabled');
        return true;
    }

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

    // set up instructions to include wing
    $('#scroll-instr').text($('#scroll-instr').text() + '2' + dorm_wing[0].toUpperCase());

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
            $('#scroll-instr').hide();
            $('#roster-wrapper').hide();
            $('#roster-add').hide();
            $('#btn-next').removeClass('disabled');
        } else {
            $('#scroll-instr').show();
            $('#roster-wrapper').show();
            $('#roster-add').show();
            if ($('#select-roster').val().length == 0) {
                $('#btn-next').addClass('disabled');
            }
        }
    });

    // data & reset
    function roster_q_onfinish(next_q_text) {
        let names = $('#select-roster').val();
        named_people = new Set([...names, ...named_people])  // append to set

        // save to firebase
        if (!data.hasOwnProperty(page_i)) {
            data[page_i] = {};
        }
        data[page_i][question_i] = {
            question: $('.question-text').get(0).textContent,
            response: names,
            timestamp: Date.now()
        };
        save2firebase(data[page_i][question_i]);

        // next question
        if (next_q_text) {
            $('#check-no-selection').prop('checked', false);
            $('#check-no-selection').trigger('change');
            $('.roster-select').val([]).trigger("chosen:updated");
            $('#btn-next').addClass('disabled');
        }
        return true;
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
                let add_margin = rotation == 90 ? 9 : 6;
                $('#slider-wrapper').css('margin-bottom', add_margin + 'rem');
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
        if (named_people.size < 1) {
            tie_questions.questions = [];
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
        tie_questions.questions = q_with_names;
    }

    // data & reset
    function tie_q_onfinish(next_q_text) {
        let response = $('#slider').val();
        let question = $('.question-text').get(0).textContent;

        // save data
        let person = $('.question-text').html().split('>')[1].split('<')[0];
        let q = $('.question-text').html().split(' ')[1]
        let key = (q == 'close' ? 'close' : 'time') + ' - ' + person;

        save2firebase({
            question: question,
            response: response,
            response_text: $('.label-is-selection').text(),
            timestamp: Date.now()
        }, key);

        // next question
        if (!next_q_text) {
            return true;
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

        return true;
    }

    // FRIENDSHIP QUESTIONS

    // add a row to to pair container
    function append_pair_html(pair) {
        let row = $('<li>', { class: 'row justify-content-end' });
        row.append($('<div>', {
            class: 'col-6-auto',
            html: pair
        }));
        row.append($('<div>', { class: 'col-3 switch-label' }));
        let switch_warpper = $('<div>', { class: 'switch-wrapper' });
        switch_warpper.append($('<input>', {
            type: 'checkbox',
            class: 'multi-switch',
            'initial-value': 2,
            'unchecked-value': 0,
            'checked-value': 1,
            value: 2
        }));
        row.append(switch_warpper);
        $('#pairs-container').append(row);
    }

    // get pairs from named people and initialize the first batch of questions
    function friend_q_prepare() {
        if (named_people.length < 2) {
            friend_questions.questions = [];
        }
        // get pairs
        friend_questions.pairs = [];
        named_people = Array.from(named_people);
        shuffle(named_people);
        for (let i = 0; i < named_people.length - 1; ++i) {
            for (let j = i + 1; j < named_people.length; ++j) {
                let pair = named_people[i] + ' <strong>&</strong> ' + named_people[j];
                friend_questions.pairs.push(pair);
            }
        }
        // duplicate questions
        let new_q = [];
        let num_repeat = Math.ceil(friend_questions.pairs.length / FRIEND_PAIRS_PER_PAGE);
        for (let q of friend_questions.questions) {
            new_q.push(...Array.apply(null, Array(num_repeat)).map(_ => q));
        }
        friend_questions.questions = new_q;
        // set up html rows of pairs
        let pair_i_end = pair_i + FRIEND_PAIRS_PER_PAGE;
        for (; (pair_i < friend_questions.pairs.length) && (pair_i < pair_i_end); ++pair_i) {
            append_pair_html(friend_questions.pairs[pair_i]);
        }
        switch_setup();
    }

    // set up switches
    function switch_setup() {
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
                // check if all answered
                var unanswered = 0;
                $('input.multi-switch').each((i, elt) => {
                    unanswered += $(elt).val() == 2 ? 1 : 0;
                });
                if (unanswered == 0) {
                    $('#btn-next').removeClass('disabled');
                }
            }
        });
    }

    // data & reset
    function friend_q_onfinish() {
        // save data
        $('#pairs-container .row').each((i, elm) => {
            let pair = $(elm).children('.col-6-auto').html().split(' <strong>&amp;</strong> ');

            let key = [pair[0], pair[1]].sort().join('&');
            save2firebase({
                '0': pair[0],
                '1': pair[1],
                response: $(elm).find('input').val() == '0' ? 'n' : 'y',
                timestamp: Date.now()
            }, key);
        });

        // next question
        $('#pairs-container').html('');
        let pair_i_end = pair_i + FRIEND_PAIRS_PER_PAGE;
        for (; (pair_i < friend_questions.pairs.length) && (pair_i < pair_i_end); ++pair_i) {
            append_pair_html(friend_questions.pairs[pair_i]);
        }
        $('#btn-next').addClass('disabled');

        switch_setup();

        return true;
    }

    // NEXT BUTTON

    var q_onfinish_funcs = [demographic_onfinish, roster_q_onfinish, tie_q_onfinish, friend_q_onfinish];

    $('#btn-next').click((e) => {
        if ($('#btn-next').hasClass('disabled')) {
            $('#invalid').show();
            setTimeout(() => {
                $('#invalid').hide();
            }, 5000);
            return;
        }
        // proceed
        if (question_i < question_texts[page_i].questions.length - 1) {
            // add public figure instructions for non-first questions
            if (question_i == 0 && page_i == 1) {
                let instr = $('#add-instr').text().slice(0, -1) + ' (public figures don\'t count):';
                $('#add-instr').text(instr);
            }
            // next question
            q_onfinish_funcs[page_i](question_texts[page_i].questions[question_i + 1]);  // reset question
            ++question_i;
            $('.question-text').html(question_texts[page_i].questions[question_i]);
            if ((page_i == $('.page').length - 2) &&
                (question_i == question_texts[page_i].questions.length - 1)) {
                // last page, last question
                $('#btn-next').text('Finish');
            }
        } else {
            // submit data
            let result = q_onfinish_funcs[page_i](question_texts[page_i].questions[question_i]);
            if (!result) {
                return;
            }
            // prepare subsequent questions
            $('#p' + page_i).hide();
            if (page_i == 1) {
                tie_q_prepare();
                friend_q_prepare();
            }
            // next page
            question_i = 0;
            while (page_i < $('.page').length - 2) {
                ++page_i;
                if (question_texts[page_i].questions.length > 0) {
                    $('.question-text').html(question_texts[page_i].questions[question_i]);
                    $('#p' + page_i).show();
                    if (page_i == 1) {
                        // add space between i and ii
                        let space = $('.chosen-drop').height() ? $('.chosen-drop').height() + 40 : 40
                        $('#roster-add').css('margin-top', space + 'px');
                    }
                    if (page_i == 2) {
                        $('#slider').slider('refresh');
                    }
                    if ((page_i == $('.page').length - 2) &&
                        (question_i == question_texts[page_i].questions.length - 1)) {
                        // last page, last question
                        $('#btn-next').text('Finish');
                    }
                    return;
                }
            }
            if (page_i == $('.page').length - 2) {
                $('#btn-next').hide();
                $('#end').show();
                hookWindow = false;
            }
        }
    });

    // hookWindow = true;
    var startTime = new Date();
});
