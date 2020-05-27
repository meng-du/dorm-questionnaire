'use strict';

jQuery(document).ready(function() {
    $('#copied').hide();
    if (window.location.search.substring(1).length > 0) {
        let completed = window.location.search.substring(1).split(/[&=]/)[1];
        console.log(completed);
        if ((Date.now() - parseInt(completed)) / 60000 > 720) {  // more than 12 hrs
            $('#end-survey').hide();
        }
    } else {
        $('#end-survey').hide();
    }

    $('#copy-btn').click(() => {
        var copyText = document.getElementById('link');
        copyText.select();
        copyText.setSelectionRange(0, 99999);  // For mobile devices
        document.execCommand('copy');
        $('#copied').show();
        setTimeout(() => $('#copied').hide(), 7000);
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
        db.collection('count').doc('count').get().then((doc) => {
            let count = doc.data().count;
            let percent = Math.floor(count/194 * 100);
            $('#bar').css('width', percent + '%').attr('aria-valuenow', percent);
            $('#bar').text(percent + '% of your floor have completed');
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
        window.location.replace('progress.html');  // refresh page
        console.log(error);
    });

});
