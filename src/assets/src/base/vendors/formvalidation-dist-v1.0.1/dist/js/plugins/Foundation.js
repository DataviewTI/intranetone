/**
 * FormValidation (https://formvalidation.io), v1.0.1
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FormValidation = global.FormValidation || {}, global.FormValidation.plugins = global.FormValidation.plugins || {}, global.FormValidation.plugins.Foundation = factory());
}(this, (function () { 'use strict';

var Framework = FormValidation.plugins.Framework

class Foundation extends Framework {
    constructor(opts) {
        super(Object.assign({}, {
            formClass: 'fv-plugins-foundation',
            messageClass: 'form-error',
            rowInvalidClass: 'fv-row__error',
            rowPattern: /^.*((small|medium|large)-[0-9]+)\s.*(cell).*$/,
            rowSelector: '.grid-x',
            rowValidClass: 'fv-row__success',
        }, opts));
    }
    onIconPlaced(e) {
        const type = e.element.getAttribute('type');
        if ('checkbox' === type || 'radio' === type) {
            const nextEle = e.iconElement.nextSibling;
            if ('LABEL' === nextEle.nodeName) {
                nextEle.parentNode.insertBefore(e.iconElement, nextEle.nextSibling);
            }
            else if ('#text' == nextEle.nodeName) {
                const next = nextEle.nextSibling;
                if (next && 'LABEL' === next.nodeName) {
                    next.parentNode.insertBefore(e.iconElement, next.nextSibling);
                }
            }
        }
    }
}

return Foundation;

})));
