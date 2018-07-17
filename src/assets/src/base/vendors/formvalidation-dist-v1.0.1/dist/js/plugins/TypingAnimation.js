/**
 * FormValidation (https://formvalidation.io), v1.0.1
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FormValidation = global.FormValidation || {}, global.FormValidation.plugins = global.FormValidation.plugins || {}, global.FormValidation.plugins.TypingAnimation = factory());
}(this, (function () { 'use strict';

var Plugin = FormValidation.Plugin

class TypingAnimation extends Plugin {
    constructor(opts) {
        super(opts);
        this.opts = Object.assign({}, {
            autoPlay: true,
        }, opts);
    }
    install() {
        this.fields = Object.keys(this.core.getFields());
        if (this.opts.autoPlay) {
            this.play();
        }
    }
    play() {
        return this.animate(0);
    }
    animate(fieldIndex) {
        if (fieldIndex >= this.fields.length) {
            return Promise.resolve(fieldIndex);
        }
        const field = this.fields[fieldIndex];
        const ele = this.core.getElements(field)[0];
        const inputType = ele.getAttribute('type');
        const samples = this.opts.data[field];
        if ('checkbox' === inputType || 'radio' === inputType) {
            ele.setAttribute('checked', 'true');
            return this.core.revalidateField(field).then((status) => {
                return this.animate(fieldIndex + 1);
            });
        }
        else if (!samples) {
            return this.animate(fieldIndex + 1);
        }
        else {
            return new Promise((resolve) => {
                return new Typed(ele, {
                    attr: 'value',
                    autoInsertCss: true,
                    bindInputFocusEvents: true,
                    onComplete: () => {
                        resolve(fieldIndex + 1);
                    },
                    onStringTyped: (arrayPos, self) => {
                        this.core.revalidateField(field);
                    },
                    strings: samples,
                    typeSpeed: 100,
                });
            }).then((nextFieldIndex) => {
                return this.animate(nextFieldIndex);
            });
        }
    }
}

return TypingAnimation;

})));
