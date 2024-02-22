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
    var all_names = {in_dorm: new Set(['abcd enm', 'ajsb eokm', 'as mc']), outside: new Set([])};
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
    // var dorm_wing = parameters[5];

    // PROGRESS BAR
    var prog_bar = new ProgressBar.Line('#prog-bar', { color: '#ffc107' });

    // ----- TODO below -----

    // LOAD PREVIOUS PROGRESS

    // function setup_curr_names(exclude=[]) {
    //     // remove names that are also in the past
    //     let intersection = new Set([...all_named_people['current_q']]
    //                        .filter(x => all_named_people['past_q'].has(x)));
    //     all_named_people['current_q'] = new Set([...all_named_people['current_q']]
    //                                     .filter(x => !intersection.has(x)));
    //     // exclude
    //     if (exclude.size && exclude.size > 0) {
    //         intersection = new Set([...intersection].filter(x => !exclude.has(x)));
    //     }
    //     // put intersection at the beginning of attitude questions
    //     let person_q_later = [];
    //     let person_slider_q_later = [];
    //     let person_slider_later = [];
    //     for (let name of intersection) {
    //         person_q_later.push('<small id="name-note" class="form-text text-muted">' +
    //                             $('#name-note').html() + '</small>');
    //         person_slider_later.push([{}, freq_slider2, freq_slider2, freq_slider2, freq_slider2,
    //                                   {}, freq_slider2, freq_slider2, freq_slider2, freq_slider2]);
    //         let person_slider_q = [];
    //         for (let q of person_questions.followup) {
    //             person_slider_q.push(q.replace('*', name));
    //         }
    //         person_slider_q_later.push(person_slider_q);
    //     }
    //     attitude_questions.questions = person_q_later.concat(attitude_questions.questions);
    //     attitude_questions.slider_qs = person_slider_q_later.concat(attitude_questions.slider_qs);
    //     attitude_questions.sliders = person_slider_later.concat(attitude_questions.sliders);
    // }

    function push_names(names_in_dorm, names_outside) {
        // let dorm_names = [];
        // let outside_names = [];
        // names_in_dorm.forEach(
        //     (tag) => dorm_names.push(tag + ' (2' + dorm_wing[0].toUpperCase() + ')')  // TODO 2
        // );
        // names_outside.forEach(
        //     (tag) => outside_names.push(tag + ' (non-2' + dorm_wing[0].toUpperCase() + ')')  // TODO 2
        // );
        // append to set
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
        console.log(page_i, question_i);
        skip_check = true;
        if (page_i == 0 || page_i > 2) {
            $('#btn-next').click();
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
        console.log(page_i, question_i);
        $('#btn-next').click();
        console.log(page_i, question_i);
        $('#p' + page_i).show();
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
        console.log('dist', name1, name2, dist);
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
        let fields = ['#dorm-names', '#outsider-names'];  // TODO use an aggregated list rather than just the list from the current page
        for (let i in fields) {
            let field = $(fields[i]);
            console.log(i, field.val().trim());
            if (tag == name_to_title_case(field.val())) {
                // test if using valid characters
                if (! /^[a-zA-Z-]+\s+[a-zA-Z-'\s]*[a-zA-Z-]+$/.test(tag)) {
                    field.get(0).setCustomValidity('Please enter one name at a time with alphabets, spaces, hyphens and apostrophes only');
                    field.get(0).reportValidity();
                    valid = false;
                }
                // test if repeating names on the same page
                let repeat_this_field = field.tagsManager('tags').indexOf(tag);
                let repeat_other_field = $(fields[1 - i]).tagsManager('tags').indexOf(tag);
                console.log(tag, field.tagsManager('tags'), repeat_this_field, $(fields[1 - i]).tagsManager('tags'), repeat_other_field);
                let blink = false;
                let rep = false;
                if (repeat_this_field > -1) {
                    blink = $(fields[i] + '-container' + ' .tm-tag')[repeat_this_field];
                } else if (repeat_other_field > -1) {
                    blink = $(fields[1 - i] + '-container' + ' .tm-tag')[repeat_other_field];
                } else {
                    // test for similar names on the same page
                    rep = check_duplicate_against_list(tag, field.tagsManager('tags'));
                    console.log('1xx', rep, field.tagsManager('tags'));
                    if (rep) {
                        blink = $(fields[i] + '-container' + ' .tm-tag')[field.tagsManager('tags').indexOf(rep)];
                    } else {
                        rep = check_duplicate_against_list(tag, $(fields[1 - i]).tagsManager('tags'));
                        console.log('2xx', rep, $(fields[1 - i]).tagsManager('tags'));
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
                if (!rep) {
                    rep = check_duplicate_against_exist_names(tag, [['in_dorm', 'outside'][i]], true);   // forbid similar names in the same field
                }
                if (!rep) {
                    rep = check_duplicate_against_exist_names(tag, [['in_dorm', 'outside'][1 - i]], false);  // forbid repeating or similar names in the other
                }
                if (rep) {
                    console.log('invalid!!!');
                    field.get(0).setCustomValidity('You have already entered this name or a similar name: ' + rep +
                        '. If you are entering different people with the same name, please add a descriptive term (e.g., Daniel Kim artist).');
                    field.get(0).reportValidity();
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
    // $(".tm-input").on('tm:pushed', function(e, tag) {
    //     $(e.target).tagsManager('popTag');
    //     $(e.target).tagsManager('pushTag', name_to_title_case(tag));
    // });

    // set up instructions to include wing
    // $('#dorm-name-instr').html($('#dorm-name-instr').html().replace('Hall</strong>', 'Hall</strong> 2' + dorm_wing[0].toUpperCase())); // TODO: 2
    // $('#name-note').html($('#name-note').html().replace(/2</g, '2' + dorm_wing[0].toUpperCase() + '<')); // TODO: 2

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
            rotation = 32 - body_width / 30;
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
        $(elt).slider('refresh');

        // initialize to unselected css
        $('.label-is-selection').css('font-weight', '400');
        $('.slider-handle').css('background-image',
                                'linear-gradient(to bottom,#ccc 0,#eee 100%)');
        // clicks
        $(elt).on('slideStop change', slider_onclick);
        slider_clicks.push(required ? 0 : 10);
        slider_times.push(-1);
    }

    function append_sliders(div, questions, slider_config, orient) {
        // reset
        $(div).empty();
        slider_clicks = [];
        slider_times = [];

        let slider_i = -1;
        for (let question in questions) { // TODO wtf
            slider_i++;
            $(div).append($('<div>', {
                id: 'q-text' + slider_i,
                class: "question-text slider-q-text",
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
                          slider_config, orient)
        }
    }

    function tie_strength_prepare(names) {
        // TODO shuffle names? add appendix to names?
        // append questions to DOM
        for (let i = 0; i < names.length; i++) {
            $('#p3 .question-text').html(names[i]);
            append_sliders('#p3-questions', names, tie_strength_slider_configs[i])
        }
    }

    // data & reset
    function tie_strength_onfinish() {
        // let invalid = false;
        // save data
        $('.slider-q-text').each((q_i, elt) => {
            let question = $(elt).get(0).textContent;
            let i = -1;
            if ($(elt).attr('id')) {
                i = $(elt).attr('id').substring(6);
            } else { // not a slider question
                return true;
            }
            let response = $('#slider' + i).val();
            let resp_txt = $('#slider-wrapper' + i + ' .label-is-selection').text();
            let person = $(elt).html();//.match(/(""\>.+\<\/sp|ng\>.+\<\/st)/g)[0].split('>')[1].split('<')[0];

            // check other freq is answered
            // let input = $('#' + $(elt).attr('id') + ' input');
            // let specification = '';
            // if (input.length > 0 && input.val().length > 0) {  // check slider
            //     let index = $(elt).attr('id').substring(6);
            //     if (slider_clicks[index] % 10 == 0) {  // unselected slider
            //         input.get(0).setCustomValidity('Please select a freqency below');
            //         input.get(0).reportValidity();
            //         invalid = true;
            //         return false;
            //     } else {
            //         specification = input.val();
            //     }
            // }

            let data = {
                question: question,
                response: response,
                response_text: resp_txt,
                timestamp: slider_times[i]
            }
            // if (specification.length > 0) {
            //     data['specification'] = specification;
            // }
            window.save2firebase(data, page_i, question_i);
        });
        // if (invalid) { return false; }

        // next question
        // if (!next_q) {
        //     $('#p3-questions').empty();
        //     slider_clicks = [];
        //     slider_times = [];
        //     return true;
        // }
        // // reset slider value and color
        // $('.slide').val(1);
        // $('.slide').slider('refresh');
        // $('.label-is-selection').css('font-weight', '400');
        // $('.slider-handle').css('background-image',
        //                         'linear-gradient(to bottom,#ccc 0,#eee 100%)');
        // // reset clicks
        // for (let i in slider_clicks) {
        //     slider_clicks[i] -= slider_clicks[i] % 10;
        // }
        // // put up new questions
        // $('.slider-q-text').each((i, elt) => {
        //     $(elt).html(next_q[i]);
        // });
        return true;
    }


    // ----- LIKERT QUESTIONS -----

    function likert_prepare(question_i) {
        $('#p5 .question-text').html(likert_questions.questions[question_i]);
        // reset
        slider_clicks = [];
        slider_times = [];
        // append
        for (let i = 0; i < likert_questions.slider_texts.length; i++) {
            append_sliders('#p3-questions', likert_questions.slider_texts[i], likert_questions.sliders[i])
        }
    }

    function likert_onfinish() {
        // save data
        $('.slider-q-text').each((q_i, elt) => {
            let question = $(elt).get(0).textContent;
            let i = $(elt).attr('id').substring(6);
            let response = $('#slider' + i).val();
            let resp_txt = $('#slider-wrapper' + i + ' .label-is-selection').text();

            let data = {
                question: question,
                response: response,
                response_text: resp_txt,
                timestamp: slider_times[i]
            }
            window.save2firebase(data, page_i, question_i);
        });

        return true;
    }


    // ----- DEMOGRAPHIC QUESTIONS -----
    // TODO
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

        let data = {
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

    function add_data() {  // TODO TEST
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

        console.log('prev btn', page_i, question_i);
        // save current data
        let result = onfinish_funcs[page_i](question_i);
        if (!result) { // TODO validate or not? maybe no?
            return;
        }

        // go back to previous question
        --question_i;
        $('.question-text').html(question_texts[page_i][question_i]);
        add_data();

        // first question
        if (page_i == ROSTER_PAGE && question_i < 1) {
            // remove prev button
            $('#btn-prev').hide();
        }
        $('.invalid').hide();
        normal_next_btn();
        $('#no-prev').hide();
        console.log('prev btn', page_i, question_i);
    });

    // NEXT BUTTON

    function normal_next_btn() {
        $('#btn-next').text('Next');
        $('#btn-next').removeClass('btn-warning');
        $('#btn-next').removeClass('btn-sm');
    }

    $('#btn-next').on('click', (e) => {
        console.log('next btn', page_i, question_i);
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
            console.log(page_i, question_texts[page_i][question_i], result)
            if (!result) {
                return;
            }
        }
        skip_check = false;
        window.scrollTo(0, 0);
        // proceed
        if (question_i < question_texts[page_i].length - 1) {
            // console.log('next 1', page_i, question_i);
            // next question of the same type
            ++question_i;
            $('.question-text').html(question_texts[page_i][question_i]);

            // roster last question
            if (page_i == ROSTER_PAGE && question_i == question_texts[ROSTER_PAGE].length - 1) {
                $('#no-prev').show();
            }

            // add data if there is any
            console.log(page_i, question_i, roster_data.hasOwnProperty(question_i), roster_data);
            if (page_i == ROSTER_PAGE && roster_data.hasOwnProperty(question_i)) {
                add_data();
            } else {
                $('#btn-next').addClass('disabled');
            }

            if (page_i == 3) {
                likert_prepare(question_i)
            }
            if (page_i == 2 || page_i == 3) {
                $('.slide').slider('refresh');
            }

            if (page_i > 1) {
                let percent = page_i == 4 ? 0.1 : 0.2;  // TODO ??
                prog_bar.animate(prog_bar.value() + percent / question_texts[page_i].length,
                                { duration: 1000 });
            }
        } else {
            // console.log('next 2', page_i, question_i);
            // next page, first question
            $('#btn-next').addClass('disabled');
            $('#p' + page_i).hide();
            // prepare subsequent questions
            if (page_i == ROSTER_PAGE) {
                prog_bar.animate(prog_bar.value() + 0.05, { duration: 1000 });  // TODO
                // get all named people
                for (let q_i = 0; q_i < roster_questions.length; q_i++) {
                    push_names(roster_data[q_i].names_in_dorm,
                               roster_data[q_i].names_outside);
                }
                tie_strength_prepare(all_names);
                // remove prev button
                $('#btn-prev').hide();
                $('#no-prev').hide();
            }
            // progress bar TODO
            let percent;
            // switch (page_i) {
            //     case 0: percent = q_type == 'initial'? 0.05 : prog_bar.value(); break;
            //     case 1: percent = q_type == 'current_q'? 0.55 : prog_bar.value(); break;
            //     case 2: percent = q_type == 'initial'? 0.15 : prog_bar.value(); break;
            //     case 3: percent = q_type == 'past_q' ? 0.4 : 0.8; break;
            //     case 4: percent = 0.5; break;
            //     case 5: percent = 1; break;
            //     default: percent = prog_bar.value(); break;
            // }
            if (percent > prog_bar.value()) { // TODO   
                prog_bar.animate(percent, { duration: 1000 });
            }

            // next page
            ++page_i;
            question_i = 0;
            if (page_i == $('.page').length) {
                return;  // DONE
            }
            // if (page_i == NAME_GEN_PAGE && q_type == 'initial') {
            //     page_i = NAME_GEN_PAGE - 1;
            //     q_type = 'past_q';
            //     $('.precovid-in-q').show();
            //     $('#duringcovid-in-q').hide();
            //     $('#instr-public').hide();
            //     $('#btn-prev').hide();
            //     $('#no-prev').hide();
            // } else if (page_i == NAME_GEN_PAGE + 2) {  // last repetitive question
            //     if (q_type == 'past_q') {
            //         page_i = 1;  // restart from name gen 1
            //         pair_i = 0;
            //         q_type = 'current_q';  // change to current time
            //         $('.precovid-in-q').hide();
            //         $('#duringcovid-in-q').show();
            //     } else if (q_type == 'current_q') {
            //         q_type = 'questions'
            //         ++page_i;
            //     }
            // }
            // if (page_i == NAME_GEN_PAGE - 1) {
            //     $('#btn-next').removeClass('disabled');
            //     if (q_type == 'current_q' && $('.question-text').text().length > 0 && show_covid_residency) {
            //         page_i = 1;  // stay on the page to show more questions
            //     }
            // }
            // if (page_i == 5) {
            //     $('#p3-reminder').hide();
            //     append_p5_slider_qs(0);
            // }
            if (page_i == 3) {
                likert_prepare(question_i)
                $('.slide').slider('refresh');
            }
            if (question_texts[page_i].length > 0) {
                $('.question-text').html(question_texts[page_i][question_i]);
            }
            $('#p' + page_i).show();
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
