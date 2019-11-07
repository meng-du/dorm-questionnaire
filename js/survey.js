'use strict';
// TODO hook window
(function () {
    var DB_ROSTER_NAME = 'test';
    $('.page').hide();
    var page_i = 0;
    var question_i = 0;

    // PARSE PARAMETERS

    var parameters = window.location.search.substring(1).split(/[&=]/);
    var survey_id = parameters[1];
    var dorm_wing = parameters[3];

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
        for (var name of roster) {
            $('.roster-select').append('<option>' + name + '</option>');
        }
        $('.roster-select').chosen().trigger("chosen:updated");
        $('#p' + page_i).show();
        $('.question-text').html(question_texts[page_i][question_i]);
    })
    .catch(function(error) {
        // error
        alert('Failed to access database, please check your internet connection and try again.\n' + error);
        console.log(error);
    });

    // ROSTER BASED QUESTIONS

    // set up roster based questions with Chosen
    $('.roster-select').on('chosen:ready', function(ev, args) {
        // always show placeholder
        var sender = args.chosen;
        sender.search_field.attr('placeholder', sender.default_text);
    }).chosen({placeholder_text_multiple: 'Search here...'});
    // always show the option list
    $('.roster-select').trigger('chosen:open');
    $('.chosen-search-input').blur();

    // set up Add buttons
    $('#btn-roster-add').click((e) => {
        var new_name = $('#input-roster-add').val();
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
        $("#check-no-selection").prop('checked', false);
        $("#check-no-selection").trigger('change');
        $('.roster-select').val([]).trigger("chosen:updated");
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
            }
        }
    });



})();
