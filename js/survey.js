'use strict';
var hookWindow = false;

jQuery(document).ready(function() {
    var DB_DATA_COLLECTION = 'test_data';
    var FRIEND_PAIRS_PER_PAGE = 15;
    $('.page').hide();
    $('#end').hide();
    $('.invalid').hide();
    $('#btn-prev').hide();
    $('#no-prev').hide();
    $('#instr-public').hide();
    var page_i = 0;
    var question_i = 0;
    var pair_i = 0;
    var data = {};
    for (let i in question_texts) {
        data[i] = {};  // initialize to empty
    }
    $('#p' + page_i).show();

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

    // +1 to # of completions
    function increase_completion_count() {
        db.collection('count').doc('count').update('count', firebase.firestore.FieldValue.increment(1));
    }

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

        return true;
    }

    // NAMING QUESTIONS

    // validator
    function validate_name(tag) {
        let valid = true;
        let fields = ['#dorm-names', '#outsider-names'];
        for (let i in fields) {
            let field = $(fields[i]);
            if (tag == field.val().trim()) {
                // test if using alphabets and spaces
                if (! /^[a-zA-Z]+\s+[a-zA-Z\s]*[a-zA-Z]+$/.test(tag)) {
                    field.get(0).setCustomValidity('Please enter one name at a time (first name last initial) with alphabets and spaces only');
                    field.get(0).reportValidity();
                    valid = false;
                } else {
                    field.get(0).setCustomValidity('');
                    field.get(0).reportValidity();
                }
                // test if repeated
                let repeat_other_field = $(fields[1 - i]).tagsManager('tags').indexOf(tag);
                if (field.tagsManager('tags').includes(tag) || repeat_other_field > -1) {
                    field.get(0).setCustomValidity('You have already entered this name. If you are entering different people with the same name, please add a descriptive term so that you can disambiguate them later (for example, Danial K artist, Danial K newYorkCity, Danial K chessClub, etc.).');
                    field.get(0).reportValidity();
                    if (repeat_other_field > -1) {
                        field.val('');
                        valid = false;
                        // blinks
                        $($(fields[1 - i] + '-container' + ' .tm-tag')[repeat_other_field]).stop()
                            .animate({ backgroundColor: '#d90000' }, 100)
                            .animate({ backgroundColor: '#ffc107' }, 100)
                            .animate({ backgroundColor: '#d90000' }, 100)
                            .animate({ backgroundColor: '#ffc107' }, 100)
                            .animate({ backgroundColor: '#d90000' }, 100)
                            .animate({ backgroundColor: '#ffc107' }, 100);
                    }
                } else if (valid) {
                    field.get(0).setCustomValidity('');
                    field.get(0).reportValidity();
                }
            }
        }
        if (valid) {
            $('.tm-tag').css('background-color', '');  // remove any blinked bg color
        }
        return valid;
    }

    // set up naming question
    // var name_typeahead_source = [];
    $('#dorm-names').tagsManager({
        deleteTagsOnBackspace: false,
        tagsContainer: '#dorm-names-container',
        blinkBGColor_1: '#d90000',
        blinkBGColor_2: '#ffc107',
        // typeahead: true,
        // typeaheadSource: name_typeahead_source,
        tagCloseIcon: '×',
        validator: validate_name
    });
    $('#outsider-names').tagsManager({
        deleteTagsOnBackspace: false,
        tagsContainer: '#outsider-names-container',
        blinkBGColor_1: '#d90000',
        blinkBGColor_2: '#ffc107',
        // typeahead: true,
        // typeaheadSource: name_typeahead_source,
        tagCloseIcon: '×',
        validator: validate_name
    });

    // "add" buttons
    $('#btn-dorm-add').click(() => {
        let name = $('#dorm-names').val();
        $('#dorm-names').tagsManager('pushTag', name);
        $('#dorm-names').val('');
    })
    $('#btn-outsider-add').click(() => {
        let name = $('#outsider-names').val();
        $('#outsider-names').tagsManager('pushTag', name);
        $('#outsider-names').val('');
    })

    // set up instructions to include wing
    $('#dorm-name-instr').text($('#dorm-name-instr').text() + '2' + dorm_wing[0].toUpperCase());

    // enable/disable next button
    function tag_onchange(e, tag) {
        let dorm_names = $('#dorm-names').tagsManager('tags');
        let outsider_names = $('#outsider-names').tagsManager('tags');
        if (dorm_names.length + outsider_names.length == 0) {
            $('#btn-next').addClass('disabled');
        } else {
            $('#btn-next').removeClass('disabled');
        }
    }
    $('.tm-input').on('tm:pushed', tag_onchange);
    $('.tm-input').on('tm:spliced', tag_onchange);
    $('input').change(() => {
        normal_next_btn();
        $('.invalid').hide();
    })

    // check if entered text but didn't add
    function check_entered_text() {
        for (let field of ['#dorm-names', '#outsider-names']) {
            if ($(field).val().length > 0) {
                $(field).get(0).setCustomValidity('You entered a name but did\'t add it. Please either add or remove it.');
                $(field).get(0).reportValidity();
                return false;
            }
        }
        return true;
    }

    // data & reset
    function roster_q_onfinish(next_q_text) {
        if (!check_entered_text()) {
            return false;
        }
        let dorm_names = $('#dorm-names').tagsManager('tags');
        let outsider_names = $('#outsider-names').tagsManager('tags');
        $('#dorm-names').val('');
        $('#outsider-names').val('');
        // name_typeahead_source.push(...dorm_names, ...outsider_names);

        // save to firebase
        data[page_i][question_i] = {
            question: $('.question-text').get(0).textContent,
            names_in_dorm: Object.assign([], dorm_names),
            names_outside: Object.assign([], outsider_names),
            timestamp: Date.now()
        };
        save2firebase(data[page_i][question_i]);

        // next question
        if (next_q_text) {
            $('#dorm-names').tagsManager('empty');
            $('#outsider-names').tagsManager('empty');
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
    function tie_q_prepare(named_people) {
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

        data[page_i][key] = {
            question: question,
            response: response,
            response_text: $('.label-is-selection').text(),
            timestamp: Date.now()
        }
        save2firebase(data[page_i][key], key);

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
    function friend_q_prepare(named_people) {
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
                    label.text('Not connected');
                    label.css('color', '#d1513f');
                } else {
                    label.text('Connected');
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
            data[page_i][key] = {
                '0': pair[0],
                '1': pair[1],
                response: $(elm).find('input').val() == '0' ? 'n' : 'y',
                timestamp: Date.now()
            }
            save2firebase(data[page_i][key], key);
        });

        // next question
        $('#pairs-container').html('');
        let pair_i_end = pair_i + FRIEND_PAIRS_PER_PAGE;
        for (; (pair_i < friend_questions.pairs.length) && (pair_i < pair_i_end); ++pair_i) {
            append_pair_html(friend_questions.pairs[pair_i]);
        }

        switch_setup();

        return true;
    }

    // PAYMENT QUESTION

    $('input[type=radio][name=payment]').change(() => {
        $('#btn-next').removeClass('disabled');
    });

    function payment_q_onfinish() {
        save2firebase({
            payment: $('input[name=payment]:checked', '#p4').val()
        });
        return true;
    }

    // PREVIOUS BUTTON

    function add_data() {
        // show previous data
        data[page_i][question_i].names_in_dorm.forEach(
            (tag) => $('#dorm-names').tagsManager('pushTag', tag)
        );
        data[page_i][question_i].names_outside.forEach(
            (tag) => $('#outsider-names').tagsManager('pushTag', tag)
        );
        if (data[page_i][question_i].names_in_dorm.length + data[page_i][question_i].names_outside.length == 0) {
            $('#btn-next').addClass('disabled');
        }
    }

    $('#btn-prev').click((e) => {
        if ($('#btn-prev').hasClass('disabled')) {
            return;
        }
        // save current data
        let result = q_onfinish_funcs[page_i](question_texts[page_i].questions[question_i - 1]);
        if (!result) {
            return;
        }

        // go back to previous question
        --question_i;
        $('.question-text').html(question_texts[page_i].questions[question_i]);
        add_data();

        // first question
        if (page_i == 1 && question_i == 0) {
            // remove the public figure wording
            $('#instr-public').hide();
            // remove prev button
            $('#btn-prev').hide();
        }
        $('.invalid').hide();
        normal_next_btn();
        $('#no-prev').hide();
    });

    // NEXT BUTTON

    var q_onfinish_funcs = [demographic_onfinish, roster_q_onfinish, tie_q_onfinish,
                            friend_q_onfinish, payment_q_onfinish];

    function normal_next_btn() {
        $('#btn-next').text('Next');
        $('#btn-next').removeClass('btn-warning');
        $('#btn-next').removeClass('btn-sm');
    }

    $('#btn-next').click((e) => {
        if (page_i == 1 && !check_entered_text()) {
            return;  // entered text but didn't add for naming question
        }
        // no answer
        if ($('#btn-next').hasClass('disabled')) {
            if (page_i == 1) {
                $('#invalid1').show();
                $('#btn-next').text('Yes, I can\'t think of anyone that fits this question');
                $('#btn-next').addClass('btn-warning');
                $('#btn-next').addClass('btn-sm');
                $('#btn-next').removeClass('disabled');
            } else {
                $('#invalid2').show();
                setTimeout(() => {
                    $('#invalid2').hide();
                }, 5000);
            }
            return;
        }
        // submit data
        let result = q_onfinish_funcs[page_i](question_texts[page_i].questions[question_i]);
        if (!result) {
            return;
        }
        // proceed
        if (question_i < question_texts[page_i].questions.length - 1) {
            // add public figure instructions for non-first naming questions
            if (page_i == 1 && question_i == 0) {
                $('#instr-public').show();
            }

            // next question
            ++question_i;
            $('.question-text').html(question_texts[page_i].questions[question_i]);

            // roster last question
            if (page_i == 1 && question_i == question_texts[page_i].questions.length - 1) {
                $('#no-prev').show();
            }

            // add data if there is any
            if (page_i == 1 && data[page_i].hasOwnProperty(question_i)) {
                add_data();
            } else {
                $('#btn-next').addClass('disabled');
            }
        } else {
            $('#btn-next').addClass('disabled');
            $('#p' + page_i).hide();
            // prepare subsequent questions
            if (page_i == 1) {
                // get all named people
                var named_people = new Set([]);
                for (let q_i in data[1]) {
                    let dorm_names = [];
                    data[1][q_i].names_in_dorm.forEach(
                        (tag) => dorm_names.push(tag + ' (2' + dorm_wing[0].toUpperCase() + ')')
                    );
                    named_people = new Set([...dorm_names,
                                            ...data[1][q_i].names_outside,
                                            ...named_people])  // append to set
                }
                tie_q_prepare(named_people);
                friend_q_prepare(named_people);
            }
            // next page
            question_i = 0;
            let done = false;
            while (page_i < $('.page').length - 1) {
                ++page_i;
                if (page_i == 2) {
                    $('#btn-prev').hide();
                    $('#no-prev').hide();
                }
                if (page_i == 4) {
                    $('#btn-next').text('Confirm');
                    increase_completion_count(); // completed + 1
                }
                if (question_texts[page_i].questions.length > 0) {
                    $('.question-text').html(question_texts[page_i].questions[question_i]);
                    $('#p' + page_i).show();
                    if (page_i == 2) {
                        $('#slider').slider('refresh');
                    }
                    done = true;
                    break;
                }
            }
            if ((!done) && page_i == $('.page').length - 1) {
                // show end page
                hookWindow = false;
                window.location.replace('progress.html?completed=' + survey_id.split('.')[0]);
            }
        }
        // hide warning
        $('.invalid').hide();
        normal_next_btn();
        // show previous button
        if (page_i == 1 && question_i > 0) {
            $('#btn-prev').show();
        }
        // last page last question, change button text
        if ((page_i == $('.page').length - 2) &&
            (question_i == question_texts[page_i].questions.length - 1)) {
            $('#btn-next').text('Finish');
        }
    });

    // hookWindow = true;
});
