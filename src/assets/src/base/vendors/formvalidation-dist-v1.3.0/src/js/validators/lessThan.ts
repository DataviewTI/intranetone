/**
 * FormValidation (https://formvalidation.io)
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import { Localization, ValidateInput, ValidateOptions, ValidateResult } from '../core/Core';
import format from '../utils/format';

export interface LessThanOptions extends ValidateOptions {
    // Default is true
    inclusive: boolean;
    max?: number;
}
export interface LessThanLocalization extends Localization {
    lessThan: {
        default: string,
        notInclusive: string,
    };
}

export default function lessThan() {
    return {
        validate(input: ValidateInput<LessThanOptions, LessThanLocalization>): ValidateResult {
            if (input.value === '') {
                return { valid: true };
            }

            const opts = Object.assign({}, { inclusive: true }, input.options);
            const maxValue = parseFloat(`${opts.max}`.replace(',', '.'));
            return opts.inclusive
                ? {
                    message: input.l10n
                            ? format(opts.message || input.l10n.lessThan.default, `${maxValue}`)
                            : opts.message,
                    valid: parseFloat(input.value) <= maxValue,
                }
                : {
                    message: input.l10n
                            ? format(opts.message || input.l10n.lessThan.notInclusive, `${maxValue}`)
                            : opts.message,
                    valid: parseFloat(input.value) < maxValue,
                };
        },
    };
}
