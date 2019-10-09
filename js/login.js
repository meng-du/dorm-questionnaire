'use strict';

(function () {
    $('#no-record').hide();

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

    function nextpage() {
        // TODO
        alert('next');
    }

    function check_name(name) {
        return ;
    }

    function check_room_num(name) {
        return /^[a-zA-Z '-]+$/.test(str);
    }

    function submit_info() {
        $('#name-group').removeClass('bold has-error has-danger');
        $('#dorm-group').removeClass('bold has-error has-danger');

        var firstname = $('#firstname').val();
        var lastname = $('#lastname').val();
        var dorm = $('#dorm').val();
        var uid = $('#uid').val();

        // error checking
        for (name in ['#firstname', '#lastname']) {
            if !(/^[a-zA-Z '-]+$/.test($(name).val())) {
                $(name).setCustomValidity('Please enter only alphabets');
            }
        }

        if !(/^2[0-9][0-9]$/.test($('#dorm').val())) {
            $('#dorm').setCustomValidity('Please enter your 3-digit room number, starting with 2');
        }

        if !(/^[0-9]{9}$/.test($('#uid').val())) {
            $('#uid').setCustomValidity('Please enter your 9-digit UID');
        }

        // check Firebase
        db.collection(db_roster_name).doc(uid).get().then((db_sid) => {
            if (db_sid.exists) {
                nextpage();
            } else {
                $('#info-check').append('<p>Your first name: <strong>' + firstname + '</strong></p>')
                $('#info-check').append('<p>Your last name: <strong>' + lastname + '</strong></p>')
                $('#info-check').append('<p>Your dorm room: <strong>' + dorm + '</strong></p>')
                $('#info-check').append('<p>Your UID: <strong>' + uid + '</strong></p>')
                $('#info-form').hide();
                $('#no-record').show();
                $('#correct-info').hide();
            }
        }).catch(function(error) {
            alert('Failed to access database, please check your internet connection and try again.');
            console.log(error);
        });
    }
    window.submit_info = submit_info;

    $('#refresh-btn').click(() => {
        location.reload();
    })

    $('#correct-btn').click(() => {
        $('#correct-info').show();
    })

    $('#cont').click(() => {
        nextpage();
    })

})();
