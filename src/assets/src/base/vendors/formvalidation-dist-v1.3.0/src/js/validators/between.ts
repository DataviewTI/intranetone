/**
 * FormValidation (https://formvalidation.io)
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import { Localization, ValidateInput, ValidateOptions, ValidateResult } from '../core/Core';
import format from '../utils/format';

export interface BetweenOptions extends ValidateOptions {
    // Default is true
    inclusive: boolean;
    max?: number;
    min?: number;
}
export interface BetweenLocalization extends Localization {
    between: {
        default: string,
        notInclusive: string,
    };
}

export default function between() {
    const formatValue = (value: number) => {
        return parseFloat(`${value}`.replace(',', '.'));
    };

    return {
        validate(input: ValidateInput<BetweenOptions, BetweenLocalization>): ValidateResult {
            const value = input.value;
            if (value === '') {
                return { valid: true };
            }

            const opts = Object.assign({}, { inclusive: true }, input.options);
            const minValue = formatValue(opts.min);
            const maxValue = formatValue(opts.max);
            return opts.inclusive
                ? {
                    message: input.l10n
                        ? format(opts.message || input.l10n.between.default, [`${minValue}`, `${maxValue}`])
                        : opts.message,
                    valid: parseFloat(value) >= minValue && parseFloat(value) <= maxValue,
                }
                : {
                    message: input.l10n
                        ? format(opts.message || input.l10n.between.notInclusive, [`${minValue}`, `${maxValue}`])
                        : opts.message,
                    valid: parseFloat(value) > minValue && parseFloat(value) < maxValue,
                };
        },
    };
}
