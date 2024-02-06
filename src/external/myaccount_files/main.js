$(document).ready(function () {
    $('.category-back-button').on('click', function () {
        window.history.back();
    });

    (function () {
        const offer = $('.without-zero-at-the-price-end');

        if (offer.length > 0) {
            let offerText = offer.text();

            let currentPrice = offerText.match(/[\d\.]+/);
            let priceWithoutZeroAtEnd = parseFloat(currentPrice);

            offer.text(offerText.replace(currentPrice, priceWithoutZeroAtEnd));
        }
    })();

    $('.favorite-poster-container').on('click', function () {
        window.location.href = $(this).find('a').first().attr('href');
    });

    $('a.target_blank').on('click', function (event) {
        event.preventDefault();

        window.open($(this).attr('href'), '_blank');
    })

    $(sidebar.openSidebarSelector).on('click', function () {
        sidebar.openSidebar();
    });

    $(sidebar.closeSidebarSelector).on('click', function (event) {
        sidebar.closeSidebar();
    });

    $.fancyConfirm = function (opts) {
        $.fancybox.close(true);
        opts = $.extend(true, {
            title        : 'Are you sure?',
            message      : '',
            okButton     : 'Yes',
            noButton     : 'No',
            okButtonClass: '',
            noButtonClass: 'button-gray bg-gray',
            callback     : $.noop,
            clickOutside : "close",
            clickSlide   : "close",
        }, opts || {});

        $.fancybox.open({
            type: 'html',
            src :
                '<div class="fc-content">' +
                '<h3 class="text-center">' + opts.title + '</h3>' +
                '<p class="text-center">' + opts.message + '</p>' +
                '<div class="d-flex align-self-center align-items-center justify-content-between">' +
                '<a href="#" class="' + opts.noButtonClass + ' button button-main pl-5 pr-5 button-confirm__no" data-value="0" data-fancybox-close>' + opts.noButton + '</a>' +
                '<button data-value="1" data-fancybox-close class="' + opts.okButtonClass + ' button button-main bg-secondary pl-5 pr-5 button-confirm__yes">' + opts.okButton + '</button>' +
                '</div>' +
                '</div>',

            opts: {
                animationDuration: 350,
                animationEffect  : 'material',
                modal            : false,
                baseTpl          :
                    '<div class="fancybox-container fc-container" role="dialog" tabindex="-1">' +
                    '<div class="fancybox-bg"></div>' +
                    '<div class="fancybox-inner">' +
                    '<div class="fancybox-stage"></div>' +
                    '</div>' +
                    '</div>',
                beforeClose      : function (instance, current, e) {
                    var button = e ? e.target || e.currentTarget : null;
                    var value  = button ? $(button).data('value') : 0;

                    opts.callback(value);
                }
            },
        });
    };

    $.fancyAlert = function (opts) {
        $.fancybox.close(true);

        opts = $.extend(true, {
            title    : "Success",
            message  : "",
            closeText: "Close",
            reload   : false
        }, opts || {});

        $.fancybox.open({
            type      : 'html',
            src       :
                '<div class="fc-content">' +
                '<h3 class="text-center">' + opts.title + '</h3>' +
                '<p class="text-center">' + opts.message + '</p>' +
                '<div class="d-flex align-self-center align-items-center justify-content-center">' +
                '<a href="#" class="button-main button-popup button-confirm" data-value="0" data-fancybox-close>' + opts.closeText + '</a>' +
                '</div>' +
                '</div>',
            afterClose: function () {
                if (opts.reload === true) {
                    location.reload();
                    return;
                }

                if (opts.callback) {
                    opts.callback();
                }

            }
        });
    }

    $.fancyForm = function (opts) {
        $.fancybox.close(true);

        $.fancybox.open({
            type: 'html',
            src: opts.html,
            afterClose: function () {
                if (opts.reload === true) {
                    location.reload();
                    return;
                }

                if (opts.callback) {
                    opts.callback();
                }

            }
        });
    }
});

let sidebar = {
    mainSidebarSelector: '.main-sidebar',

    openSidebarSelector: '#sidebar-open-button',
    closeSidebarSelector: '.main-sidebar-close-button',

    mainCategorySelector: '.main-sidebar-category-button',

    openSidebar: function () {
        $(this.mainSidebarSelector).addClass('main-sidebar-active');
        $(this.mainSidebarSelector).css('opacity', 1);
    },

    closeSidebar: function () {
        $(this.mainSidebarSelector).removeClass('main-sidebar-active');
        let transitionDuration = parseFloat($(this.mainSidebarSelector).css('transition-duration')) * 1000;

        setTimeout(() => $(this.mainSidebarSelector).css('opacity', 0), transitionDuration);
    }
};

function showAlert(cnfg) {
    $.fancyAlert(cnfg);
}

function initReminderInPopup(path){
    $('#send-reminder').click(function () {
        $.ajax({
            url     : path,
            method  : 'GET',
            complete: function () {
                $('.fc-content .button-confirm').click();
            }
        })
    })
}

function showConfirmPopup(cnfg) {
    return new Promise(function (resolve, reject) {
        var opts = $.extend(true, {
            title       : 'Are you sure?',
            message     : '',
            okButton    : 'Yes',
            noButton    : 'No',
            clickOutside: "close",
            clickSlide  : "close",
            callback    : function (value) {
                if (value) {
                    resolve();
                } else {
                    reject();
                }
            }
        }, cnfg || {});

        $.fancyConfirm(opts);
    });
}

$._loader = function (close) {
    var loaderObj   = $('#_loader');
    var loaderHtml  = '<div id="_loader"><div id="_loader__fill"></div><span id="_loader__roll"></span></div>';
    var loaderExist = loaderObj.length;

    if (loaderExist > 0) {
        if (close === undefined) {
            loaderObj.remove();
        } else if (close === true) {
            loaderObj.remove();
        }
    } else {
        $('body').append(loaderHtml);
    }
};

$._timedLoader = function (time = 1000) {
    $._loader();
    setTimeout(() => $._loader(true), time);
}

function performCookieEnabledCheck(cookiePageUrl) {
    if (!navigator.cookieEnabled) {
        redirectTo(cookiePageUrl)
    }
}


function redirectTo(url) {
    setTimeout(function () {
        var a = window.document.createElement("a");
        if (a.click) {
            // HTML5 browsers and IE support click() on <a>, early FF does not.
            a.setAttribute("href", url);
            a.style.display = "none";
            window.document.body.appendChild(a);
            a.click();
        } else {
            // Early FF can, however, use this usual method
            // where IE cannot with secure links.
            window.location = url;
        }
    }, 0)
}

function updateCookiesDisclaimer(text) {
    $('.cookies-disclaimer-body > span').html(text);
}

// [START] for identification by phone number popUp

const clearForm         = (form) => $(form).find('.inputError').empty();
const hasResponseError  = (response) => typeof response.message !== 'undefined';
const showError         = (errorId) => ($('#' + errorId).length) ? $('#' + errorId).show() : $('#unknown_error').show();
const responseResolver  = function (response, form) {
    if (response.success) {
        if (typeof response.url !== 'undefined') {
            redirectTo(response.url);
        }

        location.reload();
        return;
    }

    if (hasResponseError(response))
        showError(response.message);
    else
        showError('unknown_error');
}

function sendIdentPhoneForm(form) {

    const actionUrl = $(form).attr('action');
    if (!actionUrl) {
        return false;
    }

    clearForm(form);

    $.ajax({
        url        : actionUrl,
        method     : "POST",
        data       : $(form).serialize(),
        beforeSend : () => $._loader(),
        success    : response => responseResolver(response, form),
        error      : response => () => {
            if (hasResponseError(response))
                showError(response.message)
        },
        complete: () => $._loader(true)
    });
}