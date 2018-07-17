/**
 * FormValidation (https://formvalidation.io), v1.0.1
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FormValidation = global.FormValidation || {}, global.FormValidation.plugins = global.FormValidation.plugins || {}, global.FormValidation.plugins.Recaptcha = factory());
}(this, (function () { 'use strict';

var Plugin = FormValidation.Plugin

var Status;
(function (Status) {
    Status["Invalid"] = "Invalid";
    Status["NotValidated"] = "NotValidated";
    Status["Valid"] = "Valid";
    Status["Validating"] = "Validating";
})(Status || (Status = {}));
var Status$1 = Status;

class Recaptcha extends Plugin {
    constructor(opts) {
        super(opts);
        this.widgetIds = new Map();
        this.opts = Object.assign({}, Recaptcha.DEFAULT_OPTIONS, opts);
        this.fieldResetHandler = this.onResetField.bind(this);
    }
    install() {
        this.core.on('core.field.reset', this.fieldResetHandler);
        const loadPrevCaptcha = (typeof window[Recaptcha.LOADED_CALLBACK] === 'undefined')
            ? () => { }
            : window[Recaptcha.LOADED_CALLBACK];
        window[Recaptcha.LOADED_CALLBACK] = () => {
            loadPrevCaptcha();
            const captchaOptions = {
                callback: (response) => {
                    this.core.updateFieldStatus(Recaptcha.CAPTCHA_FIELD, Status$1.Valid);
                    setTimeout(() => {
                        this.core.updateFieldStatus(Recaptcha.CAPTCHA_FIELD, Status$1.Invalid);
                    }, this.opts.timeout * 1000);
                },
                sitekey: this.opts.siteKey,
                stoken: this.opts.secureToken || null,
                theme: this.opts.theme,
            };
            const widgetId = window['grecaptcha'].render(this.opts.element, captchaOptions);
            this.widgetIds.set(this.opts.element, widgetId);
            setTimeout(() => {
                this.core.addField(Recaptcha.CAPTCHA_FIELD, {
                    validators: {
                        callback: {
                            callback: (input) => {
                                return input.value !== '';
                            },
                            message: this.opts.message,
                        },
                    },
                });
            }, 3000);
        };
        const src = this.getScript();
        if (!document.body.querySelector(`script[src="${src}"]`)) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.defer = true;
            script.src = src;
            document.body.appendChild(script);
        }
    }
    uninstall() {
        this.core.off('core.field.reset', this.fieldResetHandler);
        this.widgetIds.clear();
        const src = this.getScript();
        const scripts = [].slice.call(document.body.querySelectorAll(`script[src="${src}"]`));
        scripts.forEach((s) => s.parentNode.removeChild(s));
        this.core.removeField(Recaptcha.CAPTCHA_FIELD);
    }
    getScript() {
        const lang = this.opts.language ? `&hl=${this.opts.language}` : '';
        return `https://www.google.com/recaptcha/api.js?onload=${Recaptcha.LOADED_CALLBACK}&render=explicit${lang}`;
    }
    onResetField(e) {
        if (e.field === Recaptcha.CAPTCHA_FIELD && this.widgetIds.has(this.opts.element)) {
            const widgetId = this.widgetIds.get(this.opts.element);
            window['grecaptcha'].reset(widgetId);
        }
    }
}
Recaptcha.DEFAULT_ID = 'Recaptcha';
Recaptcha.CAPTCHA_FIELD = 'g-recaptcha-response';
Recaptcha.DEFAULT_OPTIONS = {
    theme: 'light',
    timeout: 2 * 60,
};
Recaptcha.LOADED_CALLBACK = '___reCaptchaLoaded___';

return Recaptcha;

})));
