'use strict';
var hookWindow = false;

(function () {
    var DB_ROSTER_NAME = 'test';
    $('.page').hide();
    var page_i = 1;
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
        $('.question-text').html(question_texts[page_i][question_i]);

        $('#roster-add').css('margin-top', $('.chosen-drop').height() + 30 + 'px');
    })
    .catch(function(error) {
        // error
        alert('Failed to access database, please check your internet connection and try again.\n' + error);
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
    function roster_q_reset() {
        var data = $('#select-roster').val();
        named_people = new Set([...data, ...named_people])  // append to set
        // TODO save data (to firebase?)
        $("#check-no-selection").prop('checked', false);
        $("#check-no-selection").trigger('change');
        $('.roster-select').val([]).trigger("chosen:updated");
    }

    // TIE STRENGTH QUESTIONS
    $('#slider').slider({
        step: 1,
        min: 1,
        max: 5,
        value: 0,
        ticks: [1, 2, 3, 4, 5],
        ticks_labels: ['Less than once a week',
                       'About once a week',
                       '2-3 times a week',
                       '4-5 times a week',
                       'Almost everyday'],
    });
    var body_width = $('body').width();
    var rotation = 32 - body_width / 30;
    rotation = (body_width < 420) ? (130 - body_width * 4 / 15) : rotation;
    rotation = rotation > 45 ? 90 : rotation;
    if (rotation >= 3) {
        $('.slider-tick-label').css('transform', 'rotate(' + rotation + 'deg)');
        if (rotation > 30) {
            $('.slider-tick-label-container').css('transform', 'translateY(12px)');
        }
    }
    // initialize to unselected css
    $('.label-is-selection').css('font-weight', '400');
    $('.slider-handle').css('background-image',
                            'linear-gradient(to bottom,#d5d5d5 0,#d0d0d0 100%)');
    $("#slider").on('slideStop change', function (ev) {
        $('#btn-next').removeClass('disabled');
        // remove unselected css
        $('.label-is-selection').css('font-weight', '');
        $('.slider-handle').css('background-image', '');
    });

    function tie_q_prepare() {
        var q_with_names = [];
        for (let q of tie_questions) {
            var this_q_with_names = [];
            for (let name of named_people) {
                this_q_with_names.push(q.replace('*', name));
            }
            shuffle(this_q_with_names);
            q_with_names.push(...this_q_with_names);
        }
        tie_questions = q_with_names;
    }

    // NEXT BUTTON

    var reset_funcs = [roster_q_reset];

    $('#btn-next').click((e) => {
        if ($('#btn-next').hasClass('disabled')) {
            return;
        }
        // proceed
        if (question_i < question_texts[page_i].length) {
            // reset question
            reset_funcs[page_i]();
            // next question
            ++question_i;
            $('.question-text').html(question_texts[page_i][question_i]);
        } else {
            // next page
            $('#p' + page_i).hide();
            ++page_i;
            question_i = 0
            if (page_i >= $('.page').length) {
                $('#btn-next').hide();
                alert('DONE');
            } else {
                $('.question-text').html(question_texts[page_i][question_i]);
                $('#p' + page_i).show();
                // $('#slider').slider('refresh');  //TODO
            }
        }
    });


    // hookWindow = true;
    var startTime = new Date();
})();
