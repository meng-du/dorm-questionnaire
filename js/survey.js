'use strict';
// TODO hook window
(function () {
    $('.chosen-select').on('chosen:ready', function(ev, args) {
        var sender = args.chosen;
        sender.search_field.attr('placeholder', sender.default_text);
      }).chosen({placeholder_text_multiple: 'Search here...'});
    $('.chosen-select').trigger('chosen:open');
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

})();
