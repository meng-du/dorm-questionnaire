'use strict';

(function () {
    var firstname, lastname, uid, dorm_room, dorm_wing, email, timestamp;
    var user_id;
    var survey_id = (Date.now() + Math.random()).toString();

    $('#instr').hide();
    $('#confirmation').hide();

    function check_name() {
        var errmsg = 'Please enter English alphabets only';
        $(this)[0].setCustomValidity(/^[a-zA-Z '-]*$/.test($(this).val()) ? '' : errmsg);
    }
    $('#firstname').change(check_name);
    $('#lastname').change(check_name);

    $('#dorm').change(() => {
        var errmsg = 'Please enter your 3-digit room number';  // TODO: 2
        $('#dorm')[0].setCustomValidity(/^[0-9]{3}$/.test($('#dorm').val()) ? '' : errmsg);
    });

    $('#uid').change(() => {
        var errmsg = 'Please enter your 9-digit UID';
        $('#uid')[0].setCustomValidity(/^[0-9]{9}$/.test($('#uid').val()) ? '' : errmsg);
    });

    function submit_info() {
        $('#dorm-wing-group input').removeClass('is-invalid');
        $('#dorm').removeClass('is-invalid');
        dorm_room = $('#dorm').val();
        dorm_wing = $('input[name="dorm-wing"]:checked').val();

        // check dorm entry TODO
        // if (dorm_room < 201 || (dorm_room > 238 && dorm_room < 252) || dorm_room > 287) {
        //     // wrong dorm #
        //     $('#dorm').addClass('is-invalid');
        //     return;
        // } else if ((dorm_room < 250 && dorm_wing == 'south') || (dorm_room > 250 && dorm_wing == 'north')) {
        //     // mismatched dorm and wing
        //     $('#dorm').addClass('is-invalid');
        //     $('#dorm-wing-group input').addClass('is-invalid');
        //     return;
        // }

        firstname = $('#firstname').val();
        lastname = $('#lastname').val();
        uid = $('#uid').val();
        email = $('#email').val();

        // ask to double check
        $('#info-check').append('<p>Your first name: <strong>' + firstname + '</strong></p>')
        $('#info-check').append('<p>Your last name: <strong>' + lastname + '</strong></p>')
        $('#info-check').append('<p>Your dorm room: <strong>' + dorm_room + ' (' + dorm_wing + ')</strong></p>')
        $('#info-check').append('<p>Your UID: <strong>' + uid + '</strong></p>')
        $('#info-check').append('<p>Your email: <strong>' + email + '</strong></p>')
        $('#info-form').hide();
        $('#confirmation').show();
        $('#correct-info').hide();
    }
    window.submit_info = submit_info;

    $('#refresh-btn').click(() => {
        location.reload();
    });

    $('#confirm-btn').click(() => {
        user_id = CryptoJS.SHA256(dorm_room + uid).toString();

        window.save_user2firebase(user_id, timestamp.valueOf().toString(), {
            firstname: firstname,
            lastname: lastname,
            uid: uid,
            email: email,
            dorm_room: dorm_room,
            dorm_wing: dorm_wing,
            login_start_time: timestamp.toString()
        });

        $('#info-form').hide();
        $('#confirmation').hide();
        $('#correct-info').hide();
        $('#instr').show();
    });

    $('#agree-check').change((e) => {
        if ($(e.target).prop('checked')) {
            $('#start').removeClass('disabled');
        } else {
            $('#start').addClass('disabled');
        }
    });

    $('#start').click(() => {
        if ($('#start').hasClass('disabled')) {
            return;
        }
        window.location.replace('survey.html?user=' + user_id + '&timestamp=' + timestamp.valueOf().toString() + '&wing=' + dorm_wing);
    });

    timestamp = new Date();
})();
