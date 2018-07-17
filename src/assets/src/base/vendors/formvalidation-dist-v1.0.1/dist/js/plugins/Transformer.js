/**
 * FormValidation (https://formvalidation.io), v1.0.1
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FormValidation = global.FormValidation || {}, global.FormValidation.plugins = global.FormValidation.plugins || {}, global.FormValidation.plugins.Transformer = factory());
}(this, (function () { 'use strict';

var Plugin = FormValidation.Plugin

class Transformer extends Plugin {
    constructor(opts) {
        super(opts);
        this.valueFilter = this.getElementValue.bind(this);
    }
    install() {
        this.core.registerFilter('field-value', this.valueFilter);
    }
    uninstall() {
        this.core.deregisterFilter('field-value', this.valueFilter);
    }
    getElementValue(defaultValue, field, element, validator) {
        if (this.opts[field] && this.opts[field][validator] && 'function' === typeof this.opts[field][validator]) {
            return this.opts[field][validator].apply(this, [field, element, validator]);
        }
        return defaultValue;
    }
}

return Transformer;

})));
