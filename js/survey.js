'use strict';
window.hookWindow = false;

jQuery(document).ready(function() {
    $('.page').hide();
    $('#end').hide();
    $('.invalid').hide();
    $('#btn-prev').hide();
    $('#no-prev').hide();
    var page_i = 0;
    var question_i = 0;
    window.page_i = page_i;
    window.question_i = question_i;
    var roster_data = {};
    var all_names = {in_dorm: new Set(), outside: new Set([])};
    var skip_check = false;

    // prevent closing window
    window.onbeforeunload = function() {
        if (window.hookWindow) {
            return 'Do you want to leave this page? You may lose your progress.';
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
    var likert_length = parseInt(parameters[5]);
    likert_questions = likert_questions.slice(0, likert_length);
    question_texts[3] = likert_questions;

    // PROGRESS BAR
    var prog_bar = new ProgressBar.Line('#prog-bar', { color: '#ffc107' });

    function push_names(names_in_dorm, names_outside) {
        all_names.in_dorm = new Set([...names_in_dorm, ...all_names.in_dorm]);
        all_names.outside = new Set([...names_outside, ...all_names.outside])
    }

    function load_progress(user_data) {
        if (!user_data || !('progress' in user_data)) {
            $('#p' + page_i).show();
            console.log('No existing progress.');
            return;
        }
        let prog = user_data.progress.split('.');
        page_i = parseInt(prog[0]);
        question_i = parseInt(prog[1]);
        skip_check = true;
        if (page_i == 0 || page_i > 2) {
            $('#btn-next').click();
            $('#p' + page_i).show();
            if (page_i == 3) {
                // $('.slide').slider('refresh');
            }
            return;
        }
        // load roster data for page 1 or 2
        console.log(Object.keys(user_data).sort());  // TODO test
        for (let t of Object.keys(user_data).sort()) { // sort so that new data overwrites old data
            if (t.length < 13) {
                continue;
            }
            for (let i = 0; i < roster_questions.length; i++) {
                let key = '1.' + i.toString();
                if (key in user_data[t]) {
                    roster_data[i] = {
                        names_in_dorm: user_data[t][key]['names_in_dorm'],
                        names_outside: user_data[t][key]['names_outside']
                    };
                }
            }
        }
        for (let q_i in roster_data) {
            push_names(roster_data[q_i]['names_in_dorm'], roster_data[q_i]['names_outside']);
        }
        if (page_i == ROSTER_PAGE && question_i == roster_questions.length - 1) {
            question_i -= 1;  // go back to show the last roster question in case it hasn't been answered
        }
        $('#btn-next').click();
        $('#p' + page_i).show();
        if (page_i == 2) {
            // $('.slide').slider('refresh');
        }
    }
    window.get_user_progress(load_progress);


    // ----- NICKNAME -----

    function nickname_onfinish() {
        window.save2firebase({
            'other_name': $('#other-name').val(),
            timestamp: Date.now()
        }, page_i, question_i);

        return true;
    }


    // ----- ROSTER QUESTIONS -----
    function check_duplicate(name1, name2) {
        let dist = window.levenshtein(name1, name2);
        if ((dist <= 1) || (dist / name1.length < 0.25)) {
            return true;
        }
        return false;
    }
    function check_duplicate_against_list(name, namelist) {
        for (let n of namelist) {
            if (check_duplicate(name, n)) {
                return n;
            }
        }
        return false;
    }
    function check_duplicate_against_exist_names(name, types=['in_dorm', 'outside'], allow_repeat=false) {
        for (let type of types) {
            for (let n of all_names[type]) {
                if (allow_repeat && name == n) {
                    continue;
                } else if (check_duplicate(name, n)) {
                    return n;
                }
            }
        }
        return false;
    }

    // validator
    function validate_name(tag) {
        let valid = true;
        let fields = ['#dorm-names', '#outsider-names'];
        for (let i in fields) {
            let field = $(fields[i]);
            if (tag == name_to_title_case(field.val())) {
                // test if using valid characters
                if (! /^[a-zA-Z-]+\s+[a-zA-Z-'\s]*[a-zA-Z-]+$/.test(tag)) {
                    field.get(0).setCustomValidity('Please enter first and last name, one name at a time, with alphabets, spaces, hyphens and apostrophes only');
                    field.get(0).reportValidity();
                    valid = false;
                }
                // test if repeating names on the same page
                let repeat_this_field = field.tagsManager('tags').indexOf(tag);
                let repeat_other_field = $(fields[1 - i]).tagsManager('tags').indexOf(tag);
                let blink = false;
                let rep = false;
                if (repeat_this_field > -1) {
                    blink = $(fields[i] + '-container' + ' .tm-tag')[repeat_this_field];
                } else if (repeat_other_field > -1) {
                    blink = $(fields[1 - i] + '-container' + ' .tm-tag')[repeat_other_field];
                } else {
                    // test for similar names on the same page
                    rep = check_duplicate_against_list(tag, field.tagsManager('tags'));
                    if (rep) {
                        blink = $(fields[i] + '-container' + ' .tm-tag')[field.tagsManager('tags').indexOf(rep)];
                    } else {
                        rep = check_duplicate_against_list(tag, $(fields[1 - i]).tagsManager('tags'));
                        if (rep) {
                            blink = $(fields[1 - i] + '-container' + ' .tm-tag')[$(fields[1 - i]).tagsManager('tags').indexOf(rep)];
                        }
                    }
                }
                if (blink) {  // blinks
                    valid = false;
                    $(blink).stop()
                        .animate({ backgroundColor: '#d90000' }, 100)
                        .animate({ backgroundColor: '#ffc107' }, 100)
                        .animate({ backgroundColor: '#d90000' }, 100)
                        .animate({ backgroundColor: '#ffc107' }, 100)
                        .animate({ backgroundColor: '#d90000' }, 100)
                        .animate({ backgroundColor: '#ffc107' }, 100);
                }
                // test if repeating saved names
                let msg_where = '';
                if (!rep) {
                    rep = check_duplicate_against_exist_names(tag, [['in_dorm', 'outside'][i]], true);   // forbid similar names in the same field
                    msg_where = rep ? ['in', 'outside'][i] : '';
                }
                if (!rep) {
                    rep = check_duplicate_against_exist_names(tag, [['in_dorm', 'outside'][1 - i]], false);  // forbid repeating or similar names in the other
                    msg_where = rep ? ['in', 'outside'][1 - i] : '';
                }
                if (rep) {
                    field.get(0).setCustomValidity('You have already entered this name or a similar name (' + rep + ') ' + msg_where +
                        ' your wing of Hedrick. If you are entering different people with the same name, please add a descriptive term (e.g., Daniel Kim artist).');
                    field.get(0).reportValidity();
                    valid = false;
                }
                if (valid) {
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
    $('#dorm-names').tagsManager({
        deleteTagsOnBackspace: false,
        CapitalizeFirstLetter: true,
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
        CapitalizeFirstLetter: true,
        tagsContainer: '#outsider-names-container',
        blinkBGColor_1: '#d90000',
        blinkBGColor_2: '#ffc107',
        // typeahead: true,
        // typeaheadSource: name_typeahead_source,
        tagCloseIcon: '×',
        validator: validate_name
    });

    // "add" buttons
    $('#btn-dorm-add').on('click', () => {
        let name = $('#dorm-names').val();
        $('#dorm-names').tagsManager('pushTag', name);
    });
    $('#btn-outsider-add').on('click', () => {
        let name = $('#outsider-names').val();
        $('#outsider-names').tagsManager('pushTag', name);
    });

    $('#dorm-names').on('tm:pushed',(e, tag) => {
        all_names.in_dorm.add(tag);
    });
    $('#outsider-names').on('tm:pushed',(e, tag) => {
        all_names.outside.add(tag);
    });
    $('#dorm-names').on('tm:spliced',(e, tag) => {
        all_names.in_dorm.delete(tag);
    });
    $('#outsider-names').on('tm:spliced',(e, tag) => {
        all_names.outside.delete(tag);
    });

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
    });

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

    function name_to_title_case(name) {
        let str = name.trim().toLowerCase().split(/([-' ])/);  // split at space/hyphen/apostrophe
        for (let i = 0; i < str.length; i++) {
            str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
        }
        return str.join('');
    }

    function list_to_title_case(str_list) {
        let new_list = [];
        for (let s of str_list) {
            new_list.push(name_to_title_case(s));
        }
        return new_list;
    }

    // data & reset
    function roster_onfinish() {
        if (!check_entered_text()) {
            return false;
        }
        let dorm_names = list_to_title_case($('#dorm-names').tagsManager('tags'));
        let outsider_names = list_to_title_case($('#outsider-names').tagsManager('tags'));
        $('#dorm-names').val('');
        $('#outsider-names').val('');
        // name_typeahead_source.push(...dorm_names, ...outsider_names);

        // save to firebase
        roster_data[question_i] = {
            question: $('#p' + ROSTER_PAGE + ' .question-text').get(0).textContent,
            names_in_dorm: Object.assign([], dorm_names),
            names_outside: Object.assign([], outsider_names),
            timestamp: Date.now()
        };
        window.save2firebase(roster_data[question_i], page_i, question_i);

        // next question
        $('#dorm-names').tagsManager('empty');
        $('#outsider-names').tagsManager('empty');
        return true;
    }

    // ----- TIE STRENGTH QUESTIONS -----

    var slider_clicks = [];  // 0: required unselected, 1: required selected
                             // 10: optional unselected, 11: optional selected
    var slider_times = [];

    function slider_onclick(ev) {  // slider on change/on click
        let parent = $(ev.target).parent().attr('id');
        let index = parent.substring(14);  // last chars of parent id
        if (slider_clicks[index] % 10 == 0) {
            slider_clicks[index] += 1;
        }
        slider_times[index] = Date.now();
        if (slider_clicks.every((elt) => {return elt > 0;})) {  // 1/10/11
            $('#btn-next').removeClass('disabled');
        }
        // remove unselected css
        $('#' + parent + ' .label-is-selection').css('font-weight', '');
        $('#' + parent + ' .slider-handle').css('background-image', '');
    }

    function rotate_labels(wrapper, num_labels) {  // tick label rotation
        // reset
        $(wrapper + ' .slider-tick-label').css('transform', '');
        $(wrapper + ' .slider-tick-label-container').css('transform', '');
        // calculate
        var body_width = $('body').width();
        var rotation = 0;
        if (num_labels > 5) {
            rotation = 50 - body_width / 20;
            rotation = (body_width < 500) ? (150 - body_width / 4): rotation;
            rotation = (body_width < 500) ? (150 - body_width / 4): rotation;
            rotation = (rotation < 9) ? 9 : rotation;
        } else if (num_labels == 5) {
            rotation = 45 - body_width / 30;
            rotation = (body_width < 480) ? (144 - body_width * 4 / 15) : rotation;
        } else {
            rotation = 54 - body_width / 10;
            rotation = (body_width < 380) ? (320 - body_width * 4 / 5) : rotation;
        }
        rotation = rotation > 45 ? 90 : rotation;
        // rotate
        if (rotation >= 5) {
            $(wrapper + ' .slider-tick-label').css('transform', 'rotate(' + rotation + 'deg)');
            if (rotation > 30) {
                let translate = rotation == 90 ? 18 : 10;
                translate += num_labels < 5 ? 8 : 0;
                $(wrapper + ' .slider-tick-label-container').css('transform', 'translateY(' + translate + 'px)');
                let add_margin = rotation == 90 ? 10 : 8;
                $(wrapper).css('margin-bottom', add_margin + 'rem');
            }
        }
    }

    function create_slider(elt, wrapper, config, orientation, required=true) {
        $(elt).slider(config);
        if (orientation == 'vertical') {
            $(wrapper + ' .slider').css('height', config.max * 1.4 + 'rem');
        } else {
            rotate_labels(wrapper, config['ticks'].length);
        }
        // $(elt).slider('refresh');

        // initialize to unselected css
        $('.label-is-selection').css('font-weight', '400');
        $('.slider-handle').css('background-image',
                                'linear-gradient(to bottom,#ccc 0,#eee 100%)');
        // clicks
        $(elt).on('slideStop change', slider_onclick);
        slider_clicks.push(required ? 0 : 10);
        slider_times.push(-1);
    }

    function append_sliders(div, questions, slider_config, orient='horizontal') {
        // reset
        $(div).empty();
        slider_clicks = [];
        slider_times = [];

        let slider_i = -1;
        for (let question of questions) {
            slider_i++;
            $(div).append($('<div>', {
                id: 'q-text' + slider_i,
                class: "slider-" + page_i.toString(),
                html: question
            }));
            $(div).append($('<div>', {
                id: "slider-wrapper" + slider_i,
                class: orient == 'vertical' ? 'slider-wrapper' : 'h-slider-wrapper'
            }).append($('<input>', {
                id: "slider" + slider_i,
                class: "slide",
                type: "text",
                'data-slider-value': 1,
                'data-slider-orientation': orient
            })));
            create_slider('#slider' + slider_i, '#slider-wrapper' + slider_i,
                          slider_config, orient);
        }
        // $('.slide').slider('refresh');
    }

    function tie_strength_prepare(index) {
        let tie_names = [...all_names['in_dorm'], ...all_names['outside']];
        shuffle(tie_names);
        // append questions to DOM
        append_sliders('#p2-questions', tie_names, tie_strength_slider_configs[index]);
    }

    // data & reset
    function tie_strength_onfinish() {
        // save data
        $('.slider-2').each((name_i, elt) => {
            let question = $(elt).get(0).textContent;
            let i = -1;
            if ($(elt).attr('id')) {
                i = $(elt).attr('id').substring(6);
            } else { // not a slider question
                return true;
            }
            let response = $('#slider' + i).val();
            let resp_txt = $('#slider-wrapper' + i + ' .label-is-selection').text();

            let data = {[name_i]: {
                question: question,
                response: response,
                response_text: resp_txt,
                timestamp: slider_times[i]
            }}
            window.save2firebase(data, page_i, question_i);
        });
        return true;
    }


    // ----- LIKERT QUESTIONS -----

    function likert_prepare(question_i) {
        $('#p3 .question-text').html(likert_questions[question_i]);
        // reset
        slider_clicks = [];
        slider_times = [];
        // append
        append_sliders('#p3-questions', likert_sliders.texts[question_i], likert_sliders.sliders[question_i])
    }

    function likert_onfinish() {
        // save data
        $('.slider-3').each((q_i, elt) => {
            let question = $(elt).get(0).textContent;
            let i = $(elt).attr('id').substring(6);
            let response = $('#slider' + i).val();
            let resp_txt = $('#slider-wrapper' + i + ' .label-is-selection').text();

            let data = {[q_i]: {
                question: question,
                response: response,
                response_text: resp_txt,
                timestamp: slider_times[i]
            }};
            window.save2firebase(data, page_i, question_i);
        });

        return true;
    }


    // ----- DEMOGRAPHIC QUESTIONS -----
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

    $('input[type=radio][name=year]').change(() => {
        if ($('#other-year-check').is(':checked')) {
            $('#other-year').attr('required', true);
        } else {
            $('#other-year').attr('required', false);
        }
    });

    $('#other-race-check').change(() => {
        if ($('#other-race-check').is(':checked')) {
            $('#other-race').attr('required', true);
        } else {
            $('#other-race').attr('required', false);
        }
    });

    $('#race').get(0).setCustomValidity('Please select at least one');
    $('input[type=checkbox][name=race]').change(() => {
        if ($('#race-group :checkbox:checked').length > 0) {
            $('#race').get(0).setCustomValidity('');
        } else {
            $('#race').get(0).setCustomValidity('Please select at least one');
        }
    });

    function demographic_onfinish() {
        if (! $('#demographic').get(0).reportValidity()) {
            return false;
        }

        let data = {
            age: $('#age').val(),
            year: $('input[name=year]:checked').val(),
            year_other: $('#other-year').val(),
            gender: $('input[name=gender]:checked').val(),
            race: $('input[name=race]:checked').toArray().map(x =>x.value),
            race_other: $('#other-race').val(),
            major: $('#major').val(),
            zipcode: $('#zipcode').val(),
            country: $('#international-check').is(':checked') ? $('#country').val() : 'US',
            timestamp: Date.now()
        }

        window.save2firebase(data, page_i, question_i);

        return true;
    }


    // PAYMENT QUESTION

    $('input[type=radio][name=payment]').change(() => {
        $('#btn-next').removeClass('disabled');
    });

    function payment_onfinish() {
        if (! $('#payment-form').get(0).reportValidity()) {
            return false;
        }
        window.save2firebase({
            payment: $('input[name=payment]:checked').val()
        }, page_i, question_i, true, true);
        return true;
    }

    // PREVIOUS BUTTON
    var onfinish_funcs = [nickname_onfinish, roster_onfinish, tie_strength_onfinish,
                          likert_onfinish, demographic_onfinish, payment_onfinish];

    function add_data() {
        // show previous data
        roster_data[question_i].names_in_dorm.forEach(
            (tag) => $('#dorm-names').tagsManager('pushTag', tag)
        );
        roster_data[question_i].names_outside.forEach(
            (tag) => $('#outsider-names').tagsManager('pushTag', tag)
        );
        if (roster_data[question_i].names_in_dorm.length + roster_data[question_i].names_outside.length == 0) {
            $('#btn-next').addClass('disabled');
        }
    }

    $('#btn-prev').on('click', (e) => {
        if ($('#btn-prev').hasClass('disabled')) {
            return;
        }

        // save current data
        let result = onfinish_funcs[page_i](question_i);
        if (!result) {
            return;
        }

        // go back to previous question
        --question_i;
        $('.question-text').html(question_texts[page_i][question_i]);
        add_data();

        prog_bar.animate(prog_bar.value() - 0.3 / question_texts[page_i].length,
                        { duration: 1000 });

        // first question
        if (page_i == ROSTER_PAGE && question_i < 1) {
            // remove prev button
            $('#btn-prev').hide();
        }
        $('.invalid').hide();
        normal_next_btn();
        $('#no-prev').hide();
    });

    // NEXT BUTTON

    function normal_next_btn() {
        $('#btn-next').text('Next');
        $('#btn-next').removeClass('btn-warning');
        $('#btn-next').removeClass('btn-sm');
    }

    $('#btn-next').on('click', (e) => {
        if (!skip_check) {
            if (page_i == ROSTER_PAGE && !check_entered_text()) {
                return;  // entered text but didn't add for naming question
            }
            // no answer
            if ($('#btn-next').hasClass('disabled')) {
                if (page_i == ROSTER_PAGE) {
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
            let result = onfinish_funcs[page_i]();
            if (!result) {
                return;
            }
        }
        skip_check = false;
        window.scrollTo(0, 0);
        // proceed
        if (question_i < question_texts[page_i].length - 1) {
            // next question of the same type
            ++question_i;
            $('.question-text').html(question_texts[page_i][question_i]);

            // roster last question
            if (page_i == ROSTER_PAGE && question_i == question_texts[ROSTER_PAGE].length - 1) {
                $('#no-prev').show();
            }

            // add data if there is any
            if (page_i == ROSTER_PAGE && roster_data.hasOwnProperty(question_i)) {
                add_data();
            } else {
                $('#btn-next').addClass('disabled');
            }

            if (page_i == 2) {
                tie_strength_prepare(question_i);
                // $('.slide').slider('refresh');
            } else if (page_i == 3) {
                likert_prepare(question_i);
                // $('.slide').slider('refresh');
            }
            
            let percent = page_i == 2 ? 0.2 : 0.3;
            prog_bar.animate(prog_bar.value() + percent / question_texts[page_i].length,
                            { duration: 1000 });
        } else {
            // next page, first question
            $('#btn-next').addClass('disabled');
            $('#p' + page_i).hide();
            // prepare subsequent questions
            if (page_i == ROSTER_PAGE) {
                // remove prev button
                $('#btn-prev').hide();
                $('#no-prev').hide();
            }

            // next page
            ++page_i;
            question_i = 0;
            if (page_i == $('.page').length) {
                return;  // DONE
            }
            if (page_i == 2 && all_names.in_dorm.size == 0 && all_names.outside.size == 0) {
                page_i = 3;
            }

            // progress bar
            let percent;
            switch (page_i) {
                case 1: percent = 0.05; break;
                case 2: percent = 0.35; break;
                case 3: percent = 0.55; break;
                case 4: percent = 0.85; break;
                case 5: percent = 0.95; break;
                default: percent = prog_bar.value(); break;
            }
            prog_bar.animate(Math.max(prog_bar.value(), percent), { duration: 1000 });

            // prepare next page
            if (page_i == 2) {
                tie_strength_prepare(question_i);
            } else if (page_i == 3) {
                likert_prepare(question_i);
            } else if (page_i == 4) {
                $('#btn-next').removeClass('disabled');
            }
            if (question_texts[page_i].length > 0) {
                $('.question-text').html(question_texts[page_i][question_i]);
            }
            $('#p' + page_i).show();
            // $('.slide').slider('refresh');
        }
        // hide warning
        $('.invalid').hide();
        normal_next_btn();
        // show previous button
        if (page_i == ROSTER_PAGE && question_i > 0) {
            $('#btn-prev').show();
        }
        // last page last question, change button text
        if ((page_i == $('.page').length - 1) && (question_i == question_texts[page_i].length - 1)) {
            $('#btn-next').text('Finish');
        }
    });

    window.hookWindow = true;
});
