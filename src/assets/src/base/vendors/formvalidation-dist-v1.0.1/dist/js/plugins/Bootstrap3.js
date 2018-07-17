/**
 * FormValidation (https://formvalidation.io), v1.0.1
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FormValidation = global.FormValidation || {}, global.FormValidation.plugins = global.FormValidation.plugins || {}, global.FormValidation.plugins.Bootstrap3 = factory());
}(this, (function () { 'use strict';

var classSet = FormValidation.utils.classSet

var hasClass = FormValidation.utils.hasClass

var Framework = FormValidation.plugins.Framework

class Bootstrap3 extends Framework {
    constructor(opts) {
        super(Object.assign({}, {
            formClass: 'fv-plugins-bootstrap3',
            messageClass: 'help-block',
            rowClasses: 'has-feedback',
            rowInvalidClass: 'has-error',
            rowPattern: /^(.*)(col|offset)-(xs|sm|md|lg)-[0-9]+(.*)$/,
            rowSelector: '.form-group',
            rowValidClass: 'has-success',
        }, opts));
    }
    onIconPlaced(e) {
        classSet(e.iconElement, {
            'form-control-feedback': true,
        });
        const parent = e.element.parentElement;
        if (hasClass(parent, 'input-group')) {
            parent.parentElement.insertBefore(e.iconElement, parent.nextSibling);
        }
        const type = e.element.getAttribute('type');
        if ('checkbox' === type || 'radio' === type) {
            const grandParent = parent.parentElement;
            if (hasClass(parent, type)) {
                parent.parentElement.insertBefore(e.iconElement, parent.nextSibling);
            }
            else if (hasClass(parent.parentElement, type)) {
                grandParent.parentElement.insertBefore(e.iconElement, grandParent.nextSibling);
            }
        }
    }
}

return Bootstrap3;

})));
