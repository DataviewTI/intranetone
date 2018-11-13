/**
 * FormValidation (https://formvalidation.io)
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import { FieldOptions, FieldsOptions } from '../core/Core';
import Plugin from '../core/Plugin';

export interface DeclarativeOptions {
    // Set it to `true` to enable the validators automatically based on the input type or particular HTML 5 attributes:
    //  -----------------+---------------------
    //  HTML 5 attribute | Equivalent validator
    //  -----------------+---------------------
    //  max="..."        | lessThan
    //  min="..."        | greaterThan
    //  maxlength="..."  | stringLength
    //  minlength="..."  | stringLength
    //  pattern="..."    | regexp
    //  required         | notEmpty
    //  type="color"     | color
    //  type="email"     | emailAddress
    //  type="range"     | between
    //  type="url"       | uri
    //  -----------------+---------------------
    // It's not enabled by default
    html5Input?: boolean;
    // The prefix of attributes. By default, it is set to `data-fv-`
    prefix?: string;
}

/**
 * This plugin provides the ability of declaring validator options via HTML attributes.
 * All attributes are declared in lowercase
 * ```
 *  <input
 *      data-fv-field="${fieldName}"
 *      data-fv-{validator}="true"
 *      data-fv-{validator}___{option}="..." />
 * ```
 */
export default class Declarative extends Plugin<DeclarativeOptions> {
    constructor(opts?: DeclarativeOptions) {
        super(opts);
        this.opts = Object.assign({}, {
            html5Input: false,
            prefix: 'data-fv-',
        }, opts);
    }

    public install(): void {
        const opts = this.parseOptions();
        Object.keys(opts).forEach((field) => this.core.addField(field, opts[field]));
    }

    private parseOptions(): FieldsOptions {
        // Find all fields which have either `name` or `data-fv-field` attribute
        const prefix = this.opts.prefix;
        const opts: FieldsOptions = {};
        const fields = this.core.getFields();
        const form = this.core.getFormElement();
        const elements = [].slice.call(form.querySelectorAll(`[name], [${prefix}field]`)) as Element[];
        elements.forEach((ele) => {
            const validators = this.parseElement(ele);
            // Do not try to merge the options if it's empty
            // For instance, there are multiple elements having the same name,
            // we only set the HTML attribute to one of them
            if (!this.isEmptyOption(validators)) {
                const field = ele.getAttribute('name') || ele.getAttribute(`${prefix}field`);
                opts[field] = Object.assign({}, opts[field], validators);
            }
        });

        Object.keys(opts).forEach((field) => {
            Object.keys(opts[field].validators).forEach((v) => {
                // Set the `enabled` key to `false` if it isn't set
                // (the data-fv-{validator} attribute is missing, for example)
                opts[field].validators[v].enabled = opts[field].validators[v].enabled || false;

                // Mix the options in declarative and programmatic modes
                if (fields[field] && fields[field].validators && fields[field].validators[v]) {
                    Object.assign(opts[field].validators[v], fields[field].validators[v]);
                }
            });
        });

        return Object.assign({}, fields, opts);
    }

    private isEmptyOption(opts: FieldOptions): boolean {
        const validators = opts.validators;
        return Object.keys(validators).length === 0 && validators.constructor === Object;
    }

    private parseElement(ele: Element): FieldOptions {
        const reg = new RegExp(`^${this.opts.prefix}([a-z0-9\-]+)(___)*([a-z0-9\-]+)*$`);
        const numAttributes = ele.attributes.length;
        const opts = {};
        const type = ele.getAttribute('type');
        for (let i = 0; i < numAttributes; i++) {
            const name = ele.attributes[i].name;
            const value = ele.attributes[i].value;

            if (this.opts.html5Input) {
                /* tslint:disable:no-string-literal */
                switch (true) {
                    case ('minlength' === name):
                        opts['stringLength'] = Object.assign({}, {
                            enabled: true,
                            min: parseInt(value, 10),
                        }, opts['stringLength']);
                        break;

                    case ('maxlength' === name):
                        opts['stringLength'] = Object.assign({}, {
                            enabled: true,
                            max: parseInt(value, 10),
                        }, opts['stringLength']);
                        break;

                    case ('pattern' === name):
                        opts['regexp'] = Object.assign({}, {
                            enabled: true,
                            regexp: value,
                        }, opts['regexp']);
                        break;

                    case ('required' === name):
                        opts['notEmpty'] = Object.assign({}, {
                            enabled: true,
                        }, opts['notEmpty']);
                        break;

                    case ('type' === name && 'color' === value):
                        // Only accept 6 hex character values due to the HTML 5 spec
                        // See http://www.w3.org/TR/html-markup/input.color.html#input.color.attrs.value
                        opts['color'] = Object.assign({}, {
                            enabled: true,
                            type: 'hex',
                        }, opts['color']);
                        break;

                    case ('type' === name && 'email' === value):
                        opts['emailAddress'] = Object.assign({}, {
                            enabled: true,
                        }, opts['emailAddress']);
                        break;

                    case ('type' === name && 'url' === value):
                        opts['uri'] = Object.assign({}, {
                            enabled: true,
                        }, opts['uri']);
                        break;

                    case ('type' === name && 'range' === value):
                        opts['between'] = Object.assign({}, {
                            enabled: true,
                            max: parseFloat(ele.getAttribute('max')),
                            min: parseFloat(ele.getAttribute('min')),
                        }, opts['between']);
                        break;

                    case ('min' === name && type !== 'date' && type !== 'range'):
                        opts['greaterThan'] = Object.assign({}, {
                            enabled: true,
                            min: parseFloat(value),
                        }, opts['greaterThan']);
                        break;

                    case ('max' === name && type !== 'date' && type !== 'range'):
                        opts['lessThan'] = Object.assign({}, {
                            enabled: true,
                            max: parseFloat(value),
                        }, opts['lessThan']);
                        break;

                    default:
                        break;
                }
                /* tslint:enable:no-string-literal */
            }

            const items = reg.exec(name);
            if (items && items.length === 4) {
                const v = this.toCamelCase(items[1]);
                opts[v] = Object.assign(
                    {},
                    items[3]
                        ? { [this.toCamelCase(items[3])]: value }
                        : { enabled: ('' === value || 'true' === value) },
                    opts[v],
                );
            }
        }

        return { validators: opts };
    }

    private toUpperCase(input: string): string {
        return input.charAt(1).toUpperCase();
    }

    private toCamelCase(input: string): string {
        return input.replace(/-./g, this.toUpperCase);
    }
}
