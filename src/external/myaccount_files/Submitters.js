function OpticksSubmitter(botDetectionOptions) {
    this.script = botDetectionOptions.options.script;

    this.submit = function (url, isBot, clickEvent) {
        opticks_notify(clickEvent, this._getSubmitCallback(url, isBot));
    };

    this.submitWithError = function (url, isBot) {
        this._getSubmitCallback(url, isBot)();
    };

    this.loadScript = function () {
        if (this.canBeSubmitted()) {
            eval(this.script);
        }
    };

    this.isScriptLoaded = function () {
        return typeof opticks_notify === "function";
    };

    this.canBeSubmitted = function () {
        return !!this.script;
    };

    this._getSubmitCallback = function (url, isBot) {
        return function () {
            let isGetParametersExists = (url.indexOf('?') !== -1);

            if (isGetParametersExists) {
                window.location.href = `${url}&isBot=${+isBot}`;
            } else {
                window.location.href = `${url}?isBot=${+isBot}`;
            }
        }
    }
}

function NoBotfilterSubmitter() {

    this.submit = function (url, isBot, clickEvent) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.alreadySubmitted) {
            return;
        }

        this.alreadySubmitted = true;
        window.location.href = url.trim();
    };

    this.submitWithError = function (url, isBot) {
        this._getSubmitCallback(url, isBot)();
    };

    this.loadScript = function () {
    };

    this.isScriptLoaded = function () {
        return true;
    };

    this.canBeSubmitted = function () {
        return true;
    };

    this._getSubmitCallback = function (url, isBot) {
        return function () {
            let isGetParametersExists = (url.indexOf('?') !== -1);

            if (isGetParametersExists) {
                window.location.href = `${url}&isBot=${+isBot}`;
            } else {
                window.location.href = `${url}?isBot=${+isBot}`;
            }
        }
    }
}

function EvinaSubmitter(botDetectionOptions) {
    this.script = botDetectionOptions.options.script;

    this.submit = function (url, isBot, clickEvent) {
        let isGetParametersExists = (url.indexOf('?') !== -1);

        if (isGetParametersExists) {
            window.location.href = `${url}&isBot=${+isBot}`;
        } else {
            window.location.href = `${url}?isBot=${+isBot}`;
        }

    };

    this.loadScript = function () {
        if (this.canBeSubmitted()) {
            eval(this.script);
        }
    };

    this.isScriptLoaded = function () {
        return typeof evina_notify === "function";
    }

    this.canBeSubmitted = function () {
        return !!this.script;
    }
}

function EmpelloSubmitter(botDetectionOptions) {
    this.scriptLoaded = false;
    this.loadScriptError = null;
    this.empelloToken = null;

    this.submit = function (url, isBot) {
        if (this.loadScriptError) {
            this.submitWithError(url, isBot);
            return;
        }

        const form = this._buildAndAppendForm(url, isBot);
        form.submit();
    };

    this.submitWithError = function (url, isBot) {
        const form = this._buildAndAppendForm(url, isBot);

        let errorInput = document.createElement('input');
        errorInput.setAttribute("type", "hidden");
        errorInput.setAttribute("name", "empello_script_error");
        errorInput.setAttribute("value", this.loadScriptError || 'script_loading_timeout');

        form.append(errorInput);
        form.submit();
    };

    this.loadScript = function () {
        const self = this;

        EmpelloInterface.configure({fraudStopLoadTimeout: 30000});

        EmpelloInterface.onFraudStopLoaded(function (statusCode) {
            if (statusCode === 201) {
                EmpelloInterface.getToken(function(token) {
                    self.empelloToken = token;
                });

                self.scriptLoaded = true;
            } else if (statusCode === 202) {
                EmpelloInterface.getToken({
                    success: function (token) {},
                    error: function (errors) {
                        self.loadScriptError = JSON.stringify(errors);
                    }
                });
            }
        });
    };

    this.isScriptLoaded = function () {
        return this.scriptLoaded || this.loadScriptError;
    };

    this.canBeSubmitted = function () {
        return !!($('#empello-script').length);
    };

    this._buildAndAppendForm = function (url, isBot) {
        const isBotInput = $('input').attr('type', 'hidden').attr('name', 'isBot').attr('value', isBot);

        let form = $('<form></form>').attr('action', url).attr('method', 'POST');
        form.append(isBotInput);
        $('body').append(form);

        if (this.empelloToken) {
            let tokenInput = document.createElement('input');
            tokenInput.setAttribute("type", "hidden");
            tokenInput.setAttribute("name", "token");
            tokenInput.setAttribute("value", this.empelloToken);

            form.append(tokenInput);
        }

        return form;
    }
}

function SubscribeSubmitter(botDetectionOptions) {
    this.alreadySubmitted = false;
    if (botDetectionOptions != null) {
        this.isEmpelloEnabled = botDetectionOptions.isEmpelloEnabled;
        this.isEvinaEnabled = botDetectionOptions.isEvinaEnabled;
        this.isOpticksEnabled = botDetectionOptions.isOpticksEnabled;
        this.isCheckOnVisit = botDetectionOptions.isCheckOnVisit;
    }
    this.submitter = null;

    this.createSubmitter = function () {
        if (this.isEmpelloEnabled && !this.isCheckOnVisit && botDetectionOptions != null) {
            this.submitter = new EmpelloSubmitter(botDetectionOptions);
        } else if (this.isEvinaEnabled && !this.isCheckOnVisit && botDetectionOptions != null) {
            this.submitter = new EvinaSubmitter(botDetectionOptions);
        } else if (this.isOpticksEnabled && !this.isCheckOnVisit && botDetectionOptions != null) {
            this.submitter = new OpticksSubmitter(botDetectionOptions);
        } else {
            this.submitter = new NoBotfilterSubmitter()
        }

        if (this.submitter) {
            this.submitter.loadScript();
        }

        return this;
    };

    this.submit = async function (url, isBot, clickEvent) {
        url = url.trim();

        if (this.alreadySubmitted) {
            return;
        }

        this.alreadySubmitted = true;

        if (this.submitter && this.submitter.canBeSubmitted()) {
            for (let i = 0; i < 14; i++) {
                if (this.submitter.isScriptLoaded()) {
                    this.submitter.submit(url, isBot, clickEvent);
                    return;
                }

                await this._sleep(500);
            }

            this.submitter.submitWithError(url, isBot);

            return;
        }

        this._submitDefault(url, isBot);
    };

    this._submitDefault = function (url, isBot) {
        let isGetParametersExists = (url.indexOf('?') !== -1);

        if (isGetParametersExists) {
            window.location.href = `${url}&isBot=${+isBot}`;
        } else {
            window.location.href = `${url}?isBot=${+isBot}`;
        }
    };

    this._sleep = function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    };
}