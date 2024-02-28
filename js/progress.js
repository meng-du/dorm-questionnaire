'use strict';

jQuery(document).ready(function() {
    let param = window.location.search.substring(1).split(/[&=]/)[1];
    $('#link').val('https://meng-du.github.io/dorm-questionnaire/login.html?l=' + param);

    $('#copied').hide();
    if (window.location.search.substring(1).length == 0) {
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
});
