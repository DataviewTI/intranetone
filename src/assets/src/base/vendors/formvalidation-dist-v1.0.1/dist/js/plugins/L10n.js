/**
 * FormValidation (https://formvalidation.io), v1.0.1
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FormValidation = global.FormValidation || {}, global.FormValidation.plugins = global.FormValidation.plugins || {}, global.FormValidation.plugins.L10n = factory());
}(this, (function () { 'use strict';

var Plugin = FormValidation.Plugin

class L10n extends Plugin {
    constructor(opts) {
        super(opts);
        this.messageFilter = this.getMessage.bind(this);
    }
    install() {
        this.core.registerFilter('validator-message', this.messageFilter);
    }
    uninstall() {
        this.core.deregisterFilter('validator-message', this.messageFilter);
    }
    getMessage(locale, field, validator) {
        if (this.opts[field] && this.opts[field][validator]) {
            const message = this.opts[field][validator];
            const messageType = typeof message;
            if ('object' === messageType && message[locale]) {
                return message[locale];
            }
            else if ('function' === messageType) {
                const result = message.apply(this, [field, validator]);
                return (result && result[locale]) ? result[locale] : '';
            }
        }
        return '';
    }
}

return L10n;

})));
