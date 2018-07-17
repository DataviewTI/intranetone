/**
 * FormValidation (https://formvalidation.io), v1.0.1
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FormValidation = global.FormValidation || {}, global.FormValidation.plugins = global.FormValidation.plugins || {}, global.FormValidation.plugins.Bulma = factory());
}(this, (function () { 'use strict';

var classSet = FormValidation.utils.classSet

var Framework = FormValidation.plugins.Framework

class Bulma extends Framework {
    constructor(opts) {
        super(Object.assign({}, {
            formClass: 'fv-plugins-bulma',
            messageClass: 'help is-danger',
            rowInvalidClass: 'fv-has-error',
            rowPattern: /^.*field.*$/,
            rowSelector: '.field',
            rowValidClass: 'fv-has-success',
        }, opts));
    }
    onIconPlaced(e) {
        classSet(e.iconElement, {
            'fv-plugins-icon': false,
        });
        const span = document.createElement('span');
        span.setAttribute('class', 'icon is-small is-right');
        e.iconElement.parentNode.insertBefore(span, e.iconElement);
        span.appendChild(e.iconElement);
        const type = e.element.getAttribute('type');
        const parent = e.element.parentElement;
        if ('checkbox' === type || 'radio' === type) {
            classSet(parent.parentElement, {
                'has-icons-right': true,
            });
            classSet(span, {
                'fv-plugins-icon-check': true,
            });
            parent.parentElement.insertBefore(span, parent.nextSibling);
        }
        else {
            classSet(parent, {
                'has-icons-right': true,
            });
        }
    }
}

return Bulma;

})));
