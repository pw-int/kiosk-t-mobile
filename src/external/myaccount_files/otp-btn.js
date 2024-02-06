performCookieEnabledCheck(TwigData.url('wrong_cookie_disabled'));

function firstClickOtpBtn(translate) {
    let otpBtn = $('.x-otp-button');
    if (otpBtn.is('a')) {
        otpBtn.each((key, el) => {
            $(el).removeClass('x-otp-button')
                .addClass('x-subscribe-button')
                .find('button, div').html('<span>' + translate + '</span>');
        });
    } else if (otpBtn.is('button') || otpBtn.is('div')) {
        otpBtn.each((key, el) => {
            $(el).removeClass('x-otp-button')
                .addClass('x-subscribe-button')
                .html('<span>' + translate + '</span>');
        });
    }
}
