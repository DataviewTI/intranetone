
/**
 * FormValidation (https://formvalidation.io)
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FormValidation = global.FormValidation || {}, global.FormValidation.plugins = global.FormValidation.plugins || {}, global.FormValidation.plugins.Bootstrap4 = factory());
}(this, (function () { 'use strict';

var classSet = FormValidation.utils.classSet

var hasClass = FormValidation.utils.hasClass

var Framework = FormValidation.plugins.Framework

class Bootstrap4 extends Framework {
    constructor(opts) {
        super(Object.assign({}, {
            formClass: 'fv-plugins-bootstrap4',
            messageClass: 'form-control-feedback',
            rowInvalidClass: 'has-danger',
            rowPattern: /^(.*)(col|offset)(-(sm|md|lg|xl))*-[0-9]+(.*)$/,
            rowSelector: '.form-group',
            rowValidClass: 'has-success',
        }, opts));
    }
    onIconPlaced(e) {
        const parent = e.element.parentElement;
        if (hasClass(parent, 'input-group')) {
            parent.parentElement.insertBefore(e.icon, parent.nextSibling);
        }
        const type = e.element.getAttribute('type');
        if ('checkbox' === type || 'radio' === type) {
            const grandParent = parent.parentElement;
            if (hasClass(parent, 'form-check')) {
                classSet(e.icon, {
                    'fv-plugins-icon-check': true,
                });
                parent.parentElement.insertBefore(e.icon, parent.nextSibling);
            }
            else if (hasClass(parent.parentElement, 'form-check')) {
                classSet(e.icon, {
                    'fv-plugins-icon-check': true,
                });
                grandParent.parentElement.insertBefore(e.icon, grandParent.nextSibling);
            }
        }
    }
}

return Bootstrap4;

})));
