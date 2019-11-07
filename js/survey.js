'use strict';
// TODO hook window
(function () {
    // set up roster based questions with Chosen
    $('.roster-select').on('chosen:ready', function(ev, args) {
        // always show placeholder
        var sender = args.chosen;
        sender.search_field.attr('placeholder', sender.default_text);
    }).chosen({placeholder_text_multiple: 'Search here...'});
    // always show the option list
    $('.roster-select').trigger('chosen:open');
    $('.chosen-search-input').blur();
    window.scrollTo(0, 0);

    // Firebase configuration
    var firebaseConfig = {
        apiKey: 'AIzaSyBvPWLV2yjapJKblBLcfkVbpZC3cXtM0PU',
        authDomain: 'dorm-network.firebaseapp.com',
        databaseURL: 'https://dorm-network.firebaseio.com',
        projectId: 'dorm-network',
        storageBucket: '',
        messagingSenderId: '804230274072',
        appId: '1:804230274072:web:dd26c12bba4f85e64df76d'
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
    var db_roster_name = 'test_roster';

    // set up Add buttons
    for (var i = 1; i <= 3; ++i) {
        $('#q' + i + '-add-btn').click((e) => {
            var id_prefix = '#' + e.target.id.substr(0, 2);
            var new_name = $(id_prefix + '-add-input').val();
            $(id_prefix + '-answer').append('<option selected>' + new_name + '</option>');
            $(id_prefix + '-answer').chosen().trigger("chosen:updated");
            $(id_prefix+ '-add-input').val('');  // clear input
        });
    }




})();
