/**
 * FormValidation (https://formvalidation.io), v1.0.1
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FormValidation = global.FormValidation || {}, global.FormValidation.plugins = global.FormValidation.plugins || {}, global.FormValidation.plugins.Uikit = factory());
}(this, (function () { 'use strict';

var classSet = FormValidation.utils.classSet

var Framework = FormValidation.plugins.Framework

class Uikit extends Framework {
    constructor(opts) {
        super(Object.assign({}, {
            formClass: 'fv-plugins-uikit',
            messageClass: 'uk-text-danger',
            rowInvalidClass: 'uk-form-danger',
            rowPattern: /^.*(uk-form-controls|uk-width-[\d+]-[\d+]).*$/,
            rowSelector: '.uk-margin',
            rowValidClass: 'uk-form-success',
        }, opts));
    }
    onIconPlaced(e) {
        const type = e.element.getAttribute('type');
        if ('checkbox' === type || 'radio' === type) {
            const parent = e.element.parentElement;
            classSet(e.iconElement, {
                'fv-plugins-icon-check': true,
            });
            parent.parentElement.insertBefore(e.iconElement, parent.nextSibling);
        }
    }
}

return Uikit;

})));
