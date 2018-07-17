/**
 * FormValidation (https://formvalidation.io), v1.0.1
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FormValidation = global.FormValidation || {}, global.FormValidation.plugins = global.FormValidation.plugins || {}, global.FormValidation.plugins.Spectre = factory());
}(this, (function () { 'use strict';

var classSet = FormValidation.utils.classSet

var hasClass = FormValidation.utils.hasClass

var Framework = FormValidation.plugins.Framework

class Spectre extends Framework {
    constructor(opts) {
        super(Object.assign({}, {
            formClass: 'fv-plugins-spectre',
            messageClass: 'form-input-hint',
            rowInvalidClass: 'has-error',
            rowPattern: /^(.*)(col)(-(xs|sm|md|lg))*-[0-9]+(.*)$/,
            rowSelector: '.form-group',
            rowValidClass: 'has-success',
        }, opts));
    }
    onIconPlaced(e) {
        const type = e.element.getAttribute('type');
        const parent = e.element.parentElement;
        if ('checkbox' === type || 'radio' === type) {
            classSet(e.iconElement, {
                'fv-plugins-icon-check': true,
            });
            if (hasClass(parent, `form-${type}`)) {
                parent.parentElement.insertBefore(e.iconElement, parent.nextSibling);
            }
        }
    }
}

return Spectre;

})));
