'use strict';

(function () {
    var firstname, lastname, uid, dorm_room, dorm_wing, email, phone, timestamp;
    var url;

    $('#instr').hide();
    $('#confirmation').hide();

    function check_name() {
        var errmsg = 'Please enter English alphabets only';
        $(this)[0].setCustomValidity(/^[a-zA-Z '-]*$/.test($(this).val()) ? '' : errmsg);
    }
    $('#firstname').change(check_name);
    $('#lastname').change(check_name);

    $('#dorm').change(() => {
        var errmsg = 'Please enter your 3-digit room number';
        $('#dorm')[0].setCustomValidity(/^[0-9]{3}$/.test($('#dorm').val()) ? '' : errmsg);
    });

    $('#uid').change(() => {
        var errmsg = 'Please enter your 9-digit UID';
        $('#uid')[0].setCustomValidity(/^[0-9]{9}$/.test($('#uid').val()) ? '' : errmsg);
    });

    $('#phone').change(() => {
        var errmsg = 'Please enter your 10-digit phone number';
        $('#phone')[0].setCustomValidity(/^[0-9]{10}$/.test($('#phone').val()) ? '' : errmsg);
    });

    function submit_info() {
        $('#dorm-wing-group input').removeClass('is-invalid');
        $('#dorm').removeClass('is-invalid');
        dorm_room = $('#dorm').val();
        dorm_wing = $('input[name="dorm-wing"]:checked').val();

        firstname = $('#firstname').val();
        lastname = $('#lastname').val();
        uid = $('#uid').val();
        email = $('#email').val();
        phone = $('#phone').val();

        // ask to double check
        $('#info-check').append('<p>Your first name: <strong>' + firstname + '</strong></p>')
        $('#info-check').append('<p>Your last name: <strong>' + lastname + '</strong></p>')
        $('#info-check').append('<p>Your dorm room: <strong>' + dorm_room + ' (' + dorm_wing + ')</strong></p>')
        $('#info-check').append('<p>Your UID: <strong>' + uid + '</strong></p>')
        $('#info-check').append('<p>Your email: <strong>' + email + '</strong></p>')
        $('#info-check').append('<p>Your phone number: <strong>' + phone + '</strong></p>')
        $('#info-form').hide();
        $('#confirmation').show();
        $('#correct-info').hide();
    }
    window.submit_info = submit_info;

    $('#refresh-btn').click(() => {
        location.reload();
    });

    $('#confirm-btn').click(() => {
        let sha256 = CryptoJS.SHA256(dorm_room + dorm_wing[0] + uid).toString();
        let ts = timestamp.valueOf().toString();
        let dormfloor = dorm_room[0] + dorm_wing[0].toUpperCase();
        let floor_index = window.selected_floors.indexOf(dormfloor);
        let user_id = 'C' + floor_index + '-' + sha256.slice(0, 5);  // ID for all tasks
        let param = '4'; //window.location.search.substring(1).split(/[&=]/)[1];
        url = 'user=' + user_id + '&timestamp=' + ts + '&l=' + param + '&t=' + dormfloor;

        window.save_user2firebase(user_id, ts, url.replace(ts, '0000000000000'), {
            firstname: firstname,
            lastname: lastname,
            uid: uid,
            email: email,
            phone: phone,
            dorm_room: dorm_room,
            dorm_wing: dorm_wing,
            login_start_time: timestamp.toString(),
            participant_id: user_id
        });

        $('#info-form').hide();
        $('#confirmation').hide();
        $('#correct-info').hide();

        if (window.selected_floors.includes(dormfloor)) {
            $('#instr').show();
        } else {
            $('#wrong-floor').show();
        }
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
        window.location.replace('survey.html?' + url);
    });

    timestamp = new Date();
})();
