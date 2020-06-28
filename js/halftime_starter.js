'use strict';

jQuery(document).ready(function() {
    var DB_INFO_COLLECTION = 'test_info';
    var DB_DATA_COLLECTION = 'test_data';
    $('#confirmation').hide();
    $('#wronguid').hide();
    $('#surveydone').hide();
    var uid = '';
    var dorm_wing = '';

    $('#uid').change(() => {
        var errmsg = 'Please enter your 9-digit UID';
        $('#uid')[0].setCustomValidity(/^[0-9]{9}$/.test($('#uid').val()) ? '' : errmsg);
    });

    // get firebase id
    let params = window.location.search.substring(1).split(/[&=]/);
    var fid = params[1];
    var n_completion = params[3];
    if (!fid || !parseFloat(fid)) {
        $('body').empty();
        alert('Invalid web address. please double check or contact the experimenters.\n');
        return;
    }

    function submit_info() {
        let entered_uid = $('#uid').val();
        if (entered_uid == uid) {
            // ask to double check
            $('#info-form').hide();
            $('#confirmation').show();
            $('#correct-info').hide();
        } else {
            $('#wronguid').show();
        }
    }
    window.submit_info = submit_info;

    $('#confirm-btn').click(() => {
        $('#info-form').hide();
        $('#confirmation').hide();
        $('#correct-info').hide();
        $('#instr').show();
        db.collection(DB_DATA_COLLECTION).doc(fid).update({
            ['other_open_time' + n_completion]: timestamp.toString(),
            ['other_info_confirm_timestamp' + n_completion]: Date.now()
        });
        db.collection(DB_DATA_COLLECTION).doc(fid).get().then((doc) => {
            // find progress from last time
            let progress = 0;
            if (!doc.data()) {
                progress = '0';
            } else if ('6' in doc.data()) {
                $('#surveydone').show();
            } else if ('5' in doc.data()) {
                let length = Object.keys(doc.data()['5']).length;
                if (length <= 5) {
                    progress = '5.1';
                } else if (length <= 13) {
                    progress = '5.2';
                } else {
                    progress = '6';
                }
            } else if ('2' in doc.data()) {
                if ('current_q' in doc.data()['2']) {
                    if ('3' in doc.data() && 'current_q' in doc.data()['3']) {
                        let names0 = new Set();
                        doc.data()['2']['current_q'][0]['names_in_dorm'].forEach(item => names0.add(item));
                        doc.data()['2']['current_q'][1]['names_in_dorm'].forEach(item => names0.add(item));
                        let names1 = new Set();
                        doc.data()['2']['current_q'][0]['names_outside'].forEach(item => names1.add(item));
                        doc.data()['2']['current_q'][1]['names_outside'].forEach(item => names1.add(item));
                        let names2 = new Set();
                        Object.keys(doc.data()['3']['current_q']).forEach(item => names2.add(item.split(' - ')[0]));
                        if (names0.size + names1.size == names2.size) {
                            progress = '5.0';
                        } else {
                            progress = '3.current_q';
                        }
                    } else {  // nothing in 3.current_q
                        progress = (Object.keys(doc.data()['2']['current_q']).length == 2) ? '3.current_q' : '2.current_q';
                    }
                } else if ('1' in doc.data()) {
                    progress = '2.current_q';
                } else if ('past_q' in doc.data()['2']) {
                    let length0 = doc.data()['2']['past_q'][0]['names_in_dorm'].length;
                    let length1 = doc.data()['2']['past_q'][0]['names_outside'].length;
                    if ('4' in doc.data()) {
                        let length2 = Object.keys(doc.data()['2']['past_q']).length;
                        console.log(length0, length1, length2);
                        if ((length0 + length1) * (length0 + length1 - 1) / 2 == length2) {
                            progress = '1.current_q';
                        } else {
                            progress = '4.past_q';
                        }
                    } else if ('3' in doc.data() && 'past_q' in doc.data()['3']) {
                        let names = new Set();
                        Object.keys(doc.data()['3']['past_q']).forEach(item => names.add(item.split(' - ')[0]));
                        if (length0 + length1 == names.size) {
                            progress = '4.past_q';
                        } else {
                            progress = '3.past_q';
                        }
                    } else {
                        progress = '3.past_q';
                    }
                } else if ('initial' in doc.data()['2']) {
                    if (Object.keys(doc.data()['2']['initial']).length == 2) {
                        progress = '1.past_q';
                    } else {
                        progress = '2.initial';
                    }
                }
            } else if ('0' in doc.data()) {
                progress = '2.initial';
            } else {
                progress = '0';
            }
            console.log(progress);
            window.location.replace('survey.html?survey_id=' + fid + '&wing=' + dorm_wing + '&progress=' + progress);
        });
    });

    $('#refresh-btn').click(() => {
        location.reload();
    });

    // Firebase
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
    // sign in
    // firebase.auth().signInWithEmailAndPassword(user.email, user.pw).then(function () {
    firebase.auth().signInAnonymously().then(function () {
        db.collection(DB_INFO_COLLECTION).doc(fid).get().then((doc) => {
            if (!doc.data()) {
                $('body').empty();
                alert('Invalid web address. please double check or contact the experimenters.\n');
                return;
            }
            uid = doc.data().uid;
            dorm_wing = doc.data().dorm_wing;
            $('#info-check').append('<p>Your first name: <strong>' + doc.data().firstname + '</strong></p>')
            $('#info-check').append('<p>Your last name: <strong>' + doc.data().lastname + '</strong></p>')
            $('#info-check').append('<p>Your dorm room: <strong>' + doc.data().dorm + ' (' + doc.data().dorm_wing + ')</strong></p>')
            $('#info-check').append('<p>Your UID: <strong>' + uid + '</strong></p>')
            $('#info-check').append('<p>Your email: <strong>' + doc.data().email + '</strong></p>')
        })
        .catch(function(error) {
            // error
            alert('Failed to access the database, please check ' +
                  'your internet connection and try again.\n' + error);
            console.log(error);
        });
    })
    .catch(function(error) {
        // error
        alert('Failed to access database. Please check your internet connection and try again.\n' + error);
        console.log(error);
    });
    var timestamp = new Date();
});
