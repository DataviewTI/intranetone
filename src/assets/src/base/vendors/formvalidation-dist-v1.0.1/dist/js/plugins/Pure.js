/**
 * FormValidation (https://formvalidation.io), v1.0.1
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FormValidation = global.FormValidation || {}, global.FormValidation.plugins = global.FormValidation.plugins || {}, global.FormValidation.plugins.Pure = factory());
}(this, (function () { 'use strict';

var classSet = FormValidation.utils.classSet

var Framework = FormValidation.plugins.Framework

class Pure extends Framework {
    constructor(opts) {
        super(Object.assign({}, {
            formClass: 'fv-plugins-pure',
            messageClass: 'fv-help-block',
            rowInvalidClass: 'fv-has-error',
            rowPattern: /^.*pure-control-group.*$/,
            rowSelector: '.pure-control-group',
            rowValidClass: 'fv-has-success',
        }, opts));
    }
    onIconPlaced(e) {
        const type = e.element.getAttribute('type');
        if ('checkbox' === type || 'radio' === type) {
            const parent = e.element.parentElement;
            classSet(e.iconElement, {
                'fv-plugins-icon-check': true,
            });
            if ('LABEL' === parent.tagName) {
                parent.parentElement.insertBefore(e.iconElement, parent.nextSibling);
            }
        }
    }
}

return Pure;

})));
