/**
 * FormValidation (https://formvalidation.io)
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import { ElementNotValidatedEvent, ElementValidatedEvent } from '../core/Core';
import Plugin from '../core/Plugin';

export default class AutoFocus extends Plugin<{}> {
    private invalidFormHandler: () => void;
    private elementValidatedHandler: (e: ElementValidatedEvent) => void;
    private elementNotValidatedHandler: (e: ElementNotValidatedEvent) => void;

    private invalidElements: HTMLElement[] = [];

    constructor() {
        super({});
        this.invalidFormHandler = this.onFormInvalid.bind(this);
        this.elementValidatedHandler = this.onElementValidated.bind(this);
        this.elementNotValidatedHandler = this.onElementNotValidated.bind(this);
    }

    public install(): void {
        this.core
            .on('core.form.invalid', this.invalidFormHandler)
            .on('core.element.validated', this.elementValidatedHandler)
            .on('core.element.notvalidated', this.elementNotValidatedHandler);
    }

    public uninstall(): void {
        this.invalidElements = [];
        this.core
            .off('core.form.invalid', this.invalidFormHandler)
            .off('core.element.validated', this.elementValidatedHandler)
            .off('core.element.notvalidated', this.elementNotValidatedHandler);
    }

    private onElementValidated(e: ElementValidatedEvent): void {
        const index = this.invalidElements.indexOf(e.element);
        if (e.valid && index >= 0) {
            this.invalidElements.splice(index, 1);
        } else if (!e.valid && index === -1) {
            this.invalidElements.push(e.element);
        }
    }

    private onElementNotValidated(e: ElementNotValidatedEvent): void {
        this.invalidElements.splice(this.invalidElements.indexOf(e.element), 1);
    }

    private onFormInvalid(): void {
        if (this.invalidElements.length) {
            // Focus on the first invalid element
            this.invalidElements[0].focus();
        }
    }
}
