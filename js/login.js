'use strict';

(function () {
    var uid;
    var dorm_wing;
    $('#no-record').hide();
    $('#instr').hide();

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

    function instrpage(uid, wing) {
        $('#info-form').hide();
        $('#no-record').hide();
        $('#correct-info').hide();
        $('#instr').show();
    }

    function check_name() {
        var errmsg = 'Please enter only alphabets';
        $(this)[0].setCustomValidity(/^[a-zA-Z '-]*$/.test($(this).val()) ? '' : errmsg);
    }
    $('#firstname').change(check_name);
    $('#lastname').change(check_name);

    $('#dorm').change(() => {
        var errmsg = 'Please enter your 3-digit room number, starting with 2';
        $('#dorm')[0].setCustomValidity(/^2[0-9][0-9]$/.test($('#dorm').val()) ? '' : errmsg);
    });

    $('#uid').change(() => {
        var errmsg = 'Please enter your 9-digit UID';
        $('#uid')[0].setCustomValidity(/^[0-9]{9}$/.test($('#uid').val()) ? '' : errmsg);
    });

    function submit_info() {
        $('#dorm-wing-group input').removeClass('is-invalid');
        $('#dorm').removeClass('is-invalid');
        var dorm = $('#dorm').val();
        dorm_wing = $('input[name="dorm-wing"]:checked').val();

        // check dorm entry
        if (dorm < 201 || (dorm > 238 && dorm < 252) || dorm > 287) {
            // wrong dorm #
            $('#dorm').addClass('is-invalid');
            return;
        } else if ((dorm < 250 && dorm_wing == 'south') || (dorm > 250 && dorm_wing == 'north')) {
            // mismatched dorm and wing
            $('#dorm').addClass('is-invalid');
            $('#dorm-wing-group input').addClass('is-invalid');
            return;
        }

        var firstname = $('#firstname').val();
        var lastname = $('#lastname').val();
        uid = $('#uid').val();
        var email = $('#email').val();

        // check Firebase
        db.collection(db_roster_name).doc(uid).get().then((db_sid) => {
            if (db_sid.exists) {
                instrpage();
            } else {
                $('#info-check').append('<p>Your first name: <strong>' + firstname + '</strong></p>')
                $('#info-check').append('<p>Your last name: <strong>' + lastname + '</strong></p>')
                $('#info-check').append('<p>Your dorm room: <strong>' + dorm + ' (' + dorm_wing + ')</strong></p>')
                $('#info-check').append('<p>Your UID: <strong>' + uid + '</strong></p>')
                $('#info-check').append('<p>Your email: <strong>' + email + '</strong></p>')
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
    });

    $('#correct-btn').click(() => {
        $('#correct-info').show();
    });

    $('#cont').click(instrpage);

    $('#start').click(() => {
        window.location.replace('survey.html?uid=' + uid + '&wing=' + dorm_wing);
    });

})();
