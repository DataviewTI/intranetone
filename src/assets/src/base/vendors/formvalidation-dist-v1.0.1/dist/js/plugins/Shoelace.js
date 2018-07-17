/**
 * FormValidation (https://formvalidation.io), v1.0.1
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FormValidation = global.FormValidation || {}, global.FormValidation.plugins = global.FormValidation.plugins || {}, global.FormValidation.plugins.Shoelace = factory());
}(this, (function () { 'use strict';

var classSet = FormValidation.utils.classSet

var Framework = FormValidation.plugins.Framework

class Shoelace extends Framework {
    constructor(opts) {
        super(Object.assign({}, {
            formClass: 'fv-plugins-shoelace',
            messageClass: 'fv-help-block',
            rowInvalidClass: 'input-invalid',
            rowPattern: /^(.*)(col|offset)-[0-9]+(.*)$/,
            rowSelector: '.input-field',
            rowValidClass: 'input-valid',
        }, opts));
    }
    onIconPlaced(e) {
        const parent = e.element.parentElement;
        const type = e.element.getAttribute('type');
        if ('checkbox' === type || 'radio' === type) {
            classSet(e.iconElement, {
                'fv-plugins-icon-check': true,
            });
            if ('LABEL' === parent.tagName) {
                parent.parentElement.insertBefore(e.iconElement, parent.nextSibling);
            }
        }
    }
}

return Shoelace;

})));
