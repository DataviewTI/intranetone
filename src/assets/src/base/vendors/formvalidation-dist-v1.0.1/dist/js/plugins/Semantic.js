/**
 * FormValidation (https://formvalidation.io), v1.0.1
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FormValidation = global.FormValidation || {}, global.FormValidation.plugins = global.FormValidation.plugins || {}, global.FormValidation.plugins.Semantic = factory());
}(this, (function () { 'use strict';

var classSet = FormValidation.utils.classSet

var hasClass = FormValidation.utils.hasClass

var Framework = FormValidation.plugins.Framework

class Semantic extends Framework {
    constructor(opts) {
        super(Object.assign({}, {
            formClass: 'fv-plugins-semantic',
            messageClass: 'ui pointing red basic label',
            rowInvalidClass: 'error',
            rowPattern: /^.*(field|column).*$/,
            rowSelector: '.fields',
            rowValidClass: 'fv-has-success',
        }, opts));
        this.messagePlacedHandler = this.onMessagePlaced.bind(this);
    }
    install() {
        super.install();
        this.core.on('plugins.message.placed', this.messagePlacedHandler);
    }
    uninstall() {
        super.uninstall();
        this.core.off('plugins.message.placed', this.messagePlacedHandler);
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
    onMessagePlaced(e) {
        const type = e.element.getAttribute('type');
        const numElements = e.elements.length;
        if (('checkbox' === type || 'radio' === type) && numElements > 1) {
            const last = e.elements[numElements - 1];
            const parent = last.parentElement;
            if (hasClass(parent, type) && hasClass(parent, 'ui')) {
                parent.parentElement.insertBefore(e.messageElement, parent.nextSibling);
            }
        }
    }
}

return Semantic;

})));
