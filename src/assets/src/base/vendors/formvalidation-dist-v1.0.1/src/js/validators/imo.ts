/**
 * FormValidation (https://formvalidation.io)
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

import { Localization, ValidateFunction, ValidateInput, ValidateOptions, ValidateResult } from '../core/Core';

export default function imo(): ValidateFunction {
    return {
        /**
         * Validate IMO (International Maritime Organization)
         * @see http://en.wikipedia.org/wiki/IMO_Number
         */
        validate(input: ValidateInput<ValidateOptions, Localization>): ValidateResult {
            if (input.value === '') {
                return { valid: true };
            }

            if (!/^IMO \d{7}$/i.test(input.value)) {
                return { valid: false };
            }

            // Grab just the digits
            const digits = input.value.replace(/^.*(\d{7})$/, '$1');
            let sum = 0;
            for (let i = 6; i >= 1; i--) {
                sum += (parseInt(digits.slice((6 - i), -i), 10) * (i + 1));
            }

            return { valid: (sum % 10 === parseInt(digits.charAt(6), 10)) };
        },
    };
}
