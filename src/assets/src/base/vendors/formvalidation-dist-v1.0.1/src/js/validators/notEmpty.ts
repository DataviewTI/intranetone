/**
 * FormValidation (https://formvalidation.io)
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import { Localization, ValidateFunction, ValidateInput, ValidateOptions, ValidateResult } from '../core/Core';

export default function notEmpty(): ValidateFunction {
    return {
        validate(input: ValidateInput<ValidateOptions, Localization>): ValidateResult {
            return { valid: input.value !== '' };
        },
    };
}
