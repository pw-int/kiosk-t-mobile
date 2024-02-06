$(document).ready(function () {
    let cfg = {
        title        : TwigData.translate('messages.action.unsubscribe.confirm'),
        message      : "",
        okButton     : TwigData.translate('buttons.yes'),
        noButton     : TwigData.translate('buttons.no'),
        noButtonClass: '',
        okButtonClass: ''
    }

    let unsuccessfulUnsubscription = function (msg) {
        $._loader(true)
        $.fancyAlert({
            title: JSON.parse(msg.responseText).data.message,
            closeText: TwigData.translate('messages.action.unsubscribe.button.close'),
        })
    }

    let unsubscriptionConfirmation = function () {
        $._loader(true)
        showAlert({
            title    : TwigData.translate('messages.action.unsubscribe.confirmation.1'),
            message  : TwigData.translate('messages.action.unsubscribe.confirmation.2'),
            closeText: TwigData.translate('messages.action.unsubscribe.button.close'),
            reload   : false,
            callback : function () {
                window.location = TwigData.url('home')
            }
        })
    }

    $('[data-action="unsubscribe"]').click(function () {
        showConfirmPopup(cfg)
            .then(function () {
                $._loader(false)
                $.ajax(TwigData.path('subscription.unsubscribe'))
                    .done(function (data) {
                        if (data.redirectUrl) {
                            window.location = data.redirectUrl;
                        }
                        unsubscriptionConfirmation()
                    })
                    .fail(
                        function (msg) {
                            unsuccessfulUnsubscription(msg)
                        }
                    )
            })
    })

    $('[data-action="ais-unsubscribe"]').click(function () {
        showConfirmPopup(cfg)
            .then(function () {
                window.location.href = 'sms:4541117?body=STOP KK'
            }, () => {})
    })

    $('[data-action="async-unsubscribe"]').click(function () {
        let attempts = 20
        let i = 0

        let sendUnsubStatusCheckRequest = function () {
            if (attempts && i > attempts) {
                window.location.href = TwigData.path('account')
                return
            }

            i++;
            $.ajax(TwigData.path('unsub_callback_status'))
                .done(function (response) {
                    if (response.result === 'success') {
                        unsubscriptionConfirmation()
                    }

                    if (response.result === 'reattempt') {
                        setTimeout(sendUnsubStatusCheckRequest, 3000)
                    }

                    if (response.result === 'error') {
                        window.location.href = response.failureUrl
                    }
                })
                .fail(function () {
                    setTimeout(sendUnsubStatusCheckRequest, 3000)
                })
        }

        showConfirmPopup(cfg)
            .then(function () {
                $._loader(false)

                $.ajax(TwigData.path('subscription.unsubscribe'))
                    .done(function () {
                        sendUnsubStatusCheckRequest()

                    })
                    .fail(function (msg) {
                        unsuccessfulUnsubscription(msg)
                    })
            })

    })
})