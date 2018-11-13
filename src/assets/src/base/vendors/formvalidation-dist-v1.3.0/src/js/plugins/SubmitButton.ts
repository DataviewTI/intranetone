/**
 * FormValidation (https://formvalidation.io)
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import Plugin from '../core/Plugin';

export interface SubmitButtonOptions {
    selector: string;
}

export default class SubmitButton extends Plugin<SubmitButtonOptions> {
    private submitHandler: EventListener;

    constructor(opts?: SubmitButtonOptions) {
        super(opts);
        this.opts = Object.assign({}, {
            // Don't perform validation when clicking on the submit button/input which have `formnovalidate` attribute
            selector: '[type="submit"]:not([formnovalidate])',
        }, opts);

        this.submitHandler = this.submitHandle.bind(this);
    }

    public install(): void {
        if (!(this.core.getFormElement() instanceof HTMLFormElement)) {
            return;
        }
        const form = this.core.getFormElement() as HTMLFormElement;

        // Disable client side validation in HTML 5
        form.setAttribute('novalidate', 'novalidate');

        // Disable the default submission first
        form.addEventListener('submit', this.submitHandler);

        // When pressing Enter on any field in the form, the first submit button will do its job.
        // The form then will be submitted.
        // I create a first hidden submit button
        const hiddenButton = document.createElement('button');
        hiddenButton.setAttribute('type', 'submit');

        Object.assign(hiddenButton.style, {
            display: 'none',
            height: '0',
            width: '0',
        });

        form.appendChild(hiddenButton);

        const selectorButtons = [].slice.call(form.querySelectorAll(this.opts.selector)) as Element[];
        const submitButtons = [].slice.call(form.querySelectorAll('[type="submit"]')) as Element[];
        submitButtons.forEach((button) => {
            button.addEventListener('click', (e: Event) => {
                const target = e.currentTarget;
                // Check if the button click handler returns `false`
                if (!e.defaultPrevented && (target instanceof HTMLElement)
                    // Don't perform validation when clicking on the submit button/input which
                    // aren't defined by the the `opts.selector` option
                    && (selectorButtons.indexOf(target) === -1)
                    && target !== hiddenButton
                ) {
                    form.removeEventListener('submit', this.submitHandler);
                    form.submit();

                    // Fix the issue where `formnovalidate` causes IE to send two postbacks to server
                    return false;
                }
            });
        });
    }

    public uninstall(): void {
        const form = this.core.getFormElement();
        if (form instanceof HTMLFormElement) {
            form.removeEventListener('submit', this.submitHandler);
        }
    }

    private submitHandle(e: Event): void {
        e.preventDefault();
        this.core.validate();
    }
}
