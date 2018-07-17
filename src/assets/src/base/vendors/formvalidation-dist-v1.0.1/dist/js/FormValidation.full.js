/**
 * FormValidation (https://formvalidation.io), v1.0.1
 * The best validation library for JavaScript
 * (c) 2013 - 2018 Nguyen Huu Phuoc <me@phuoc.ng>
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.FormValidation = {})));
}(this, (function (exports) { 'use strict';

function luhn(value) {
    let length = value.length;
    const prodArr = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]];
    let mul = 0;
    let sum = 0;
    while (length--) {
        sum += prodArr[mul][parseInt(value.charAt(length), 10)];
        mul = 1 - mul;
    }
    return (sum % 10 === 0 && sum > 0);
}

function mod11And10(value) {
    const length = value.length;
    let check = 5;
    for (let i = 0; i < length; i++) {
        check = (((check || 10) * 2) % 11 + parseInt(value.charAt(i), 10)) % 10;
    }
    return (check === 1);
}

function mod37And36(value, alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    const length = value.length;
    const modulus = alphabet.length;
    let check = Math.floor(modulus / 2);
    for (let i = 0; i < length; i++) {
        check = (((check || modulus) * 2) % (modulus + 1) + alphabet.indexOf(value.charAt(i))) % modulus;
    }
    return (check === 1);
}

var index = {
    luhn,
    mod11And10,
    mod37And36,
};

function emitter() {
    return {
        fns: {},
        clear() {
            this.fns = {};
        },
        emit(event, ...args) {
            (this.fns[event] || []).map((handler) => handler.apply(handler, args));
        },
        off(event, func) {
            if (this.fns[event]) {
                const index = this.fns[event].indexOf(func);
                if (index >= 0) {
                    this.fns[event].splice(index, 1);
                }
            }
        },
        on(event, func) {
            (this.fns[event] = this.fns[event] || []).push(func);
        },
    };
}

function filter() {
    return {
        filters: {},
        add(name, func) {
            (this.filters[name] = this.filters[name] || []).push(func);
        },
        clear() {
            this.filters = {};
        },
        execute(name, defaultValue, args) {
            if (!this.filters[name] || !this.filters[name].length) {
                return defaultValue;
            }
            let result = defaultValue;
            const filters = this.filters[name];
            const count = filters.length;
            for (let i = 0; i < count; i++) {
                result = filters[i].apply(result, args);
            }
            return result;
        },
        remove(name, func) {
            if (this.filters[name]) {
                this.filters[name] = this.filters[name].filter((f) => f !== func);
            }
        },
    };
}

var Status;
(function (Status) {
    Status["Invalid"] = "Invalid";
    Status["NotValidated"] = "NotValidated";
    Status["Valid"] = "Valid";
    Status["Validating"] = "Validating";
})(Status || (Status = {}));
var Status$1 = Status;

function getFieldValue(form, field, element, elements) {
    const type = (element.getAttribute('type') || '').toLowerCase();
    const tagName = element.tagName.toLowerCase();
    switch (tagName) {
        case 'textarea':
            return element.value;
        case 'select':
            const select = element;
            const index = select.selectedIndex;
            return (index >= 0) ? select.options.item(index).value : '';
        case 'input':
            if ('radio' === type || 'checkbox' === type) {
                const checked = elements.filter((ele) => ele.checked).length;
                return checked === 0 ? '' : checked + '';
            }
            else {
                return element.value;
            }
        default:
            return '';
    }
}

function format(message, parameters) {
    const params = Array.isArray(parameters) ? parameters : [parameters];
    let output = message;
    params.forEach((p) => {
        output = output.replace('%s', p);
    });
    return output;
}

function between() {
    const formatValue = (value) => {
        return parseFloat(`${value}`.replace(',', '.'));
    };
    return {
        validate(input) {
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

function blank() {
    return {
        validate(input) {
            return { valid: true };
        },
    };
}

function call(functionName, args) {
    if ('function' === typeof functionName) {
        return functionName.apply(this, args);
    }
    else if ('string' === typeof functionName) {
        let name = functionName;
        if ('()' === name.substring(name.length - 2)) {
            name = name.substring(0, name.length - 2);
        }
        const ns = name.split('.');
        const func = ns.pop();
        let context = window;
        for (const t of ns) {
            context = context[t];
        }
        return (typeof context[func] === 'undefined') ? null : context[func].apply(this, args);
    }
}

function callback() {
    return {
        validate(input) {
            const response = call(input.options.callback, [input]);
            return ('boolean' === typeof response)
                ? { valid: response }
                : response;
        },
    };
}

function choice() {
    return {
        validate(input) {
            const numChoices = ('select' === input.element.tagName.toLowerCase())
                ? input.element.querySelectorAll('option:checked').length
                : input.elements.filter((ele) => ele.checked).length;
            const min = input.options.min ? `${input.options.min}` : '';
            const max = input.options.max ? `${input.options.max}` : '';
            let msg = input.l10n ? (input.options.message || input.l10n.choice.default) : input.options.message;
            const isValid = !((min && numChoices < parseInt(min, 10)) || (max && numChoices > parseInt(max, 10)));
            switch (true) {
                case (!!min && !!max):
                    msg = format(input.l10n ? input.l10n.choice.between : input.options.message, [min, max]);
                    break;
                case (!!min):
                    msg = format(input.l10n ? input.l10n.choice.more : input.options.message, min);
                    break;
                case (!!max):
                    msg = format(input.l10n ? input.l10n.choice.less : input.options.message, max);
                    break;
                default:
                    break;
            }
            return {
                message: msg,
                valid: isValid,
            };
        },
    };
}

const CREDIT_CARD_TYPES = {
    AMERICAN_EXPRESS: {
        length: [15],
        prefix: ['34', '37'],
    },
    DANKORT: {
        length: [16],
        prefix: ['5019'],
    },
    DINERS_CLUB: {
        length: [14],
        prefix: ['300', '301', '302', '303', '304', '305', '36'],
    },
    DINERS_CLUB_US: {
        length: [16],
        prefix: ['54', '55'],
    },
    DISCOVER: {
        length: [16],
        prefix: [
            '6011', '622126', '622127', '622128', '622129', '62213',
            '62214', '62215', '62216', '62217', '62218', '62219',
            '6222', '6223', '6224', '6225', '6226', '6227', '6228',
            '62290', '62291', '622920', '622921', '622922', '622923',
            '622924', '622925', '644', '645', '646', '647', '648',
            '649', '65',
        ],
    },
    ELO: {
        length: [16],
        prefix: [
            '4011', '4312', '4389', '4514', '4573', '4576',
            '5041', '5066', '5067', '509',
            '6277', '6362', '6363', '650', '6516', '6550',
        ],
    },
    FORBRUGSFORENINGEN: {
        length: [16],
        prefix: ['600722'],
    },
    JCB: {
        length: [16],
        prefix: ['3528', '3529', '353', '354', '355', '356', '357', '358'],
    },
    LASER: {
        length: [16, 17, 18, 19],
        prefix: ['6304', '6706', '6771', '6709'],
    },
    MAESTRO: {
        length: [12, 13, 14, 15, 16, 17, 18, 19],
        prefix: ['5018', '5020', '5038', '5868', '6304', '6759', '6761', '6762', '6763', '6764', '6765', '6766'],
    },
    MASTERCARD: {
        length: [16],
        prefix: ['51', '52', '53', '54', '55'],
    },
    SOLO: {
        length: [16, 18, 19],
        prefix: ['6334', '6767'],
    },
    UNIONPAY: {
        length: [16, 17, 18, 19],
        prefix: [
            '622126', '622127', '622128', '622129', '62213', '62214',
            '62215', '62216', '62217', '62218', '62219', '6222', '6223',
            '6224', '6225', '6226', '6227', '6228', '62290', '62291',
            '622920', '622921', '622922', '622923', '622924', '622925',
        ],
    },
    VISA: {
        length: [16],
        prefix: ['4'],
    },
    VISA_ELECTRON: {
        length: [16],
        prefix: ['4026', '417500', '4405', '4508', '4844', '4913', '4917'],
    },
};
function creditCard() {
    return {
        validate(input) {
            if (input.value === '') {
                return {
                    meta: {
                        type: null,
                    },
                    valid: true,
                };
            }
            if (/[^0-9-\s]+/.test(input.value)) {
                return {
                    meta: {
                        type: null,
                    },
                    valid: false,
                };
            }
            const v = input.value.replace(/\D/g, '');
            if (!luhn(v)) {
                return {
                    meta: {
                        type: null,
                    },
                    valid: false,
                };
            }
            for (const tpe of Object.keys(CREDIT_CARD_TYPES)) {
                for (const i in CREDIT_CARD_TYPES[tpe].prefix) {
                    if (input.value.substr(0, CREDIT_CARD_TYPES[tpe].prefix[i].length) ===
                        CREDIT_CARD_TYPES[tpe].prefix[i] && CREDIT_CARD_TYPES[tpe].length.indexOf(v.length) !== -1) {
                        return {
                            meta: {
                                type: tpe,
                            },
                            valid: true,
                        };
                    }
                }
            }
            return {
                meta: {
                    type: null,
                },
                valid: false,
            };
        },
    };
}

function isValidDate(year, month, day, notInFuture) {
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return false;
    }
    if (year < 1000 || year > 9999 || month <= 0 || month > 12) {
        return false;
    }
    const numDays = [
        31,
        (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) ? 29 : 28,
        31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
    ];
    if (day <= 0 || day > numDays[month - 1]) {
        return false;
    }
    if (notInFuture === true) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const currentDay = currentDate.getDate();
        return (year < currentYear
            || (year === currentYear && month - 1 < currentMonth)
            || (year === currentYear && month - 1 === currentMonth && day < currentDay));
    }
    return true;
}

function date() {
    const parseDate = (input, inputFormat, separator) => {
        const yearIndex = inputFormat.indexOf('YYYY');
        const monthIndex = inputFormat.indexOf('MM');
        const dayIndex = inputFormat.indexOf('DD');
        if (yearIndex === -1 || monthIndex === -1 || dayIndex === -1) {
            return null;
        }
        const sections = input.split(' ');
        const dateSection = sections[0].split(separator);
        if (dateSection.length < 3) {
            return null;
        }
        const d = new Date(parseInt(dateSection[yearIndex], 10), parseInt(dateSection[monthIndex], 10) - 1, parseInt(dateSection[dayIndex], 10));
        if (sections.length > 1) {
            const timeSection = sections[1].split(':');
            d.setHours(timeSection.length > 0 ? parseInt(timeSection[0], 10) : 0);
            d.setMinutes(timeSection.length > 1 ? parseInt(timeSection[1], 10) : 0);
            d.setSeconds(timeSection.length > 2 ? parseInt(timeSection[2], 10) : 0);
        }
        return d;
    };
    const formatDate = (input, inputFormat) => {
        const dateFormat = inputFormat
            .replace(/Y/g, 'y')
            .replace(/M/g, 'm')
            .replace(/D/g, 'd')
            .replace(/:m/g, ':M')
            .replace(/:mm/g, ':MM')
            .replace(/:S/, ':s')
            .replace(/:SS/, ':ss');
        const d = input.getDate();
        const dd = d < 10 ? `0${d}` : d;
        const m = input.getMonth() + 1;
        const mm = m < 10 ? `0${m}` : m;
        const yy = `${input.getFullYear()}`.substr(2);
        const yyyy = input.getFullYear();
        const h = input.getHours() % 12 || 12;
        const hh = h < 10 ? `0${h}` : h;
        const H = input.getHours();
        const HH = H < 10 ? `0${H}` : H;
        const M = input.getMinutes();
        const MM = M < 10 ? `0${M}` : M;
        const s = input.getSeconds();
        const ss = s < 10 ? `0${s}` : s;
        const replacer = {
            H: `${H}`,
            HH: `${HH}`,
            M: `${M}`,
            MM: `${MM}`,
            d: `${d}`,
            dd: `${dd}`,
            h: `${h}`,
            hh: `${hh}`,
            m: `${m}`,
            mm: `${mm}`,
            s: `${s}`,
            ss: `${ss}`,
            yy: `${yy}`,
            yyyy: `${yyyy}`,
        };
        return dateFormat.replace(/d{1,4}|m{1,4}|yy(?:yy)?|([HhMs])\1?|"[^"]*"|'[^']*'/g, (match) => {
            return replacer[match] ? replacer[match] : match.slice(1, match.length - 1);
        });
    };
    return {
        validate(input) {
            if (input.value === '') {
                return {
                    meta: {
                        date: null,
                    },
                    valid: true,
                };
            }
            const opts = Object.assign({}, {
                format: (input.element && input.element.getAttribute('type') === 'date') ? 'YYYY-MM-DD' : 'MM/DD/YYYY',
                message: '',
            }, input.options);
            const message = input.l10n ? input.l10n.date.default : opts.message;
            const invalidResult = {
                message: `${message}`,
                meta: {
                    date: null,
                },
                valid: false,
            };
            const formats = opts.format.split(' ');
            const timeFormat = (formats.length > 1) ? formats[1] : null;
            const amOrPm = (formats.length > 2) ? formats[2] : null;
            const sections = input.value.split(' ');
            const dateSection = sections[0];
            const timeSection = (sections.length > 1) ? sections[1] : null;
            if (formats.length !== sections.length) {
                return invalidResult;
            }
            const separator = opts.separator ||
                ((dateSection.indexOf('/') !== -1)
                    ? '/'
                    : ((dateSection.indexOf('-') !== -1) ? '-' : ((dateSection.indexOf('.') !== -1) ? '.' : '/')));
            if (separator === null || dateSection.indexOf(separator) === -1) {
                return invalidResult;
            }
            const dateStr = dateSection.split(separator);
            const dateFormat = formats[0].split(separator);
            if (dateStr.length !== dateFormat.length) {
                return invalidResult;
            }
            const yearStr = dateStr[dateFormat.indexOf('YYYY')];
            const monthStr = dateStr[dateFormat.indexOf('MM')];
            const dayStr = dateStr[dateFormat.indexOf('DD')];
            if (!/^\d+$/.test(yearStr) || !/^\d+$/.test(monthStr) || !/^\d+$/.test(dayStr)
                || yearStr.length > 4 || monthStr.length > 2 || dayStr.length > 2) {
                return invalidResult;
            }
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10);
            const day = parseInt(dayStr, 10);
            if (!isValidDate(year, month, day)) {
                return invalidResult;
            }
            const d = new Date(year, month - 1, day);
            if (timeFormat) {
                const hms = timeSection.split(':');
                if (timeFormat.split(':').length !== hms.length) {
                    return invalidResult;
                }
                const h = hms.length > 0 ? (hms[0].length <= 2 && /^\d+$/.test(hms[0]) ? parseInt(hms[0], 10) : -1) : 0;
                const m = hms.length > 1 ? (hms[1].length <= 2 && /^\d+$/.test(hms[1]) ? parseInt(hms[1], 10) : -1) : 0;
                const s = hms.length > 2 ? (hms[2].length <= 2 && /^\d+$/.test(hms[2]) ? parseInt(hms[2], 10) : -1) : 0;
                if (h === -1 || m === -1 || s === -1) {
                    return invalidResult;
                }
                if (s < 0 || s > 60) {
                    return invalidResult;
                }
                if (h < 0 || h >= 24 || (amOrPm && h > 12)) {
                    return invalidResult;
                }
                if (m < 0 || m > 59) {
                    return invalidResult;
                }
                d.setHours(h);
                d.setMinutes(m);
                d.setSeconds(s);
            }
            const min = (opts.min instanceof Date)
                ? opts.min
                : (opts.min ? parseDate(opts.min, dateFormat, separator) : d);
            const max = (opts.max instanceof Date)
                ? opts.max
                : (opts.max ? parseDate(opts.max, dateFormat, separator) : d);
            const minOption = (opts.min instanceof Date) ? formatDate(min, opts.format) : opts.min;
            const maxOption = (opts.max instanceof Date) ? formatDate(max, opts.format) : opts.max;
            switch (true) {
                case (!!minOption && !maxOption):
                    return {
                        message: format(input.l10n ? input.l10n.date.min : message, minOption),
                        meta: {
                            date: d,
                        },
                        valid: d.getTime() >= min.getTime(),
                    };
                case (!!maxOption && !minOption):
                    return {
                        message: format(input.l10n ? input.l10n.date.max : message, maxOption),
                        meta: {
                            date: d,
                        },
                        valid: d.getTime() <= max.getTime(),
                    };
                case (!!maxOption && !!minOption):
                    return {
                        message: format(input.l10n ? input.l10n.date.range : message, [minOption, maxOption]),
                        meta: {
                            date: d,
                        },
                        valid: d.getTime() <= max.getTime() && d.getTime() >= min.getTime(),
                    };
                default:
                    return {
                        message: `${message}`,
                        meta: {
                            date: d,
                        },
                        valid: true,
                    };
            }
        },
    };
}

function different() {
    return {
        validate(input) {
            const compareWith = ('function' === typeof input.options.compare)
                ? input.options.compare.call(this)
                : input.options.compare;
            return {
                valid: (compareWith === '' || input.value !== compareWith),
            };
        },
    };
}

function digits() {
    return {
        validate(input) {
            return { valid: (input.value === '') || /^\d+$/.test(input.value) };
        },
    };
}

function emailAddress() {
    const splitEmailAddresses = (emailAddresses, separator) => {
        const quotedFragments = emailAddresses.split(/"/);
        const quotedFragmentCount = quotedFragments.length;
        const emailAddressArray = [];
        let nextEmailAddress = '';
        for (let i = 0; i < quotedFragmentCount; i++) {
            if (i % 2 === 0) {
                const splitEmailAddressFragments = quotedFragments[i].split(separator);
                const splitEmailAddressFragmentCount = splitEmailAddressFragments.length;
                if (splitEmailAddressFragmentCount === 1) {
                    nextEmailAddress += splitEmailAddressFragments[0];
                }
                else {
                    emailAddressArray.push(nextEmailAddress + splitEmailAddressFragments[0]);
                    for (let j = 1; j < splitEmailAddressFragmentCount - 1; j++) {
                        emailAddressArray.push(splitEmailAddressFragments[j]);
                    }
                    nextEmailAddress = splitEmailAddressFragments[splitEmailAddressFragmentCount - 1];
                }
            }
            else {
                nextEmailAddress += '"' + quotedFragments[i];
                if (i < quotedFragmentCount - 1) {
                    nextEmailAddress += '"';
                }
            }
        }
        emailAddressArray.push(nextEmailAddress);
        return emailAddressArray;
    };
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const opts = Object.assign({}, {
                multiple: false,
                separator: /[,;]/,
            }, input.options);
            const emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            const allowMultiple = opts.multiple === true || opts.multiple === 'true';
            if (allowMultiple) {
                const separator = opts.separator || /[,;]/;
                const addresses = splitEmailAddresses(input.value, separator);
                for (const reg of addresses) {
                    if (!emailRegExp.test(reg)) {
                        return { valid: false };
                    }
                }
                return { valid: true };
            }
            else {
                return { valid: emailRegExp.test(input.value) };
            }
        },
    };
}

function file() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            let extension;
            const extensions = input.options.extension ? input.options.extension.toLowerCase().split(',') : null;
            const types = input.options.type ? input.options.type.toLowerCase().split(',') : null;
            const html5 = (window['File'] && window['FileList'] && window['FileReader']);
            if (html5) {
                const files = input.element.files;
                const total = files.length;
                let allSize = 0;
                if (input.options.maxFiles && total > parseInt(`${input.options.maxFiles}`, 10)) {
                    return {
                        meta: { error: 'INVALID_MAX_FILES' },
                        valid: false,
                    };
                }
                if (input.options.minFiles && total < parseInt(`${input.options.minFiles}`, 10)) {
                    return {
                        meta: { error: 'INVALID_MIN_FILES' },
                        valid: false,
                    };
                }
                let metaData = {};
                for (let i = 0; i < total; i++) {
                    allSize += files[i].size;
                    extension = files[i].name.substr(files[i].name.lastIndexOf('.') + 1);
                    metaData = {
                        ext: extension,
                        file: files[i],
                        size: files[i].size,
                        type: files[i].type,
                    };
                    if (input.options.minSize && files[i].size < parseInt(`${input.options.minSize}`, 10)) {
                        return {
                            meta: Object.assign({}, { error: 'INVALID_MIN_SIZE' }, metaData),
                            valid: false,
                        };
                    }
                    if (input.options.maxSize && files[i].size > parseInt(`${input.options.maxSize}`, 10)) {
                        return {
                            meta: Object.assign({}, { error: 'INVALID_MAX_SIZE' }, metaData),
                            valid: false,
                        };
                    }
                    if (extensions && extensions.indexOf(extension.toLowerCase()) === -1) {
                        return {
                            meta: Object.assign({}, { error: 'INVALID_EXTENSION' }, metaData),
                            valid: false,
                        };
                    }
                    if (files[i].type && types && types.indexOf(files[i].type.toLowerCase()) === -1) {
                        return {
                            meta: Object.assign({}, { error: 'INVALID_TYPE' }, metaData),
                            valid: false,
                        };
                    }
                }
                if (input.options.maxTotalSize && allSize > parseInt(`${input.options.maxTotalSize}`, 10)) {
                    return {
                        meta: Object.assign({}, {
                            error: 'INVALID_MAX_TOTAL_SIZE',
                            totalSize: allSize,
                        }, metaData),
                        valid: false,
                    };
                }
                if (input.options.minTotalSize && allSize < parseInt(`${input.options.minTotalSize}`, 10)) {
                    return {
                        meta: Object.assign({}, {
                            error: 'INVALID_MIN_TOTAL_SIZE',
                            totalSize: allSize,
                        }, metaData),
                        valid: false,
                    };
                }
            }
            else {
                extension = input.value.substr(input.value.lastIndexOf('.') + 1);
                if (extensions && extensions.indexOf(extension.toLowerCase()) === -1) {
                    return {
                        meta: {
                            error: 'INVALID_EXTENSION',
                            ext: extension,
                        },
                        valid: false,
                    };
                }
            }
            return { valid: true };
        },
    };
}

function greaterThan() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const opts = Object.assign({}, { inclusive: true }, input.options);
            const minValue = parseFloat(`${opts.min}`.replace(',', '.'));
            return opts.inclusive
                ? {
                    message: input.l10n
                        ? format(opts.message || input.l10n.greaterThan.default, `${minValue}`)
                        : opts.message,
                    valid: parseFloat(input.value) >= minValue,
                }
                : {
                    message: input.l10n
                        ? format(opts.message || input.l10n.greaterThan.notInclusive, `${minValue}`)
                        : opts.message,
                    valid: parseFloat(input.value) > minValue,
                };
        },
    };
}

function identical() {
    return {
        validate(input) {
            const compareWith = ('function' === typeof input.options.compare)
                ? input.options.compare.call(this)
                : input.options.compare;
            return {
                valid: (compareWith === '' || input.value === compareWith),
            };
        },
    };
}

function integer() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const opts = Object.assign({}, {
                decimalSeparator: '.',
                thousandsSeparator: '',
            }, input.options);
            const decimalSeparator = (opts.decimalSeparator === '.') ? '\\.' : opts.decimalSeparator;
            const thousandsSeparator = (opts.thousandsSeparator === '.') ? '\\.' : opts.thousandsSeparator;
            const testRegexp = new RegExp(`^-?[0-9]{1,3}(${thousandsSeparator}[0-9]{3})*(${decimalSeparator}[0-9]+)?$`);
            const thousandsReplacer = new RegExp(thousandsSeparator, 'g');
            let v = `${input.value}`;
            if (!testRegexp.test(v)) {
                return { valid: false };
            }
            if (thousandsSeparator) {
                v = v.replace(thousandsReplacer, '');
            }
            if (decimalSeparator) {
                v = v.replace(decimalSeparator, '.');
            }
            const n = parseFloat(v);
            return { valid: !isNaN(n) && isFinite(n) && Math.floor(n) === n };
        },
    };
}

function ip() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const opts = Object.assign({}, {
                ipv4: true,
                ipv6: true,
            }, input.options);
            const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
            const ipv6Regex = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*(\/(\d|\d\d|1[0-1]\d|12[0-8]))?$/;
            switch (true) {
                case (opts.ipv4 && !opts.ipv6):
                    return {
                        message: input.l10n ? (opts.message || input.l10n.ip.ipv4) : opts.message,
                        valid: ipv4Regex.test(input.value),
                    };
                case (!opts.ipv4 && opts.ipv6):
                    return {
                        message: input.l10n ? (opts.message || input.l10n.ip.ipv6) : opts.message,
                        valid: ipv6Regex.test(input.value),
                    };
                case (opts.ipv4 && opts.ipv6):
                default:
                    return {
                        message: input.l10n ? (opts.message || input.l10n.ip.default) : opts.message,
                        valid: ipv4Regex.test(input.value) || ipv6Regex.test(input.value),
                    };
            }
        },
    };
}

function lessThan() {
    return {
        validate(input) {
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

function notEmpty() {
    return {
        validate(input) {
            return { valid: input.value !== '' };
        },
    };
}

function numeric() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const opts = Object.assign({}, {
                decimalSeparator: '.',
                thousandsSeparator: '',
            }, input.options);
            let v = `${input.value}`;
            if (v.substr(0, 1) === opts.decimalSeparator) {
                v = `0${opts.decimalSeparator}${v.substr(1)}`;
            }
            else if (v.substr(0, 2) === `-${opts.decimalSeparator}`) {
                v = `-0${opts.decimalSeparator}${v.substr(2)}`;
            }
            const decimalSeparator = (opts.decimalSeparator === '.') ? '\\.' : opts.decimalSeparator;
            const thousandsSeparator = (opts.thousandsSeparator === '.') ? '\\.' : opts.thousandsSeparator;
            const testRegexp = new RegExp(`^-?[0-9]{1,3}(${thousandsSeparator}[0-9]{3})*(${decimalSeparator}[0-9]+)?$`);
            const thousandsReplacer = new RegExp(thousandsSeparator, 'g');
            if (!testRegexp.test(v)) {
                return { valid: false };
            }
            if (thousandsSeparator) {
                v = v.replace(thousandsReplacer, '');
            }
            if (decimalSeparator) {
                v = v.replace(decimalSeparator, '.');
            }
            const n = parseFloat(v);
            return { valid: !isNaN(n) && isFinite(n) };
        },
    };
}

function promise() {
    return {
        validate(input) {
            return call(input.options.promise, [input]);
        },
    };
}

function regexp() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const reg = input.options.regexp;
            if (reg instanceof RegExp) {
                return { valid: reg.test(input.value) };
            }
            else {
                const pattern = reg.toString();
                const exp = input.options.flags ? (new RegExp(pattern, input.options.flags)) : new RegExp(pattern);
                return { valid: exp.test(input.value) };
            }
        },
    };
}

function fetch(url, options) {
    const toQuery = (obj) => Object.keys(obj).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
    return new Promise((resolve, reject) => {
        const opts = Object.assign({}, {
            crossDomain: false,
            headers: {},
            method: 'GET',
            params: {},
        }, options);
        const params = Object.keys(opts.params)
            .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(opts.params[k])}`)
            .join('&');
        const hasQuery = url.indexOf('?');
        const requestUrl = ('GET' === opts.method) ? `${url}${hasQuery ? '?' : '&'}${params}` : url;
        if (opts.crossDomain) {
            const script = document.createElement('script');
            const callback = `___fetch${Date.now()}___`;
            window[callback] = (data) => {
                delete window[callback];
                resolve(data);
            };
            script.src = `${requestUrl}${hasQuery ? '&' : '?'}callback=${callback}`;
            script.async = true;
            script.addEventListener('load', () => {
                script.parentNode.removeChild(script);
            });
            script.addEventListener('error', () => reject);
            document.head.appendChild(script);
        }
        else {
            const request = new XMLHttpRequest();
            request.open(opts.method, requestUrl);
            request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            if ('POST' === opts.method) {
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
            Object.keys(opts.headers).forEach((k) => request.setRequestHeader(k, opts.headers[k]));
            request.addEventListener('load', function () {
                resolve(JSON.parse(this.responseText));
            });
            request.addEventListener('error', () => reject);
            request.send(toQuery(opts.params));
        }
    });
}

function remote() {
    const DEFAULT_OPTIONS = {
        crossDomain: false,
        data: {},
        headers: {},
        method: 'GET',
        validKey: 'valid',
    };
    return {
        validate(input) {
            if (input.value === '') {
                return Promise.resolve({
                    valid: true,
                });
            }
            const opts = Object.assign({}, DEFAULT_OPTIONS, input.options);
            let data = opts.data;
            if ('function' === typeof opts.data) {
                data = opts.data.call(this, input);
            }
            if ('string' === typeof data) {
                data = JSON.parse(data);
            }
            data[opts.name || input.field] = input.value;
            const url = ('function' === typeof opts.url)
                ? opts.url.call(this, input)
                : opts.url;
            return fetch(url, {
                crossDomain: opts.crossDomain,
                headers: opts.headers,
                method: opts.method,
                params: data,
            }).then((response) => {
                return Promise.resolve({
                    message: response.message,
                    meta: response,
                    valid: `${response[opts.validKey]}` === 'true',
                });
            }).catch((reason) => {
                return Promise.reject({
                    valid: false,
                });
            });
        },
    };
}

function stringCase() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const opts = Object.assign({}, { case: 'lower' }, input.options);
            const caseOpt = (opts.case || 'lower').toLowerCase();
            return {
                message: opts.message || (input.l10n
                    ? (('upper' === caseOpt) ? input.l10n.stringCase.upper : input.l10n.stringCase.default)
                    : opts.message),
                valid: ('upper' === caseOpt)
                    ? input.value === input.value.toUpperCase()
                    : input.value === input.value.toLowerCase(),
            };
        },
    };
}

function stringLength() {
    const utf8Length = (str) => {
        let s = str.length;
        for (let i = str.length - 1; i >= 0; i--) {
            const code = str.charCodeAt(i);
            if (code > 0x7f && code <= 0x7ff) {
                s++;
            }
            else if (code > 0x7ff && code <= 0xffff) {
                s += 2;
            }
            if (code >= 0xDC00 && code <= 0xDFFF) {
                i--;
            }
        }
        return `${s}`;
    };
    return {
        validate(input) {
            const opts = Object.assign({}, {
                trim: false,
                utf8Bytes: false,
            }, input.options);
            const v = (opts.trim === true || opts.trim === 'true') ? input.value.trim() : input.value;
            if (v === '') {
                return { valid: true };
            }
            const min = opts.min ? `${opts.min}` : '';
            const max = opts.max ? `${opts.max}` : '';
            const length = opts.utf8Bytes ? utf8Length(v) : v.length;
            let isValid = true;
            let msg = input.l10n ? (opts.message || input.l10n.stringLength.default) : opts.message;
            if ((min && length < parseInt(min, 10)) || (max && length > parseInt(max, 10))) {
                isValid = false;
            }
            switch (true) {
                case (!!min && !!max):
                    msg = input.l10n
                        ? format(opts.message || input.l10n.stringLength.between, [min, max])
                        : opts.message;
                    break;
                case (!!min):
                    msg = input.l10n
                        ? format(opts.message || input.l10n.stringLength.more, (parseInt(min, 10) - 1) + '')
                        : opts.message;
                    break;
                case (!!max):
                    msg = input.l10n
                        ? format(opts.message || input.l10n.stringLength.less, (parseInt(max, 10) + 1) + '')
                        : opts.message;
                    break;
                default:
                    break;
            }
            return {
                message: msg,
                valid: isValid,
            };
        },
    };
}

function uri() {
    const DEFAULT_OPTIONS = {
        allowEmptyProtocol: false,
        allowLocal: false,
        protocol: 'http, https, ftp',
    };
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const opts = Object.assign({}, DEFAULT_OPTIONS, input.options);
            const allowLocal = opts.allowLocal === true || opts.allowLocal === 'true';
            const allowEmptyProtocol = opts.allowEmptyProtocol === true || opts.allowEmptyProtocol === 'true';
            const protocol = opts.protocol.split(',').join('|').replace(/\s/g, '');
            const urlExp = new RegExp("^" +
                "(?:(?:" + protocol + ")://)" +
                (allowEmptyProtocol ? '?' : '') +
                "(?:\\S+(?::\\S*)?@)?" +
                "(?:" +
                (allowLocal
                    ? ''
                    : ("(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
                        "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
                        "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})")) +
                "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
                "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
                "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
                "|" +
                "(?:(?:[a-z\\u00a1-\\uffff0-9]-?)*[a-z\\u00a1-\\uffff0-9]+)" +
                "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-?)*[a-z\\u00a1-\\uffff0-9])*" +
                "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
                (allowLocal ? '?' : '') +
                ")" +
                "(?::\\d{2,5})?" +
                "(?:/[^\\s]*)?$", "i");
            return { valid: urlExp.test(input.value) };
        },
    };
}

function base64() {
    return {
        validate(input) {
            return {
                valid: (input.value === '') ||
                    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(input.value),
            };
        },
    };
}

function bic() {
    return {
        validate(input) {
            return { valid: (input.value === '') || /^[a-zA-Z]{6}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?$/.test(input.value) };
        },
    };
}

function color() {
    const SUPPORTED_TYPES = ['hex', 'rgb', 'rgba', 'hsl', 'hsla', 'keyword'];
    const KEYWORD_COLORS = [
        'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure',
        'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood',
        'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan',
        'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta',
        'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue',
        'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray',
        'dimgrey', 'dodgerblue',
        'firebrick', 'floralwhite', 'forestgreen', 'fuchsia',
        'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey',
        'honeydew', 'hotpink',
        'indianred', 'indigo', 'ivory',
        'khaki',
        'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
        'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen',
        'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen',
        'linen',
        'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen',
        'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream',
        'mistyrose', 'moccasin',
        'navajowhite', 'navy',
        'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid',
        'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink',
        'plum', 'powderblue', 'purple',
        'red', 'rosybrown', 'royalblue',
        'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue',
        'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue',
        'tan', 'teal', 'thistle', 'tomato', 'transparent', 'turquoise',
        'violet',
        'wheat', 'white', 'whitesmoke',
        'yellow', 'yellowgreen',
    ];
    const hex = (value) => {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);
    };
    const hsl = (value) => {
        return /^hsl\((\s*(-?\d+)\s*,)(\s*(\b(0?\d{1,2}|100)\b%)\s*,)(\s*(\b(0?\d{1,2}|100)\b%)\s*)\)$/.test(value);
    };
    const hsla = (value) => {
        return /^hsla\((\s*(-?\d+)\s*,)(\s*(\b(0?\d{1,2}|100)\b%)\s*,){2}(\s*(0?(\.\d+)?|1(\.0+)?)\s*)\)$/.test(value);
    };
    const keyword = (value) => {
        return KEYWORD_COLORS.indexOf(value) >= 0;
    };
    const rgb = (value) => {
        return /^rgb\((\s*(\b([01]?\d{1,2}|2[0-4]\d|25[0-5])\b)\s*,){2}(\s*(\b([01]?\d{1,2}|2[0-4]\d|25[0-5])\b)\s*)\)$/.test(value)
            || /^rgb\((\s*(\b(0?\d{1,2}|100)\b%)\s*,){2}(\s*(\b(0?\d{1,2}|100)\b%)\s*)\)$/.test(value);
    };
    const rgba = (value) => {
        return /^rgba\((\s*(\b([01]?\d{1,2}|2[0-4]\d|25[0-5])\b)\s*,){3}(\s*(0?(\.\d+)?|1(\.0+)?)\s*)\)$/.test(value)
            || /^rgba\((\s*(\b(0?\d{1,2}|100)\b%)\s*,){3}(\s*(0?(\.\d+)?|1(\.0+)?)\s*)\)$/.test(value);
    };
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const types = (typeof input.options.type === 'string')
                ? input.options.type.toString().replace(/s/g, '').split(',')
                : (input.options.type || SUPPORTED_TYPES);
            for (const type of types) {
                const tpe = type.toLowerCase();
                if (SUPPORTED_TYPES.indexOf(tpe) === -1) {
                    continue;
                }
                let result = true;
                switch (tpe) {
                    case 'hex':
                        result = hex(input.value);
                        break;
                    case 'hsl':
                        result = hsl(input.value);
                        break;
                    case 'hsla':
                        result = hsla(input.value);
                        break;
                    case 'keyword':
                        result = keyword(input.value);
                        break;
                    case 'rgb':
                        result = rgb(input.value);
                        break;
                    case 'rgba':
                        result = rgba(input.value);
                        break;
                }
                if (result) {
                    return { valid: true };
                }
            }
            return { valid: false };
        },
    };
}

function cusip() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const v = input.value.toUpperCase();
            if (!/^[0-9A-Z]{9}$/.test(v)) {
                return { valid: false };
            }
            const converted = v.split('').map((item) => {
                const code = item.charCodeAt(0);
                return (code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0))
                    ? (code - 'A'.charCodeAt(0) + 10) + ''
                    : item;
            });
            const length = converted.length;
            let sum = 0;
            for (let i = 0; i < length - 1; i++) {
                let num = parseInt(converted[i], 10);
                if (i % 2 !== 0) {
                    num *= 2;
                }
                if (num > 9) {
                    num -= 9;
                }
                sum += num;
            }
            sum = (10 - (sum % 10)) % 10;
            return { valid: sum === parseInt(converted[length - 1], 10) };
        },
    };
}

function ean() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            if (!/^(\d{8}|\d{12}|\d{13})$/.test(input.value)) {
                return { valid: false };
            }
            const length = input.value.length;
            let sum = 0;
            const weight = (length === 8) ? [3, 1] : [1, 3];
            for (let i = 0; i < length - 1; i++) {
                sum += parseInt(input.value.charAt(i), 10) * weight[i % 2];
            }
            sum = (10 - sum % 10) % 10;
            return { valid: `${sum}` === input.value.charAt(length - 1) };
        },
    };
}

function ein() {
    const CAMPUS = {
        ANDOVER: ['10', '12'],
        ATLANTA: ['60', '67'],
        AUSTIN: ['50', '53'],
        BROOKHAVEN: [
            '01', '02', '03', '04', '05', '06', '11', '13', '14', '16', '21', '22', '23', '25', '34',
            '51', '52', '54', '55', '56', '57', '58', '59', '65',
        ],
        CINCINNATI: ['30', '32', '35', '36', '37', '38', '61'],
        FRESNO: ['15', '24'],
        INTERNET: ['20', '26', '27', '45', '46', '47'],
        KANSAS_CITY: ['40', '44'],
        MEMPHIS: ['94', '95'],
        OGDEN: ['80', '90'],
        PHILADELPHIA: [
            '33', '39', '41', '42', '43', '48', '62', '63', '64', '66', '68',
            '71', '72', '73', '74', '75', '76', '77',
            '81', '82', '83', '84', '85', '86', '87', '88', '91', '92', '93', '98', '99',
        ],
        SMALL_BUSINESS_ADMINISTRATION: ['31'],
    };
    return {
        validate(input) {
            if (input.value === '') {
                return {
                    meta: null,
                    valid: true,
                };
            }
            if (!/^[0-9]{2}-?[0-9]{7}$/.test(input.value)) {
                return {
                    meta: null,
                    valid: false,
                };
            }
            const campus = `${input.value.substr(0, 2)}`;
            for (const key in CAMPUS) {
                if (CAMPUS[key].indexOf(campus) !== -1) {
                    return {
                        meta: {
                            campus: key,
                        },
                        valid: true,
                    };
                }
            }
            return {
                meta: null,
                valid: false,
            };
        },
    };
}

function grid() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            let v = input.value.toUpperCase();
            if (!/^[GRID:]*([0-9A-Z]{2})[-\s]*([0-9A-Z]{5})[-\s]*([0-9A-Z]{10})[-\s]*([0-9A-Z]{1})$/g.test(v)) {
                return { valid: false };
            }
            v = v.replace(/\s/g, '').replace(/-/g, '');
            if ('GRID:' === v.substr(0, 5)) {
                v = v.substr(5);
            }
            return { valid: mod37And36(v) };
        },
    };
}

function hex() {
    return {
        validate(input) {
            return { valid: (input.value === '') || /^[0-9a-fA-F]+$/.test(input.value) };
        },
    };
}

function iban() {
    const IBAN_PATTERNS = {
        AD: 'AD[0-9]{2}[0-9]{4}[0-9]{4}[A-Z0-9]{12}',
        AE: 'AE[0-9]{2}[0-9]{3}[0-9]{16}',
        AL: 'AL[0-9]{2}[0-9]{8}[A-Z0-9]{16}',
        AO: 'AO[0-9]{2}[0-9]{21}',
        AT: 'AT[0-9]{2}[0-9]{5}[0-9]{11}',
        AZ: 'AZ[0-9]{2}[A-Z]{4}[A-Z0-9]{20}',
        BA: 'BA[0-9]{2}[0-9]{3}[0-9]{3}[0-9]{8}[0-9]{2}',
        BE: 'BE[0-9]{2}[0-9]{3}[0-9]{7}[0-9]{2}',
        BF: 'BF[0-9]{2}[0-9]{23}',
        BG: 'BG[0-9]{2}[A-Z]{4}[0-9]{4}[0-9]{2}[A-Z0-9]{8}',
        BH: 'BH[0-9]{2}[A-Z]{4}[A-Z0-9]{14}',
        BI: 'BI[0-9]{2}[0-9]{12}',
        BJ: 'BJ[0-9]{2}[A-Z]{1}[0-9]{23}',
        BR: 'BR[0-9]{2}[0-9]{8}[0-9]{5}[0-9]{10}[A-Z][A-Z0-9]',
        CH: 'CH[0-9]{2}[0-9]{5}[A-Z0-9]{12}',
        CI: 'CI[0-9]{2}[A-Z]{1}[0-9]{23}',
        CM: 'CM[0-9]{2}[0-9]{23}',
        CR: 'CR[0-9]{2}[0-9]{3}[0-9]{14}',
        CV: 'CV[0-9]{2}[0-9]{21}',
        CY: 'CY[0-9]{2}[0-9]{3}[0-9]{5}[A-Z0-9]{16}',
        CZ: 'CZ[0-9]{2}[0-9]{20}',
        DE: 'DE[0-9]{2}[0-9]{8}[0-9]{10}',
        DK: 'DK[0-9]{2}[0-9]{14}',
        DO: 'DO[0-9]{2}[A-Z0-9]{4}[0-9]{20}',
        DZ: 'DZ[0-9]{2}[0-9]{20}',
        EE: 'EE[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{11}[0-9]{1}',
        ES: 'ES[0-9]{2}[0-9]{4}[0-9]{4}[0-9]{1}[0-9]{1}[0-9]{10}',
        FI: 'FI[0-9]{2}[0-9]{6}[0-9]{7}[0-9]{1}',
        FO: 'FO[0-9]{2}[0-9]{4}[0-9]{9}[0-9]{1}',
        FR: 'FR[0-9]{2}[0-9]{5}[0-9]{5}[A-Z0-9]{11}[0-9]{2}',
        GB: 'GB[0-9]{2}[A-Z]{4}[0-9]{6}[0-9]{8}',
        GE: 'GE[0-9]{2}[A-Z]{2}[0-9]{16}',
        GI: 'GI[0-9]{2}[A-Z]{4}[A-Z0-9]{15}',
        GL: 'GL[0-9]{2}[0-9]{4}[0-9]{9}[0-9]{1}',
        GR: 'GR[0-9]{2}[0-9]{3}[0-9]{4}[A-Z0-9]{16}',
        GT: 'GT[0-9]{2}[A-Z0-9]{4}[A-Z0-9]{20}',
        HR: 'HR[0-9]{2}[0-9]{7}[0-9]{10}',
        HU: 'HU[0-9]{2}[0-9]{3}[0-9]{4}[0-9]{1}[0-9]{15}[0-9]{1}',
        IE: 'IE[0-9]{2}[A-Z]{4}[0-9]{6}[0-9]{8}',
        IL: 'IL[0-9]{2}[0-9]{3}[0-9]{3}[0-9]{13}',
        IR: 'IR[0-9]{2}[0-9]{22}',
        IS: 'IS[0-9]{2}[0-9]{4}[0-9]{2}[0-9]{6}[0-9]{10}',
        IT: 'IT[0-9]{2}[A-Z]{1}[0-9]{5}[0-9]{5}[A-Z0-9]{12}',
        JO: 'JO[0-9]{2}[A-Z]{4}[0-9]{4}[0]{8}[A-Z0-9]{10}',
        KW: 'KW[0-9]{2}[A-Z]{4}[0-9]{22}',
        KZ: 'KZ[0-9]{2}[0-9]{3}[A-Z0-9]{13}',
        LB: 'LB[0-9]{2}[0-9]{4}[A-Z0-9]{20}',
        LI: 'LI[0-9]{2}[0-9]{5}[A-Z0-9]{12}',
        LT: 'LT[0-9]{2}[0-9]{5}[0-9]{11}',
        LU: 'LU[0-9]{2}[0-9]{3}[A-Z0-9]{13}',
        LV: 'LV[0-9]{2}[A-Z]{4}[A-Z0-9]{13}',
        MC: 'MC[0-9]{2}[0-9]{5}[0-9]{5}[A-Z0-9]{11}[0-9]{2}',
        MD: 'MD[0-9]{2}[A-Z0-9]{20}',
        ME: 'ME[0-9]{2}[0-9]{3}[0-9]{13}[0-9]{2}',
        MG: 'MG[0-9]{2}[0-9]{23}',
        MK: 'MK[0-9]{2}[0-9]{3}[A-Z0-9]{10}[0-9]{2}',
        ML: 'ML[0-9]{2}[A-Z]{1}[0-9]{23}',
        MR: 'MR13[0-9]{5}[0-9]{5}[0-9]{11}[0-9]{2}',
        MT: 'MT[0-9]{2}[A-Z]{4}[0-9]{5}[A-Z0-9]{18}',
        MU: 'MU[0-9]{2}[A-Z]{4}[0-9]{2}[0-9]{2}[0-9]{12}[0-9]{3}[A-Z]{3}',
        MZ: 'MZ[0-9]{2}[0-9]{21}',
        NL: 'NL[0-9]{2}[A-Z]{4}[0-9]{10}',
        NO: 'NO[0-9]{2}[0-9]{4}[0-9]{6}[0-9]{1}',
        PK: 'PK[0-9]{2}[A-Z]{4}[A-Z0-9]{16}',
        PL: 'PL[0-9]{2}[0-9]{8}[0-9]{16}',
        PS: 'PS[0-9]{2}[A-Z]{4}[A-Z0-9]{21}',
        PT: 'PT[0-9]{2}[0-9]{4}[0-9]{4}[0-9]{11}[0-9]{2}',
        QA: 'QA[0-9]{2}[A-Z]{4}[A-Z0-9]{21}',
        RO: 'RO[0-9]{2}[A-Z]{4}[A-Z0-9]{16}',
        RS: 'RS[0-9]{2}[0-9]{3}[0-9]{13}[0-9]{2}',
        SA: 'SA[0-9]{2}[0-9]{2}[A-Z0-9]{18}',
        SE: 'SE[0-9]{2}[0-9]{3}[0-9]{16}[0-9]{1}',
        SI: 'SI[0-9]{2}[0-9]{5}[0-9]{8}[0-9]{2}',
        SK: 'SK[0-9]{2}[0-9]{4}[0-9]{6}[0-9]{10}',
        SM: 'SM[0-9]{2}[A-Z]{1}[0-9]{5}[0-9]{5}[A-Z0-9]{12}',
        SN: 'SN[0-9]{2}[A-Z]{1}[0-9]{23}',
        TL: 'TL38[0-9]{3}[0-9]{14}[0-9]{2}',
        TN: 'TN59[0-9]{2}[0-9]{3}[0-9]{13}[0-9]{2}',
        TR: 'TR[0-9]{2}[0-9]{5}[A-Z0-9]{1}[A-Z0-9]{16}',
        VG: 'VG[0-9]{2}[A-Z]{4}[0-9]{16}',
        XK: 'XK[0-9]{2}[0-9]{4}[0-9]{10}[0-9]{2}',
    };
    const SEPA_COUNTRIES = [
        'AT', 'BE', 'BG', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES',
        'FI', 'FR', 'GB', 'GI', 'GR', 'HR', 'HU', 'IE', 'IS', 'IT',
        'LI', 'LT', 'LU', 'LV', 'MC', 'MT', 'NL', 'NO', 'PL', 'PT',
        'RO', 'SE', 'SI', 'SK', 'SM',
    ];
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const opts = Object.assign({}, input.options);
            let v = input.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            const country = opts.country || v.substr(0, 2);
            if (!IBAN_PATTERNS[country]) {
                return {
                    message: opts.message,
                    valid: false,
                };
            }
            if (opts.sepa !== undefined) {
                const isSepaCountry = SEPA_COUNTRIES.indexOf(country) !== -1;
                if (((opts.sepa === 'true' || opts.sepa === true) && !isSepaCountry)
                    || ((opts.sepa === 'false' || opts.sepa === false) && isSepaCountry)) {
                    return {
                        message: opts.message,
                        valid: false,
                    };
                }
            }
            const msg = input.l10n
                ? format(opts.message || input.l10n.iban.country, input.l10n.iban.countries[country])
                : opts.message;
            if (!(new RegExp(`^${IBAN_PATTERNS[country]}$`)).test(input.value)) {
                return {
                    message: msg,
                    valid: false,
                };
            }
            v = `${v.substr(4)}${v.substr(0, 4)}`;
            v = v.split('').map((n) => {
                const code = n.charCodeAt(0);
                return (code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0))
                    ? (code - 'A'.charCodeAt(0) + 10)
                    : n;
            }).join('');
            let temp = parseInt(v.substr(0, 1), 10);
            const length = v.length;
            for (let i = 1; i < length; ++i) {
                temp = (temp * 10 + parseInt(v.substr(i, 1), 10)) % 97;
            }
            return {
                message: msg,
                valid: (temp === 1),
            };
        },
    };
}

function id() {
    const COUNTRY_CODES = [
        'BA', 'BG', 'BR', 'CH', 'CL', 'CN', 'CZ', 'DK', 'EE', 'ES', 'FI', 'HR', 'IE', 'IS', 'LT', 'LV', 'ME', 'MK',
        'NL', 'PL', 'RO', 'RS', 'SE', 'SI', 'SK', 'SM', 'TH', 'TR', 'ZA',
    ];
    const validateJMBG = (value, countryCode) => {
        if (!/^\d{13}$/.test(value)) {
            return false;
        }
        const day = parseInt(value.substr(0, 2), 10);
        const month = parseInt(value.substr(2, 2), 10);
        const rr = parseInt(value.substr(7, 2), 10);
        const k = parseInt(value.substr(12, 1), 10);
        if (day > 31 || month > 12) {
            return false;
        }
        let sum = 0;
        for (let i = 0; i < 6; i++) {
            sum += (7 - i) * (parseInt(value.charAt(i), 10) + parseInt(value.charAt(i + 6), 10));
        }
        sum = 11 - sum % 11;
        if (sum === 10 || sum === 11) {
            sum = 0;
        }
        if (sum !== k) {
            return false;
        }
        switch (countryCode.toUpperCase()) {
            case 'BA': return (10 <= rr && rr <= 19);
            case 'MK': return (41 <= rr && rr <= 49);
            case 'ME': return (20 <= rr && rr <= 29);
            case 'RS': return (70 <= rr && rr <= 99);
            case 'SI': return (50 <= rr && rr <= 59);
            default: return true;
        }
    };
    const ba = (value) => {
        return validateJMBG(value, 'BA');
    };
    const me = (value) => {
        return validateJMBG(value, 'ME');
    };
    const mk = (value) => {
        return validateJMBG(value, 'MK');
    };
    const rs = (value) => {
        return validateJMBG(value, 'RS');
    };
    const si = (value) => {
        return validateJMBG(value, 'SI');
    };
    const bg = (value) => {
        if (!/^\d{10}$/.test(value) && !/^\d{6}\s\d{3}\s\d{1}$/.test(value)) {
            return false;
        }
        const v = value.replace(/\s/g, '');
        let year = parseInt(v.substr(0, 2), 10) + 1900;
        let month = parseInt(v.substr(2, 2), 10);
        const day = parseInt(v.substr(4, 2), 10);
        if (month > 40) {
            year += 100;
            month -= 40;
        }
        else if (month > 20) {
            year -= 100;
            month -= 20;
        }
        if (!isValidDate(year, month, day)) {
            return false;
        }
        let sum = 0;
        const weight = [2, 4, 8, 5, 10, 9, 7, 3, 6];
        for (let i = 0; i < 9; i++) {
            sum += parseInt(v.charAt(i), 10) * weight[i];
        }
        sum = (sum % 11) % 10;
        return `${sum}` === v.substr(9, 1);
    };
    const br = (value) => {
        const v = value.replace(/\D/g, '');
        if (!/^\d{11}$/.test(v) || /^1{11}|2{11}|3{11}|4{11}|5{11}|6{11}|7{11}|8{11}|9{11}|0{11}$/.test(v)) {
            return false;
        }
        let d1 = 0;
        let i;
        for (i = 0; i < 9; i++) {
            d1 += (10 - i) * parseInt(v.charAt(i), 10);
        }
        d1 = 11 - d1 % 11;
        if (d1 === 10 || d1 === 11) {
            d1 = 0;
        }
        if (`${d1}` !== v.charAt(9)) {
            return false;
        }
        let d2 = 0;
        for (i = 0; i < 10; i++) {
            d2 += (11 - i) * parseInt(v.charAt(i), 10);
        }
        d2 = 11 - d2 % 11;
        if (d2 === 10 || d2 === 11) {
            d2 = 0;
        }
        return `${d2}` === v.charAt(10);
    };
    const ch = (value) => {
        if (!/^756[\.]{0,1}[0-9]{4}[\.]{0,1}[0-9]{4}[\.]{0,1}[0-9]{2}$/.test(value)) {
            return false;
        }
        const v = value.replace(/\D/g, '').substr(3);
        const length = v.length;
        const weight = (length === 8) ? [3, 1] : [1, 3];
        let sum = 0;
        for (let i = 0; i < length - 1; i++) {
            sum += parseInt(v.charAt(i), 10) * weight[i % 2];
        }
        sum = 10 - sum % 10;
        return `${sum}` === v.charAt(length - 1);
    };
    const cl = (value) => {
        if (!/^\d{7,8}[-]{0,1}[0-9K]$/i.test(value)) {
            return false;
        }
        let v = value.replace(/\-/g, '');
        while (v.length < 9) {
            v = `0${v}`;
        }
        const weight = [3, 2, 7, 6, 5, 4, 3, 2];
        let sum = 0;
        for (let i = 0; i < 8; i++) {
            sum += parseInt(v.charAt(i), 10) * weight[i];
        }
        sum = 11 - sum % 11;
        let cd = `${sum}`;
        if (sum === 11) {
            cd = '0';
        }
        else if (sum === 10) {
            cd = 'K';
        }
        return cd === v.charAt(8).toUpperCase();
    };
    const cn = (value) => {
        const v = value.trim();
        if (!/^\d{15}$/.test(v) && !/^\d{17}[\dXx]{1}$/.test(v)) {
            return false;
        }
        const adminDivisionCodes = {
            11: {
                0: [0],
                1: [[0, 9], [11, 17]],
                2: [0, 28, 29],
            },
            12: {
                0: [0],
                1: [[0, 16]],
                2: [0, 21, 23, 25],
            },
            13: {
                0: [0],
                1: [[0, 5], 7, 8, 21, [23, 33], [81, 85]],
                2: [[0, 5], [7, 9], [23, 25], 27, 29, 30, 81, 83],
                3: [[0, 4], [21, 24]],
                4: [[0, 4], 6, 21, [23, 35], 81],
                5: [[0, 3], [21, 35], 81, 82],
                6: [[0, 4], [21, 38], [81, 84]],
                7: [[0, 3], 5, 6, [21, 33]],
                8: [[0, 4], [21, 28]],
                9: [[0, 3], [21, 30], [81, 84]],
                10: [[0, 3], [22, 26], 28, 81, 82],
                11: [[0, 2], [21, 28], 81, 82],
            },
            14: {
                0: [0],
                1: [0, 1, [5, 10], [21, 23], 81],
                2: [[0, 3], 11, 12, [21, 27]],
                3: [[0, 3], 11, 21, 22],
                4: [[0, 2], 11, 21, [23, 31], 81],
                5: [[0, 2], 21, 22, 24, 25, 81],
                6: [[0, 3], [21, 24]],
                7: [[0, 2], [21, 29], 81],
                8: [[0, 2], [21, 30], 81, 82],
                9: [[0, 2], [21, 32], 81],
                10: [[0, 2], [21, 34], 81, 82],
                11: [[0, 2], [21, 30], 81, 82],
                23: [[0, 3], 22, 23, [25, 30], 32, 33],
            },
            15: {
                0: [0],
                1: [[0, 5], [21, 25]],
                2: [[0, 7], [21, 23]],
                3: [[0, 4]],
                4: [[0, 4], [21, 26], [28, 30]],
                5: [[0, 2], [21, 26], 81],
                6: [[0, 2], [21, 27]],
                7: [[0, 3], [21, 27], [81, 85]],
                8: [[0, 2], [21, 26]],
                9: [[0, 2], [21, 29], 81],
                22: [[0, 2], [21, 24]],
                25: [[0, 2], [22, 31]],
                26: [[0, 2], [24, 27], [29, 32], 34],
                28: [0, 1, [22, 27]],
                29: [0, [21, 23]],
            },
            21: {
                0: [0],
                1: [[0, 6], [11, 14], [22, 24], 81],
                2: [[0, 4], [11, 13], 24, [81, 83]],
                3: [[0, 4], 11, 21, 23, 81],
                4: [[0, 4], 11, [21, 23]],
                5: [[0, 5], 21, 22],
                6: [[0, 4], 24, 81, 82],
                7: [[0, 3], 11, 26, 27, 81, 82],
                8: [[0, 4], 11, 81, 82],
                9: [[0, 5], 11, 21, 22],
                10: [[0, 5], 11, 21, 81],
                11: [[0, 3], 21, 22],
                12: [[0, 2], 4, 21, 23, 24, 81, 82],
                13: [[0, 3], 21, 22, 24, 81, 82],
                14: [[0, 4], 21, 22, 81],
            },
            22: {
                0: [0],
                1: [[0, 6], 12, 22, [81, 83]],
                2: [[0, 4], 11, 21, [81, 84]],
                3: [[0, 3], 22, 23, 81, 82],
                4: [[0, 3], 21, 22],
                5: [[0, 3], 21, 23, 24, 81, 82],
                6: [[0, 2], 4, 5, [21, 23], 25, 81],
                7: [[0, 2], [21, 24], 81],
                8: [[0, 2], 21, 22, 81, 82],
                24: [[0, 6], 24, 26],
            },
            23: {
                0: [0],
                1: [[0, 12], 21, [23, 29], [81, 84]],
                2: [[0, 8], 21, [23, 25], 27, [29, 31], 81],
                3: [[0, 7], 21, 81, 82],
                4: [[0, 7], 21, 22],
                5: [[0, 3], 5, 6, [21, 24]],
                6: [[0, 6], [21, 24]],
                7: [[0, 16], 22, 81],
                8: [[0, 5], 11, 22, 26, 28, 33, 81, 82],
                9: [[0, 4], 21],
                10: [[0, 5], 24, 25, 81, [83, 85]],
                11: [[0, 2], 21, 23, 24, 81, 82],
                12: [[0, 2], [21, 26], [81, 83]],
                27: [[0, 4], [21, 23]],
            },
            31: {
                0: [0],
                1: [0, 1, [3, 10], [12, 20]],
                2: [0, 30],
            },
            32: {
                0: [0],
                1: [[0, 7], 11, [13, 18], 24, 25],
                2: [[0, 6], 11, 81, 82],
                3: [[0, 5], 11, 12, [21, 24], 81, 82],
                4: [[0, 2], 4, 5, 11, 12, 81, 82],
                5: [[0, 9], [81, 85]],
                6: [[0, 2], 11, 12, 21, 23, [81, 84]],
                7: [0, 1, 3, 5, 6, [21, 24]],
                8: [[0, 4], 11, 26, [29, 31]],
                9: [[0, 3], [21, 25], 28, 81, 82],
                10: [[0, 3], 11, 12, 23, 81, 84, 88],
                11: [[0, 2], 11, 12, [81, 83]],
                12: [[0, 4], [81, 84]],
                13: [[0, 2], 11, [21, 24]],
            },
            33: {
                0: [0],
                1: [[0, 6], [8, 10], 22, 27, 82, 83, 85],
                2: [0, 1, [3, 6], 11, 12, 25, 26, [81, 83]],
                3: [[0, 4], 22, 24, [26, 29], 81, 82],
                4: [[0, 2], 11, 21, 24, [81, 83]],
                5: [[0, 3], [21, 23]],
                6: [[0, 2], 21, 24, [81, 83]],
                7: [[0, 3], 23, 26, 27, [81, 84]],
                8: [[0, 3], 22, 24, 25, 81],
                9: [[0, 3], 21, 22],
                10: [[0, 4], [21, 24], 81, 82],
                11: [[0, 2], [21, 27], 81],
            },
            34: {
                0: [0],
                1: [[0, 4], 11, [21, 24], 81],
                2: [[0, 4], 7, 8, [21, 23], 25],
                3: [[0, 4], 11, [21, 23]],
                4: [[0, 6], 21],
                5: [[0, 4], 6, [21, 23]],
                6: [[0, 4], 21],
                7: [[0, 3], 11, 21],
                8: [[0, 3], 11, [22, 28], 81],
                10: [[0, 4], [21, 24]],
                11: [[0, 3], 22, [24, 26], 81, 82],
                12: [[0, 4], 21, 22, 25, 26, 82],
                13: [[0, 2], [21, 24]],
                14: [[0, 2], [21, 24]],
                15: [[0, 3], [21, 25]],
                16: [[0, 2], [21, 23]],
                17: [[0, 2], [21, 23]],
                18: [[0, 2], [21, 25], 81],
            },
            35: {
                0: [0],
                1: [[0, 5], 11, [21, 25], 28, 81, 82],
                2: [[0, 6], [11, 13]],
                3: [[0, 5], 22],
                4: [[0, 3], 21, [23, 30], 81],
                5: [[0, 5], 21, [24, 27], [81, 83]],
                6: [[0, 3], [22, 29], 81],
                7: [[0, 2], [21, 25], [81, 84]],
                8: [[0, 2], [21, 25], 81],
                9: [[0, 2], [21, 26], 81, 82],
            },
            36: {
                0: [0],
                1: [[0, 5], 11, [21, 24]],
                2: [[0, 3], 22, 81],
                3: [[0, 2], 13, [21, 23]],
                4: [[0, 3], 21, [23, 30], 81, 82],
                5: [[0, 2], 21],
                6: [[0, 2], 22, 81],
                7: [[0, 2], [21, 35], 81, 82],
                8: [[0, 3], [21, 30], 81],
                9: [[0, 2], [21, 26], [81, 83]],
                10: [[0, 2], [21, 30]],
                11: [[0, 2], [21, 30], 81],
            },
            37: {
                0: [0],
                1: [[0, 5], 12, 13, [24, 26], 81],
                2: [[0, 3], 5, [11, 14], [81, 85]],
                3: [[0, 6], [21, 23]],
                4: [[0, 6], 81],
                5: [[0, 3], [21, 23]],
                6: [[0, 2], [11, 13], 34, [81, 87]],
                7: [[0, 5], 24, 25, [81, 86]],
                8: [[0, 2], 11, [26, 32], [81, 83]],
                9: [[0, 3], 11, 21, 23, 82, 83],
                10: [[0, 2], [81, 83]],
                11: [[0, 3], 21, 22],
                12: [[0, 3]],
                13: [[0, 2], 11, 12, [21, 29]],
                14: [[0, 2], [21, 28], 81, 82],
                15: [[0, 2], [21, 26], 81],
                16: [[0, 2], [21, 26]],
                17: [[0, 2], [21, 28]],
            },
            41: {
                0: [0],
                1: [[0, 6], 8, 22, [81, 85]],
                2: [[0, 5], 11, [21, 25]],
                3: [[0, 7], 11, [22, 29], 81],
                4: [[0, 4], 11, [21, 23], 25, 81, 82],
                5: [[0, 3], 5, 6, 22, 23, 26, 27, 81],
                6: [[0, 3], 11, 21, 22],
                7: [[0, 4], 11, 21, [24, 28], 81, 82],
                8: [[0, 4], 11, [21, 23], 25, [81, 83]],
                9: [[0, 2], 22, 23, [26, 28]],
                10: [[0, 2], [23, 25], 81, 82],
                11: [[0, 4], [21, 23]],
                12: [[0, 2], 21, 22, 24, 81, 82],
                13: [[0, 3], [21, 30], 81],
                14: [[0, 3], [21, 26], 81],
                15: [[0, 3], [21, 28]],
                16: [[0, 2], [21, 28], 81],
                17: [[0, 2], [21, 29]],
                90: [0, 1],
            },
            42: {
                0: [0],
                1: [[0, 7], [11, 17]],
                2: [[0, 5], 22, 81],
                3: [[0, 3], [21, 25], 81],
                5: [[0, 6], [25, 29], [81, 83]],
                6: [[0, 2], 6, 7, [24, 26], [82, 84]],
                7: [[0, 4]],
                8: [[0, 2], 4, 21, 22, 81],
                9: [[0, 2], [21, 23], 81, 82, 84],
                10: [[0, 3], [22, 24], 81, 83, 87],
                11: [[0, 2], [21, 27], 81, 82],
                12: [[0, 2], [21, 24], 81],
                13: [[0, 3], 21, 81],
                28: [[0, 2], 22, 23, [25, 28]],
                90: [0, [4, 6], 21],
            },
            43: {
                0: [0],
                1: [[0, 5], 11, 12, 21, 22, 24, 81],
                2: [[0, 4], 11, 21, [23, 25], 81],
                3: [[0, 2], 4, 21, 81, 82],
                4: [0, 1, [5, 8], 12, [21, 24], 26, 81, 82],
                5: [[0, 3], 11, [21, 25], [27, 29], 81],
                6: [[0, 3], 11, 21, 23, 24, 26, 81, 82],
                7: [[0, 3], [21, 26], 81],
                8: [[0, 2], 11, 21, 22],
                9: [[0, 3], [21, 23], 81],
                10: [[0, 3], [21, 28], 81],
                11: [[0, 3], [21, 29]],
                12: [[0, 2], [21, 30], 81],
                13: [[0, 2], 21, 22, 81, 82],
                31: [0, 1, [22, 27], 30],
            },
            44: {
                0: [0],
                1: [[0, 7], [11, 16], 83, 84],
                2: [[0, 5], 21, 22, 24, 29, 32, 33, 81, 82],
                3: [0, 1, [3, 8]],
                4: [[0, 4]],
                5: [0, 1, [6, 15], 23, 82, 83],
                6: [0, 1, [4, 8]],
                7: [0, 1, [3, 5], 81, [83, 85]],
                8: [[0, 4], 11, 23, 25, [81, 83]],
                9: [[0, 3], 23, [81, 83]],
                12: [[0, 3], [23, 26], 83, 84],
                13: [[0, 3], [22, 24], 81],
                14: [[0, 2], [21, 24], 26, 27, 81],
                15: [[0, 2], 21, 23, 81],
                16: [[0, 2], [21, 25]],
                17: [[0, 2], 21, 23, 81],
                18: [[0, 3], 21, 23, [25, 27], 81, 82],
                19: [0],
                20: [0],
                51: [[0, 3], 21, 22],
                52: [[0, 3], 21, 22, 24, 81],
                53: [[0, 2], [21, 23], 81],
            },
            45: {
                0: [0],
                1: [[0, 9], [21, 27]],
                2: [[0, 5], [21, 26]],
                3: [[0, 5], 11, 12, [21, 32]],
                4: [0, 1, [3, 6], 11, [21, 23], 81],
                5: [[0, 3], 12, 21],
                6: [[0, 3], 21, 81],
                7: [[0, 3], 21, 22],
                8: [[0, 4], 21, 81],
                9: [[0, 3], [21, 24], 81],
                10: [[0, 2], [21, 31]],
                11: [[0, 2], [21, 23]],
                12: [[0, 2], [21, 29], 81],
                13: [[0, 2], [21, 24], 81],
                14: [[0, 2], [21, 25], 81],
            },
            46: {
                0: [0],
                1: [0, 1, [5, 8]],
                2: [0, 1],
                3: [0, [21, 23]],
                90: [[0, 3], [5, 7], [21, 39]],
            },
            50: {
                0: [0],
                1: [[0, 19]],
                2: [0, [22, 38], [40, 43]],
                3: [0, [81, 84]],
            },
            51: {
                0: [0],
                1: [0, 1, [4, 8], [12, 15], [21, 24], 29, 31, 32, [81, 84]],
                3: [[0, 4], 11, 21, 22],
                4: [[0, 3], 11, 21, 22],
                5: [[0, 4], 21, 22, 24, 25],
                6: [0, 1, 3, 23, 26, [81, 83]],
                7: [0, 1, 3, 4, [22, 27], 81],
                8: [[0, 2], 11, 12, [21, 24]],
                9: [[0, 4], [21, 23]],
                10: [[0, 2], 11, 24, 25, 28],
                11: [[0, 2], [11, 13], 23, 24, 26, 29, 32, 33, 81],
                13: [[0, 4], [21, 25], 81],
                14: [[0, 2], [21, 25]],
                15: [[0, 3], [21, 29]],
                16: [[0, 3], [21, 23], 81],
                17: [[0, 3], [21, 25], 81],
                18: [[0, 3], [21, 27]],
                19: [[0, 3], [21, 23]],
                20: [[0, 2], 21, 22, 81],
                32: [0, [21, 33]],
                33: [0, [21, 38]],
                34: [0, 1, [22, 37]],
            },
            52: {
                0: [0],
                1: [[0, 3], [11, 15], [21, 23], 81],
                2: [0, 1, 3, 21, 22],
                3: [[0, 3], [21, 30], 81, 82],
                4: [[0, 2], [21, 25]],
                5: [[0, 2], [21, 27]],
                6: [[0, 3], [21, 28]],
                22: [0, 1, [22, 30]],
                23: [0, 1, [22, 28]],
                24: [0, 1, [22, 28]],
                26: [0, 1, [22, 36]],
                27: [[0, 2], 22, 23, [25, 32]],
            },
            53: {
                0: [0],
                1: [[0, 3], [11, 14], 21, 22, [24, 29], 81],
                3: [[0, 2], [21, 26], 28, 81],
                4: [[0, 2], [21, 28]],
                5: [[0, 2], [21, 24]],
                6: [[0, 2], [21, 30]],
                7: [[0, 2], [21, 24]],
                8: [[0, 2], [21, 29]],
                9: [[0, 2], [21, 27]],
                23: [0, 1, [22, 29], 31],
                25: [[0, 4], [22, 32]],
                26: [0, 1, [21, 28]],
                27: [0, 1, [22, 30]], 28: [0, 1, 22, 23],
                29: [0, 1, [22, 32]],
                31: [0, 2, 3, [22, 24]],
                34: [0, [21, 23]],
                33: [0, 21, [23, 25]],
                35: [0, [21, 28]],
            },
            54: {
                0: [0],
                1: [[0, 2], [21, 27]],
                21: [0, [21, 29], 32, 33],
                22: [0, [21, 29], [31, 33]],
                23: [0, 1, [22, 38]],
                24: [0, [21, 31]],
                25: [0, [21, 27]],
                26: [0, [21, 27]],
            },
            61: {
                0: [0],
                1: [[0, 4], [11, 16], 22, [24, 26]],
                2: [[0, 4], 22],
                3: [[0, 4], [21, 24], [26, 31]],
                4: [[0, 4], [22, 31], 81],
                5: [[0, 2], [21, 28], 81, 82],
                6: [[0, 2], [21, 32]],
                7: [[0, 2], [21, 30]],
                8: [[0, 2], [21, 31]],
                9: [[0, 2], [21, 29]],
                10: [[0, 2], [21, 26]],
            },
            62: {
                0: [0],
                1: [[0, 5], 11, [21, 23]],
                2: [0, 1],
                3: [[0, 2], 21],
                4: [[0, 3], [21, 23]],
                5: [[0, 3], [21, 25]],
                6: [[0, 2], [21, 23]],
                7: [[0, 2], [21, 25]],
                8: [[0, 2], [21, 26]],
                9: [[0, 2], [21, 24], 81, 82],
                10: [[0, 2], [21, 27]],
                11: [[0, 2], [21, 26]],
                12: [[0, 2], [21, 28]],
                24: [0, 21, [24, 29]],
                26: [0, 21, [23, 30]],
                29: [0, 1, [21, 27]],
                30: [0, 1, [21, 27]],
            },
            63: {
                0: [0],
                1: [[0, 5], [21, 23]],
                2: [0, 2, [21, 25]],
                21: [0, [21, 23], [26, 28]],
                22: [0, [21, 24]],
                23: [0, [21, 24]],
                25: [0, [21, 25]],
                26: [0, [21, 26]],
                27: [0, 1, [21, 26]],
                28: [[0, 2], [21, 23]],
            },
            64: {
                0: [0],
                1: [0, 1, [4, 6], 21, 22, 81],
                2: [[0, 3], 5, [21, 23]],
                3: [[0, 3], [21, 24], 81],
                4: [[0, 2], [21, 25]],
                5: [[0, 2], 21, 22],
            },
            65: {
                0: [0],
                1: [[0, 9], 21],
                2: [[0, 5]],
                21: [0, 1, 22, 23],
                22: [0, 1, 22, 23],
                23: [[0, 3], [23, 25], 27, 28],
                28: [0, 1, [22, 29]],
                29: [0, 1, [22, 29]],
                30: [0, 1, [22, 24]], 31: [0, 1, [21, 31]],
                32: [0, 1, [21, 27]],
                40: [0, 2, 3, [21, 28]],
                42: [[0, 2], 21, [23, 26]],
                43: [0, 1, [21, 26]],
                90: [[0, 4]], 27: [[0, 2], 22, 23],
            },
            71: { 0: [0] },
            81: { 0: [0] },
            82: { 0: [0] },
        };
        const provincial = parseInt(v.substr(0, 2), 10);
        const prefectural = parseInt(v.substr(2, 2), 10);
        const county = parseInt(v.substr(4, 2), 10);
        if (!adminDivisionCodes[provincial] || !adminDivisionCodes[provincial][prefectural]) {
            return false;
        }
        let inRange = false;
        const rangeDef = adminDivisionCodes[provincial][prefectural];
        let i;
        for (i = 0; i < rangeDef.length; i++) {
            if ((Array.isArray(rangeDef[i]) && rangeDef[i][0] <= county && county <= rangeDef[i][1])
                || (!Array.isArray(rangeDef[i]) && county === rangeDef[i])) {
                inRange = true;
                break;
            }
        }
        if (!inRange) {
            return false;
        }
        let dob;
        if (v.length === 18) {
            dob = v.substr(6, 8);
        }
        else {
            dob = `19${v.substr(6, 6)}`;
        }
        const year = parseInt(dob.substr(0, 4), 10);
        const month = parseInt(dob.substr(4, 2), 10);
        const day = parseInt(dob.substr(6, 2), 10);
        if (!isValidDate(year, month, day)) {
            return false;
        }
        if (v.length === 18) {
            const weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
            let sum = 0;
            for (i = 0; i < 17; i++) {
                sum += parseInt(v.charAt(i), 10) * weight[i];
            }
            sum = (12 - (sum % 11)) % 11;
            const checksum = (v.charAt(17).toUpperCase() !== 'X') ? parseInt(v.charAt(17), 10) : 10;
            return checksum === sum;
        }
        return true;
    };
    const cz = (value) => {
        if (!/^\d{9,10}$/.test(value)) {
            return false;
        }
        let year = 1900 + parseInt(value.substr(0, 2), 10);
        const month = parseInt(value.substr(2, 2), 10) % 50 % 20;
        const day = parseInt(value.substr(4, 2), 10);
        if (value.length === 9) {
            if (year >= 1980) {
                year -= 100;
            }
            if (year > 1953) {
                return false;
            }
        }
        else if (year < 1954) {
            year += 100;
        }
        if (!isValidDate(year, month, day)) {
            return false;
        }
        if (value.length === 10) {
            let check = parseInt(value.substr(0, 9), 10) % 11;
            if (year < 1985) {
                check = check % 10;
            }
            return `${check}` === value.substr(9, 1);
        }
        return true;
    };
    const dk = (value) => {
        if (!/^[0-9]{6}[-]{0,1}[0-9]{4}$/.test(value)) {
            return false;
        }
        const v = value.replace(/-/g, '');
        const day = parseInt(v.substr(0, 2), 10);
        const month = parseInt(v.substr(2, 2), 10);
        let year = parseInt(v.substr(4, 2), 10);
        switch (true) {
            case ('5678'.indexOf(v.charAt(6)) !== -1 && year >= 58):
                year += 1800;
                break;
            case ('0123'.indexOf(v.charAt(6)) !== -1):
            case ('49'.indexOf(v.charAt(6)) !== -1 && year >= 37):
                year += 1900;
                break;
            default:
                year += 2000;
                break;
        }
        return isValidDate(year, month, day);
    };
    const ee = (value) => {
        return lt(value);
    };
    const es = (value) => {
        const isDNI = /^[0-9]{8}[-]{0,1}[A-HJ-NP-TV-Z]$/.test(value);
        const isNIE = /^[XYZ][-]{0,1}[0-9]{7}[-]{0,1}[A-HJ-NP-TV-Z]$/.test(value);
        const isCIF = /^[A-HNPQS][-]{0,1}[0-9]{7}[-]{0,1}[0-9A-J]$/.test(value);
        if (!isDNI && !isNIE && !isCIF) {
            return {
                meta: null,
                valid: false,
            };
        }
        let v = value.replace(/-/g, '');
        let check;
        let tpe;
        let isValid = true;
        if (isDNI || isNIE) {
            tpe = 'DNI';
            const index = 'XYZ'.indexOf(v.charAt(0));
            if (index !== -1) {
                v = index + v.substr(1) + '';
                tpe = 'NIE';
            }
            check = parseInt(v.substr(0, 8), 10);
            check = 'TRWAGMYFPDXBNJZSQVHLCKE'[check % 23];
            return {
                meta: {
                    type: tpe,
                },
                valid: (check === v.substr(8, 1)),
            };
        }
        else {
            check = v.substr(1, 7);
            tpe = 'CIF';
            const letter = v[0];
            const control = v.substr(-1);
            let sum = 0;
            for (let i = 0; i < check.length; i++) {
                if (i % 2 !== 0) {
                    sum += parseInt(check[i], 10);
                }
                else {
                    const tmp = '' + (parseInt(check[i], 10) * 2);
                    sum += parseInt(tmp[0], 10);
                    if (tmp.length === 2) {
                        sum += parseInt(tmp[1], 10);
                    }
                }
            }
            let lastDigit = sum - (Math.floor(sum / 10) * 10);
            if (lastDigit !== 0) {
                lastDigit = 10 - lastDigit;
            }
            if ('KQS'.indexOf(letter) !== -1) {
                isValid = (control === 'JABCDEFGHI'[lastDigit]);
            }
            else if ('ABEH'.indexOf(letter) !== -1) {
                isValid = (control === ('' + lastDigit));
            }
            else {
                isValid = (control === ('' + lastDigit) || control === 'JABCDEFGHI'[lastDigit]);
            }
            return {
                meta: {
                    type: tpe,
                },
                valid: isValid,
            };
        }
    };
    const fi = (value) => {
        if (!/^[0-9]{6}[-+A][0-9]{3}[0-9ABCDEFHJKLMNPRSTUVWXY]$/.test(value)) {
            return false;
        }
        const day = parseInt(value.substr(0, 2), 10);
        const month = parseInt(value.substr(2, 2), 10);
        let year = parseInt(value.substr(4, 2), 10);
        const centuries = {
            '+': 1800,
            '-': 1900,
            'A': 2000,
        };
        year = centuries[value.charAt(6)] + year;
        if (!isValidDate(year, month, day)) {
            return false;
        }
        const individual = parseInt(value.substr(7, 3), 10);
        if (individual < 2) {
            return false;
        }
        const n = parseInt(value.substr(0, 6) + value.substr(7, 3) + '', 10);
        return '0123456789ABCDEFHJKLMNPRSTUVWXY'.charAt(n % 31) === value.charAt(10);
    };
    const hr = (value) => {
        return (/^[0-9]{11}$/.test(value) && mod11And10(value));
    };
    const ie = (value) => {
        if (!/^\d{7}[A-W][AHWTX]?$/.test(value)) {
            return false;
        }
        const getCheckDigit = (v) => {
            let input = v;
            while (input.length < 7) {
                input = `0${input}`;
            }
            const alphabet = 'WABCDEFGHIJKLMNOPQRSTUV';
            let sum = 0;
            for (let i = 0; i < 7; i++) {
                sum += parseInt(input.charAt(i), 10) * (8 - i);
            }
            sum += 9 * alphabet.indexOf(input.substr(7));
            return alphabet[sum % 23];
        };
        if (value.length === 9 && ('A' === value.charAt(8) || 'H' === value.charAt(8))) {
            return value.charAt(7) === getCheckDigit(value.substr(0, 7) + value.substr(8) + '');
        }
        else {
            return value.charAt(7) === getCheckDigit(value.substr(0, 7));
        }
    };
    const is = (value) => {
        if (!/^[0-9]{6}[-]{0,1}[0-9]{4}$/.test(value)) {
            return false;
        }
        const v = value.replace(/-/g, '');
        const day = parseInt(v.substr(0, 2), 10);
        const month = parseInt(v.substr(2, 2), 10);
        let year = parseInt(v.substr(4, 2), 10);
        const century = parseInt(v.charAt(9), 10);
        year = (century === 9) ? (1900 + year) : ((20 + century) * 100 + year);
        if (!isValidDate(year, month, day, true)) {
            return false;
        }
        const weight = [3, 2, 7, 6, 5, 4, 3, 2];
        let sum = 0;
        for (let i = 0; i < 8; i++) {
            sum += parseInt(v.charAt(i), 10) * weight[i];
        }
        sum = 11 - sum % 11;
        return `${sum}` === v.charAt(8);
    };
    const lt = (value) => {
        if (!/^[0-9]{11}$/.test(value)) {
            return false;
        }
        const gender = parseInt(value.charAt(0), 10);
        let year = parseInt(value.substr(1, 2), 10);
        const month = parseInt(value.substr(3, 2), 10);
        const day = parseInt(value.substr(5, 2), 10);
        const century = (gender % 2 === 0) ? (17 + gender / 2) : (17 + (gender + 1) / 2);
        year = century * 100 + year;
        if (!isValidDate(year, month, day, true)) {
            return false;
        }
        let weight = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
        let sum = 0;
        let i;
        for (i = 0; i < 10; i++) {
            sum += parseInt(value.charAt(i), 10) * weight[i];
        }
        sum = sum % 11;
        if (sum !== 10) {
            return `${sum}` === value.charAt(10);
        }
        sum = 0;
        weight = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];
        for (i = 0; i < 10; i++) {
            sum += parseInt(value.charAt(i), 10) * weight[i];
        }
        sum = sum % 11;
        if (sum === 10) {
            sum = 0;
        }
        return `${sum}` === value.charAt(10);
    };
    const lv = (value) => {
        if (!/^[0-9]{6}[-]{0,1}[0-9]{5}$/.test(value)) {
            return false;
        }
        const v = value.replace(/\D/g, '');
        const day = parseInt(v.substr(0, 2), 10);
        const month = parseInt(v.substr(2, 2), 10);
        let year = parseInt(v.substr(4, 2), 10);
        year = year + 1800 + parseInt(v.charAt(6), 10) * 100;
        if (!isValidDate(year, month, day, true)) {
            return false;
        }
        let sum = 0;
        const weight = [10, 5, 8, 4, 2, 1, 6, 3, 7, 9];
        for (let i = 0; i < 10; i++) {
            sum += parseInt(v.charAt(i), 10) * weight[i];
        }
        sum = (sum + 1) % 11 % 10;
        return `${sum}` === v.charAt(10);
    };
    const nl = (value) => {
        if (value.length < 8) {
            return false;
        }
        let v = value;
        if (v.length === 8) {
            v = `0${v}`;
        }
        if (!/^[0-9]{4}[.]{0,1}[0-9]{2}[.]{0,1}[0-9]{3}$/.test(v)) {
            return false;
        }
        v = v.replace(/\./g, '');
        if (parseInt(v, 10) === 0) {
            return false;
        }
        let sum = 0;
        const length = v.length;
        for (let i = 0; i < length - 1; i++) {
            sum += (9 - i) * parseInt(v.charAt(i), 10);
        }
        sum = sum % 11;
        if (sum === 10) {
            sum = 0;
        }
        return `${sum}` === v.charAt(length - 1);
    };
    const pl = (value) => {
        if (!/^[0-9]{11}$/.test(value)) {
            return false;
        }
        let sum = 0;
        const length = value.length;
        const weight = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3, 7];
        for (let i = 0; i < length - 1; i++) {
            sum += weight[i] * parseInt(value.charAt(i), 10);
        }
        sum = sum % 10;
        if (sum === 0) {
            sum = 10;
        }
        sum = 10 - sum;
        return `${sum}` === value.charAt(length - 1);
    };
    const ro = (value) => {
        if (!/^[0-9]{13}$/.test(value)) {
            return false;
        }
        const gender = parseInt(value.charAt(0), 10);
        if (gender === 0 || gender === 7 || gender === 8) {
            return false;
        }
        let year = parseInt(value.substr(1, 2), 10);
        const month = parseInt(value.substr(3, 2), 10);
        const day = parseInt(value.substr(5, 2), 10);
        const centuries = {
            1: 1900,
            2: 1900,
            3: 1800,
            4: 1800,
            5: 2000,
            6: 2000,
        };
        if (day > 31 && month > 12) {
            return false;
        }
        if (gender !== 9) {
            year = centuries[gender + ''] + year;
            if (!isValidDate(year, month, day)) {
                return false;
            }
        }
        let sum = 0;
        const weight = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
        const length = value.length;
        for (let i = 0; i < length - 1; i++) {
            sum += parseInt(value.charAt(i), 10) * weight[i];
        }
        sum = sum % 11;
        if (sum === 10) {
            sum = 1;
        }
        return `${sum}` === value.charAt(length - 1);
    };
    const se = (value) => {
        if (!/^[0-9]{10}$/.test(value) && !/^[0-9]{6}[-|+][0-9]{4}$/.test(value)) {
            return false;
        }
        const v = value.replace(/[^0-9]/g, '');
        const year = parseInt(v.substr(0, 2), 10) + 1900;
        const month = parseInt(v.substr(2, 2), 10);
        const day = parseInt(v.substr(4, 2), 10);
        if (!isValidDate(year, month, day)) {
            return false;
        }
        return luhn(v);
    };
    const sk = (value) => {
        return cz(value);
    };
    const sm = (value) => {
        return /^\d{5}$/.test(value);
    };
    const th = (value) => {
        if (value.length !== 13) {
            return false;
        }
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(value.charAt(i), 10) * (13 - i);
        }
        return (11 - sum % 11) % 10 === parseInt(value.charAt(12), 10);
    };
    const tr = (value) => {
        if (value.length !== 11) {
            return false;
        }
        let sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(value.charAt(i), 10);
        }
        return (sum % 10) === parseInt(value.charAt(10), 10);
    };
    const za = (value) => {
        if (!/^[0-9]{10}[0|1][8|9][0-9]$/.test(value)) {
            return false;
        }
        let year = parseInt(value.substr(0, 2), 10);
        const currentYear = new Date().getFullYear() % 100;
        const month = parseInt(value.substr(2, 2), 10);
        const day = parseInt(value.substr(4, 2), 10);
        year = (year >= currentYear) ? (year + 1900) : (year + 2000);
        if (!isValidDate(year, month, day)) {
            return false;
        }
        return luhn(value);
    };
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const opts = Object.assign({}, input.options);
            let country = input.value.substr(0, 2);
            if ('function' === typeof opts.country) {
                country = opts.country.call(this);
            }
            else {
                country = opts.country;
            }
            if (COUNTRY_CODES.indexOf(country) === -1) {
                return { valid: true };
            }
            let result = {
                meta: {},
                valid: true,
            };
            switch (country.toLowerCase()) {
                case 'ba':
                    result.valid = ba(input.value);
                    break;
                case 'bg':
                    result.valid = bg(input.value);
                    break;
                case 'br':
                    result.valid = br(input.value);
                    break;
                case 'ch':
                    result.valid = ch(input.value);
                    break;
                case 'cl':
                    result.valid = cl(input.value);
                    break;
                case 'cn':
                    result.valid = cn(input.value);
                    break;
                case 'cz':
                    result.valid = cz(input.value);
                    break;
                case 'dk':
                    result.valid = dk(input.value);
                    break;
                case 'ee':
                    result.valid = ee(input.value);
                    break;
                case 'es':
                    result = es(input.value);
                    break;
                case 'fi':
                    result.valid = fi(input.value);
                    break;
                case 'hr':
                    result.valid = hr(input.value);
                    break;
                case 'ie':
                    result.valid = ie(input.value);
                    break;
                case 'is':
                    result.valid = is(input.value);
                    break;
                case 'lt':
                    result.valid = lt(input.value);
                    break;
                case 'lv':
                    result.valid = lv(input.value);
                    break;
                case 'me':
                    result.valid = me(input.value);
                    break;
                case 'mk':
                    result.valid = mk(input.value);
                    break;
                case 'nl':
                    result.valid = nl(input.value);
                    break;
                case 'pl':
                    result.valid = pl(input.value);
                    break;
                case 'ro':
                    result.valid = ro(input.value);
                    break;
                case 'rs':
                    result.valid = rs(input.value);
                    break;
                case 'se':
                    result.valid = se(input.value);
                    break;
                case 'si':
                    result.valid = si(input.value);
                    break;
                case 'sk':
                    result.valid = sk(input.value);
                    break;
                case 'sm':
                    result.valid = sm(input.value);
                    break;
                case 'th':
                    result.valid = th(input.value);
                    break;
                case 'tr':
                    result.valid = tr(input.value);
                    break;
                case 'za':
                    result.valid = za(input.value);
                    break;
            }
            const message = input.l10n
                ? format(opts.message || input.l10n.id.country, input.l10n.id.countries[country.toUpperCase()])
                : opts.message;
            return Object.assign({}, { message }, result);
        },
    };
}

function imei() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            switch (true) {
                case /^\d{15}$/.test(input.value):
                case /^\d{2}-\d{6}-\d{6}-\d{1}$/.test(input.value):
                case /^\d{2}\s\d{6}\s\d{6}\s\d{1}$/.test(input.value):
                    const v = input.value.replace(/[^0-9]/g, '');
                    return { valid: luhn(v) };
                case /^\d{14}$/.test(input.value):
                case /^\d{16}$/.test(input.value):
                case /^\d{2}-\d{6}-\d{6}(|-\d{2})$/.test(input.value):
                case /^\d{2}\s\d{6}\s\d{6}(|\s\d{2})$/.test(input.value):
                    return { valid: true };
                default:
                    return { valid: false };
            }
        },
    };
}

function imo() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            if (!/^IMO \d{7}$/i.test(input.value)) {
                return { valid: false };
            }
            const digits = input.value.replace(/^.*(\d{7})$/, '$1');
            let sum = 0;
            for (let i = 6; i >= 1; i--) {
                sum += (parseInt(digits.slice((6 - i), -i), 10) * (i + 1));
            }
            return { valid: (sum % 10 === parseInt(digits.charAt(6), 10)) };
        },
    };
}

function isbn() {
    return {
        validate(input) {
            if (input.value === '') {
                return {
                    meta: {
                        type: null,
                    },
                    valid: true,
                };
            }
            let tpe;
            switch (true) {
                case /^\d{9}[\dX]$/.test(input.value):
                case (input.value.length === 13 && /^(\d+)-(\d+)-(\d+)-([\dX])$/.test(input.value)):
                case (input.value.length === 13 && /^(\d+)\s(\d+)\s(\d+)\s([\dX])$/.test(input.value)):
                    tpe = 'ISBN10';
                    break;
                case /^(978|979)\d{9}[\dX]$/.test(input.value):
                case (input.value.length === 17 && /^(978|979)-(\d+)-(\d+)-(\d+)-([\dX])$/.test(input.value)):
                case (input.value.length === 17 && /^(978|979)\s(\d+)\s(\d+)\s(\d+)\s([\dX])$/.test(input.value)):
                    tpe = 'ISBN13';
                    break;
                default:
                    return {
                        meta: {
                            type: null,
                        },
                        valid: false,
                    };
            }
            const chars = input.value.replace(/[^0-9X]/gi, '').split('');
            const length = chars.length;
            let sum = 0;
            let i;
            let checksum;
            switch (tpe) {
                case 'ISBN10':
                    sum = 0;
                    for (i = 0; i < length - 1; i++) {
                        sum += parseInt(chars[i], 10) * (10 - i);
                    }
                    checksum = 11 - (sum % 11);
                    if (checksum === 11) {
                        checksum = 0;
                    }
                    else if (checksum === 10) {
                        checksum = 'X';
                    }
                    return {
                        meta: {
                            type: tpe,
                        },
                        valid: `${checksum}` === chars[length - 1],
                    };
                case 'ISBN13':
                    sum = 0;
                    for (i = 0; i < length - 1; i++) {
                        sum += ((i % 2 === 0) ? parseInt(chars[i], 10) : (parseInt(chars[i], 10) * 3));
                    }
                    checksum = 10 - (sum % 10);
                    if (checksum === 10) {
                        checksum = '0';
                    }
                    return {
                        meta: {
                            type: tpe,
                        },
                        valid: `${checksum}` === chars[length - 1],
                    };
            }
        },
    };
}

function isin() {
    const COUNTRY_CODES = 'AF|AX|AL|DZ|AS|AD|AO|AI|AQ|AG|AR|AM|AW|AU|AT|AZ|BS|BH|BD|BB|BY|BE|BZ|BJ|BM|BT|BO|BQ|BA|BW|' +
        'BV|BR|IO|BN|BG|BF|BI|KH|CM|CA|CV|KY|CF|TD|CL|CN|CX|CC|CO|KM|CG|CD|CK|CR|CI|HR|CU|CW|CY|CZ|DK|DJ|DM|DO|EC|EG|' +
        'SV|GQ|ER|EE|ET|FK|FO|FJ|FI|FR|GF|PF|TF|GA|GM|GE|DE|GH|GI|GR|GL|GD|GP|GU|GT|GG|GN|GW|GY|HT|HM|VA|HN|HK|HU|IS|' +
        'IN|ID|IR|IQ|IE|IM|IL|IT|JM|JP|JE|JO|KZ|KE|KI|KP|KR|KW|KG|LA|LV|LB|LS|LR|LY|LI|LT|LU|MO|MK|MG|MW|MY|MV|ML|MT|' +
        'MH|MQ|MR|MU|YT|MX|FM|MD|MC|MN|ME|MS|MA|MZ|MM|NA|NR|NP|NL|NC|NZ|NI|NE|NG|NU|NF|MP|NO|OM|PK|PW|PS|PA|PG|PY|PE|' +
        'PH|PN|PL|PT|PR|QA|RE|RO|RU|RW|BL|SH|KN|LC|MF|PM|VC|WS|SM|ST|SA|SN|RS|SC|SL|SG|SX|SK|SI|SB|SO|ZA|GS|SS|ES|LK|' +
        'SD|SR|SJ|SZ|SE|CH|SY|TW|TJ|TZ|TH|TL|TG|TK|TO|TT|TN|TR|TM|TC|TV|UG|UA|AE|GB|US|UM|UY|UZ|VU|VE|VN|VG|VI|WF|EH|' +
        'YE|ZM|ZW';
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const v = input.value.toUpperCase();
            const regex = new RegExp('^(' + COUNTRY_CODES + ')[0-9A-Z]{10}$');
            if (!regex.test(input.value)) {
                return { valid: false };
            }
            const length = v.length;
            let converted = '';
            let i;
            for (i = 0; i < length - 1; i++) {
                const c = v.charCodeAt(i);
                converted += ((c > 57) ? (c - 55).toString() : v.charAt(i));
            }
            let digits = '';
            const n = converted.length;
            const group = (n % 2 !== 0) ? 0 : 1;
            for (i = 0; i < n; i++) {
                digits += (parseInt(converted[i], 10) * ((i % 2) === group ? 2 : 1) + '');
            }
            let sum = 0;
            for (i = 0; i < digits.length; i++) {
                sum += parseInt(digits.charAt(i), 10);
            }
            sum = (10 - (sum % 10)) % 10;
            return { valid: `${sum}` === v.charAt(length - 1) };
        },
    };
}

function ismn() {
    return {
        validate(input) {
            if (input.value === '') {
                return {
                    meta: null,
                    valid: true,
                };
            }
            let tpe;
            switch (true) {
                case /^M\d{9}$/.test(input.value):
                case /^M-\d{4}-\d{4}-\d{1}$/.test(input.value):
                case /^M\s\d{4}\s\d{4}\s\d{1}$/.test(input.value):
                    tpe = 'ISMN10';
                    break;
                case /^9790\d{9}$/.test(input.value):
                case /^979-0-\d{4}-\d{4}-\d{1}$/.test(input.value):
                case /^979\s0\s\d{4}\s\d{4}\s\d{1}$/.test(input.value):
                    tpe = 'ISMN13';
                    break;
                default:
                    return {
                        meta: null,
                        valid: false,
                    };
            }
            let v = input.value;
            if ('ISMN10' === tpe) {
                v = `9790${v.substr(1)}`;
            }
            v = v.replace(/[^0-9]/gi, '');
            let sum = 0;
            const length = v.length;
            const weight = [1, 3];
            for (let i = 0; i < length - 1; i++) {
                sum += parseInt(v.charAt(i), 10) * weight[i % 2];
            }
            sum = 10 - sum % 10;
            return {
                meta: {
                    type: tpe,
                },
                valid: `${sum}` === v.charAt(length - 1),
            };
        },
    };
}

function issn() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            if (!/^\d{4}\-\d{3}[\dX]$/.test(input.value)) {
                return { valid: false };
            }
            const chars = input.value.replace(/[^0-9X]/gi, '').split('');
            const length = chars.length;
            let sum = 0;
            if (chars[7] === 'X') {
                chars[7] = '10';
            }
            for (let i = 0; i < length; i++) {
                sum += parseInt(chars[i], 10) * (8 - i);
            }
            return { valid: (sum % 11 === 0) };
        },
    };
}

function mac() {
    return {
        validate(input) {
            return {
                valid: (input.value === '') ||
                    /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(input.value) ||
                    /^([0-9A-Fa-f]{4}\.){2}([0-9A-Fa-f]{4})$/.test(input.value),
            };
        },
    };
}

function meid() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            let v = input.value;
            switch (true) {
                case /^[0-9A-F]{15}$/i.test(v):
                case /^[0-9A-F]{2}[- ][0-9A-F]{6}[- ][0-9A-F]{6}[- ][0-9A-F]$/i.test(v):
                case /^\d{19}$/.test(v):
                case /^\d{5}[- ]\d{5}[- ]\d{4}[- ]\d{4}[- ]\d$/.test(v):
                    const cd = v.charAt(v.length - 1);
                    v = v.replace(/[- ]/g, '');
                    if (v.match(/^\d*$/i)) {
                        return { valid: luhn(v) };
                    }
                    v = v.slice(0, -1);
                    let checkDigit = '';
                    let i;
                    for (i = 1; i <= 13; i += 2) {
                        checkDigit += (parseInt(v.charAt(i), 16) * 2).toString(16);
                    }
                    let sum = 0;
                    for (i = 0; i < checkDigit.length; i++) {
                        sum += parseInt(checkDigit.charAt(i), 16);
                    }
                    return {
                        valid: (sum % 10 === 0)
                            ? (cd === '0')
                            : (cd === ((Math.floor((sum + 10) / 10) * 10 - sum) * 2).toString(16)),
                    };
                case /^[0-9A-F]{14}$/i.test(v):
                case /^[0-9A-F]{2}[- ][0-9A-F]{6}[- ][0-9A-F]{6}$/i.test(v):
                case /^\d{18}$/.test(v):
                case /^\d{5}[- ]\d{5}[- ]\d{4}[- ]\d{4}$/.test(v):
                    return { valid: true };
                default:
                    return { valid: false };
            }
        },
    };
}

function phone() {
    const COUNTRY_CODES = [
        'AE', 'BG', 'BR', 'CN', 'CZ', 'DE', 'DK', 'ES', 'FR', 'GB', 'IN', 'MA', 'NL', 'PK', 'RO', 'RU', 'SK', 'TH',
        'US', 'VE',
    ];
    return {
        validate(input) {
            if (input.value === '') {
                return {
                    valid: true,
                };
            }
            const opts = Object.assign({}, input.options);
            const v = input.value.trim();
            let country = v.substr(0, 2);
            if ('function' === typeof opts.country) {
                country = opts.country.call(this);
            }
            else {
                country = opts.country;
            }
            if (!country || COUNTRY_CODES.indexOf(country.toUpperCase()) === -1) {
                return {
                    valid: true,
                };
            }
            let isValid = true;
            switch (country.toUpperCase()) {
                case 'AE':
                    isValid = (/^(((\+|00)?971[\s\.-]?(\(0\)[\s\.-]?)?|0)(\(5(0|2|5|6)\)|5(0|2|5|6)|2|3|4|6|7|9)|60)([\s\.-]?[0-9]){7}$/).test(v);
                    break;
                case 'BG':
                    isValid = (/^(0|359|00)(((700|900)[0-9]{5}|((800)[0-9]{5}|(800)[0-9]{4}))|(87|88|89)([0-9]{7})|((2[0-9]{7})|(([3-9][0-9])(([0-9]{6})|([0-9]{5})))))$/).test(v.replace(/\+|\s|-|\/|\(|\)/gi, ''));
                    break;
                case 'BR':
                    isValid = (/^(([\d]{4}[-.\s]{1}[\d]{2,3}[-.\s]{1}[\d]{2}[-.\s]{1}[\d]{2})|([\d]{4}[-.\s]{1}[\d]{3}[-.\s]{1}[\d]{4})|((\(?\+?[0-9]{2}\)?\s?)?(\(?\d{2}\)?\s?)?\d{4,5}[-.\s]?\d{4}))$/).test(v);
                    break;
                case 'CN':
                    isValid = (/^((00|\+)?(86(?:-| )))?((\d{11})|(\d{3}[- ]{1}\d{4}[- ]{1}\d{4})|((\d{2,4}[- ]){1}(\d{7,8}|(\d{3,4}[- ]{1}\d{4}))([- ]{1}\d{1,4})?))$/).test(v);
                    break;
                case 'CZ':
                    isValid = /^(((00)([- ]?)|\+)(420)([- ]?))?((\d{3})([- ]?)){2}(\d{3})$/.test(v);
                    break;
                case 'DE':
                    isValid = (/^(((((((00|\+)49[ \-/]?)|0)[1-9][0-9]{1,4})[ \-/]?)|((((00|\+)49\()|\(0)[1-9][0-9]{1,4}\)[ \-/]?))[0-9]{1,7}([ \-/]?[0-9]{1,5})?)$/).test(v);
                    break;
                case 'DK':
                    isValid = (/^(\+45|0045|\(45\))?\s?[2-9](\s?\d){7}$/).test(v);
                    break;
                case 'ES':
                    isValid = (/^(?:(?:(?:\+|00)34\D?))?(?:5|6|7|8|9)(?:\d\D?){8}$/).test(v);
                    break;
                case 'FR':
                    isValid = (/^(?:(?:(?:\+|00)33[ ]?(?:\(0\)[ ]?)?)|0){1}[1-9]{1}([ .-]?)(?:\d{2}\1?){3}\d{2}$/).test(v);
                    break;
                case 'GB':
                    isValid = (/^\(?(?:(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?\(?(?:0\)?[\s-]?\(?)?|0)(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}|\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4}|\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3})|\d{5}\)?[\s-]?\d{4,5}|8(?:00[\s-]?11[\s-]?11|45[\s-]?46[\s-]?4\d))(?:(?:[\s-]?(?:x|ext\.?\s?|\#)\d+)?)$/).test(v);
                    break;
                case 'IN':
                    isValid = (/((\+?)((0[ -]+)*|(91 )*)(\d{12}|\d{10}))|\d{5}([- ]*)\d{6}/).test(v);
                    break;
                case 'MA':
                    isValid = (/^(?:(?:(?:\+|00)212[\s]?(?:[\s]?\(0\)[\s]?)?)|0){1}(?:5[\s.-]?[2-3]|6[\s.-]?[13-9]){1}[0-9]{1}(?:[\s.-]?\d{2}){3}$/).test(v);
                    break;
                case 'NL':
                    isValid = (/^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9])((\s|\s?-\s?)?[0-9])((\s|\s?-\s?)?[0-9])\s?[0-9]\s?[0-9]\s?[0-9]\s?[0-9]\s?[0-9]$/gm).test(v);
                    break;
                case 'PK':
                    isValid = (/^0?3[0-9]{2}[0-9]{7}$/).test(v);
                    break;
                case 'RO':
                    isValid = (/^(\+4|)?(07[0-8]{1}[0-9]{1}|02[0-9]{2}|03[0-9]{2}){1}?(\s|\.|\-)?([0-9]{3}(\s|\.|\-|)){2}$/g).test(v);
                    break;
                case 'RU':
                    isValid = (/^((8|\+7|007)[\-\.\/ ]?)?([\(\/\.]?\d{3}[\)\/\.]?[\-\.\/ ]?)?[\d\-\.\/ ]{7,10}$/g).test(v);
                    break;
                case 'SK':
                    isValid = /^(((00)([- ]?)|\+)(421)([- ]?))?((\d{3})([- ]?)){2}(\d{3})$/.test(v);
                    break;
                case 'TH':
                    isValid = (/^0\(?([6|8-9]{2})*-([0-9]{3})*-([0-9]{4})$/).test(v);
                    break;
                case 'VE':
                    isValid = (/^0(?:2(?:12|4[0-9]|5[1-9]|6[0-9]|7[0-8]|8[1-35-8]|9[1-5]|3[45789])|4(?:1[246]|2[46]))\d{7}$/).test(v);
                    break;
                case 'US':
                default:
                    isValid = (/^(?:(1\-?)|(\+1 ?))?\(?\d{3}\)?[\-\.\s]?\d{3}[\-\.\s]?\d{4}$/).test(v);
                    break;
            }
            return {
                message: input.l10n
                    ? format(opts.message || input.l10n.phone.country, input.l10n.phone.countries[country])
                    : opts.message,
                valid: isValid,
            };
        },
    };
}

function rtn() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            if (!/^\d{9}$/.test(input.value)) {
                return { valid: false };
            }
            let sum = 0;
            for (let i = 0; i < input.value.length; i += 3) {
                sum += parseInt(input.value.charAt(i), 10) * 3
                    + parseInt(input.value.charAt(i + 1), 10) * 7
                    + parseInt(input.value.charAt(i + 2), 10);
            }
            return { valid: (sum !== 0 && sum % 10 === 0) };
        },
    };
}

function sedol() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const v = input.value.toUpperCase();
            if (!/^[0-9A-Z]{7}$/.test(v)) {
                return { valid: false };
            }
            const weight = [1, 3, 1, 7, 3, 9, 1];
            const length = v.length;
            let sum = 0;
            for (let i = 0; i < length - 1; i++) {
                sum += weight[i] * parseInt(v.charAt(i), 36);
            }
            sum = (10 - sum % 10) % 10;
            return { valid: `${sum}` === v.charAt(length - 1) };
        },
    };
}

function siren() {
    return {
        validate(input) {
            return {
                valid: (input.value === '') || (/^\d{9}$/.test(input.value) && luhn(input.value)),
            };
        },
    };
}

function siret() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const length = input.value.length;
            let sum = 0;
            let tmp;
            for (let i = 0; i < length; i++) {
                tmp = parseInt(input.value.charAt(i), 10);
                if ((i % 2) === 0) {
                    tmp = tmp * 2;
                    if (tmp > 9) {
                        tmp -= 9;
                    }
                }
                sum += tmp;
            }
            return { valid: sum % 10 === 0 };
        },
    };
}

function step() {
    const round = (input, precision) => {
        const m = Math.pow(10, precision);
        const x = input * m;
        let sign;
        switch (true) {
            case (x === 0):
                sign = 0;
                break;
            case (x > 0):
                sign = 1;
                break;
            case (x < 0):
                sign = -1;
                break;
        }
        const isHalf = (x % 1 === 0.5 * sign);
        return isHalf ? (Math.floor(x) + (sign > 0 ? 1 : 0)) / m : Math.round(x) / m;
    };
    const floatMod = (x, y) => {
        if (y === 0.0) {
            return 1.0;
        }
        const dotX = `${x}`.split('.');
        const dotY = `${y}`.split('.');
        const precision = ((dotX.length === 1) ? 0 : dotX[1].length) + ((dotY.length === 1) ? 0 : dotY[1].length);
        return round(x - y * Math.floor(x / y), precision);
    };
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const v = parseFloat(input.value);
            if (isNaN(v) || !isFinite(v)) {
                return { valid: false };
            }
            const opts = Object.assign({}, {
                baseValue: 0,
                step: 1,
            }, input.options);
            const mod = floatMod(v - opts.baseValue, opts.step);
            return {
                message: input.l10n ? format(opts.message || input.l10n.step.default, `${opts.step}`) : opts.message,
                valid: mod === 0.0 || mod === opts.step,
            };
        },
    };
}

function uuid() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const opts = Object.assign({}, input.options);
            const patterns = {
                3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
                4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
                5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
                all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
            };
            const version = opts.version ? `${opts.version}` : 'all';
            return {
                message: opts.version
                    ? (input.l10n ? format(opts.message || input.l10n.uuid.version, opts.version) : opts.message)
                    : (input.l10n ? input.l10n.uuid.default : opts.message),
                valid: (null === patterns[version]) ? true : patterns[version].test(input.value),
            };
        },
    };
}

function vat() {
    const validateVat = () => {
        return {
            at: (value) => {
                let v = value;
                if (/^ATU[0-9]{8}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^U[0-9]{8}$/.test(v)) {
                    return false;
                }
                v = v.substr(1);
                const weight = [1, 2, 1, 2, 1, 2, 1];
                let sum = 0;
                let temp = 0;
                for (let i = 0; i < 7; i++) {
                    temp = parseInt(v.charAt(i), 10) * weight[i];
                    if (temp > 9) {
                        temp = Math.floor(temp / 10) + temp % 10;
                    }
                    sum += temp;
                }
                sum = 10 - (sum + 4) % 10;
                if (sum === 10) {
                    sum = 0;
                }
                return `${sum}` === v.substr(7, 1);
            },
            be: (value) => {
                let v = value;
                if (/^BE[0]?[0-9]{9}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0]?[0-9]{9}$/.test(v)) {
                    return false;
                }
                if (v.length === 9) {
                    v = `0${v}`;
                }
                if (v.substr(1, 1) === '0') {
                    return false;
                }
                const sum = parseInt(v.substr(0, 8), 10) + parseInt(v.substr(8, 2), 10);
                return sum % 97 === 0;
            },
            bg: (value) => {
                let v = value;
                if (/^BG[0-9]{9,10}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{9,10}$/.test(v)) {
                    return false;
                }
                let sum = 0;
                let i = 0;
                if (v.length === 9) {
                    for (i = 0; i < 8; i++) {
                        sum += parseInt(v.charAt(i), 10) * (i + 1);
                    }
                    sum = sum % 11;
                    if (sum === 10) {
                        sum = 0;
                        for (i = 0; i < 8; i++) {
                            sum += parseInt(v.charAt(i), 10) * (i + 3);
                        }
                    }
                    sum = sum % 10;
                    return `${sum}` === v.substr(8);
                }
                else if (v.length === 10) {
                    const isEgn = (input) => {
                        let year = parseInt(input.substr(0, 2), 10) + 1900;
                        let month = parseInt(input.substr(2, 2), 10);
                        const day = parseInt(input.substr(4, 2), 10);
                        if (month > 40) {
                            year += 100;
                            month -= 40;
                        }
                        else if (month > 20) {
                            year -= 100;
                            month -= 20;
                        }
                        if (!isValidDate(year, month, day)) {
                            return false;
                        }
                        const weight = [2, 4, 8, 5, 10, 9, 7, 3, 6];
                        let s = 0;
                        for (let j = 0; j < 9; j++) {
                            s += parseInt(input.charAt(j), 10) * weight[j];
                        }
                        s = (s % 11) % 10;
                        return `${s}` === input.substr(9, 1);
                    };
                    const isPnf = (input) => {
                        const weight = [21, 19, 17, 13, 11, 9, 7, 3, 1];
                        let s = 0;
                        for (let j = 0; j < 9; j++) {
                            s += parseInt(input.charAt(j), 10) * weight[j];
                        }
                        s = s % 10;
                        return `${s}` === input.substr(9, 1);
                    };
                    const isVat = (input) => {
                        const weight = [4, 3, 2, 7, 6, 5, 4, 3, 2];
                        let s = 0;
                        for (let j = 0; j < 9; j++) {
                            s += parseInt(input.charAt(j), 10) * weight[j];
                        }
                        s = 11 - s % 11;
                        if (s === 10) {
                            return false;
                        }
                        if (s === 11) {
                            s = 0;
                        }
                        return `${s}` === input.substr(9, 1);
                    };
                    return isEgn(v) || isPnf(v) || isVat(v);
                }
                return false;
            },
            br: (value) => {
                if (value === '') {
                    return true;
                }
                const cnpj = value.replace(/[^\d]+/g, '');
                if (cnpj === '' || cnpj.length !== 14) {
                    return false;
                }
                if (cnpj === '00000000000000' || cnpj === '11111111111111' || cnpj === '22222222222222' ||
                    cnpj === '33333333333333' || cnpj === '44444444444444' || cnpj === '55555555555555' ||
                    cnpj === '66666666666666' || cnpj === '77777777777777' || cnpj === '88888888888888' ||
                    cnpj === '99999999999999') {
                    return false;
                }
                let length = cnpj.length - 2;
                let numbers = cnpj.substring(0, length);
                const digits = cnpj.substring(length);
                let sum = 0;
                let pos = length - 7;
                let i;
                for (i = length; i >= 1; i--) {
                    sum += parseInt(numbers.charAt(length - i), 10) * pos--;
                    if (pos < 2) {
                        pos = 9;
                    }
                }
                let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
                if (result !== parseInt(digits.charAt(0), 10)) {
                    return false;
                }
                length = length + 1;
                numbers = cnpj.substring(0, length);
                sum = 0;
                pos = length - 7;
                for (i = length; i >= 1; i--) {
                    sum += parseInt(numbers.charAt(length - i), 10) * pos--;
                    if (pos < 2) {
                        pos = 9;
                    }
                }
                result = sum % 11 < 2 ? 0 : 11 - sum % 11;
                return result === parseInt(digits.charAt(1), 10);
            },
            ch: (value) => {
                let v = value;
                if (/^CHE[0-9]{9}(MWST)?$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^E[0-9]{9}(MWST)?$/.test(v)) {
                    return false;
                }
                v = v.substr(1);
                const weight = [5, 4, 3, 2, 7, 6, 5, 4];
                let sum = 0;
                for (let i = 0; i < 8; i++) {
                    sum += parseInt(v.charAt(i), 10) * weight[i];
                }
                sum = 11 - sum % 11;
                if (sum === 10) {
                    return false;
                }
                if (sum === 11) {
                    sum = 0;
                }
                return `${sum}` === v.substr(8, 1);
            },
            cy: (value) => {
                let v = value;
                if (/^CY[0-5|9][0-9]{7}[A-Z]$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-5|9][0-9]{7}[A-Z]$/.test(v)) {
                    return false;
                }
                if (v.substr(0, 2) === '12') {
                    return false;
                }
                let sum = 0;
                const translation = {
                    0: 1, 1: 0, 2: 5, 3: 7, 4: 9,
                    5: 13, 6: 15, 7: 17, 8: 19, 9: 21,
                };
                for (let i = 0; i < 8; i++) {
                    let temp = parseInt(v.charAt(i), 10);
                    if (i % 2 === 0) {
                        temp = translation[`${temp}`];
                    }
                    sum += temp;
                }
                return `${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[sum % 26]}` === v.substr(8, 1);
            },
            cz: (value) => {
                let v = value;
                if (/^CZ[0-9]{8,10}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{8,10}$/.test(v)) {
                    return false;
                }
                let sum = 0;
                let i = 0;
                if (v.length === 8) {
                    if (`${v.charAt(0)}` === '9') {
                        return false;
                    }
                    sum = 0;
                    for (i = 0; i < 7; i++) {
                        sum += parseInt(v.charAt(i), 10) * (8 - i);
                    }
                    sum = 11 - sum % 11;
                    if (sum === 10) {
                        sum = 0;
                    }
                    if (sum === 11) {
                        sum = 1;
                    }
                    return `${sum}` === v.substr(7, 1);
                }
                else if (v.length === 9 && (`${v.charAt(0)}` === '6')) {
                    sum = 0;
                    for (i = 0; i < 7; i++) {
                        sum += parseInt(v.charAt(i + 1), 10) * (8 - i);
                    }
                    sum = 11 - sum % 11;
                    if (sum === 10) {
                        sum = 0;
                    }
                    if (sum === 11) {
                        sum = 1;
                    }
                    sum = [8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 10][sum - 1];
                    return `${sum}` === v.substr(8, 1);
                }
                else if (v.length === 9 || v.length === 10) {
                    let year = 1900 + parseInt(v.substr(0, 2), 10);
                    const month = parseInt(v.substr(2, 2), 10) % 50 % 20;
                    const day = parseInt(v.substr(4, 2), 10);
                    if (v.length === 9) {
                        if (year >= 1980) {
                            year -= 100;
                        }
                        if (year > 1953) {
                            return false;
                        }
                    }
                    else if (year < 1954) {
                        year += 100;
                    }
                    if (!isValidDate(year, month, day)) {
                        return false;
                    }
                    if (v.length === 10) {
                        let check = parseInt(v.substr(0, 9), 10) % 11;
                        if (year < 1985) {
                            check = check % 10;
                        }
                        return `${check}` === v.substr(9, 1);
                    }
                    return true;
                }
                return false;
            },
            de: (value) => {
                let v = value;
                if (/^DE[0-9]{9}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{9}$/.test(v)) {
                    return false;
                }
                return mod11And10(v);
            },
            dk: (value) => {
                let v = value;
                if (/^DK[0-9]{8}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{8}$/.test(v)) {
                    return false;
                }
                let sum = 0;
                const weight = [2, 7, 6, 5, 4, 3, 2, 1];
                for (let i = 0; i < 8; i++) {
                    sum += parseInt(v.charAt(i), 10) * weight[i];
                }
                return sum % 11 === 0;
            },
            ee: (value) => {
                let v = value;
                if (/^EE[0-9]{9}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{9}$/.test(v)) {
                    return false;
                }
                let sum = 0;
                const weight = [3, 7, 1, 3, 7, 1, 3, 7, 1];
                for (let i = 0; i < 9; i++) {
                    sum += parseInt(v.charAt(i), 10) * weight[i];
                }
                return sum % 10 === 0;
            },
            es: (value) => {
                let v = value;
                if (/^ES[0-9A-Z][0-9]{7}[0-9A-Z]$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9A-Z][0-9]{7}[0-9A-Z]$/.test(v)) {
                    return {
                        meta: null,
                        valid: false,
                    };
                }
                const dni = (input) => {
                    const check = parseInt(input.substr(0, 8), 10);
                    return `${'TRWAGMYFPDXBNJZSQVHLCKE'[check % 23]}` === input.substr(8, 1);
                };
                const nie = (input) => {
                    const check = ['XYZ'.indexOf(input.charAt(0)), input.substr(1)].join('');
                    const cd = 'TRWAGMYFPDXBNJZSQVHLCKE'[parseInt(check, 10) % 23];
                    return `${cd}` === input.substr(8, 1);
                };
                const cif = (input) => {
                    const firstChar = input.charAt(0);
                    let check;
                    if ('KLM'.indexOf(firstChar) !== -1) {
                        check = parseInt(input.substr(1, 8), 10);
                        check = 'TRWAGMYFPDXBNJZSQVHLCKE'[check % 23];
                        return `${check}` === input.substr(8, 1);
                    }
                    else if ('ABCDEFGHJNPQRSUVW'.indexOf(firstChar) !== -1) {
                        const weight = [2, 1, 2, 1, 2, 1, 2];
                        let sum = 0;
                        let temp = 0;
                        for (let i = 0; i < 7; i++) {
                            temp = parseInt(input.charAt(i + 1), 10) * weight[i];
                            if (temp > 9) {
                                temp = Math.floor(temp / 10) + temp % 10;
                            }
                            sum += temp;
                        }
                        sum = 10 - sum % 10;
                        if (sum === 10) {
                            sum = 0;
                        }
                        return `${sum}` === input.substr(8, 1) || 'JABCDEFGHI'[sum] === input.substr(8, 1);
                    }
                    return false;
                };
                const first = v.charAt(0);
                if (/^[0-9]$/.test(first)) {
                    return {
                        meta: {
                            type: 'DNI',
                        },
                        valid: dni(v),
                    };
                }
                else if (/^[XYZ]$/.test(first)) {
                    return {
                        meta: {
                            type: 'NIE',
                        },
                        valid: nie(v),
                    };
                }
                else {
                    return {
                        meta: {
                            type: 'CIF',
                        },
                        valid: cif(v),
                    };
                }
            },
            fi: (value) => {
                let v = value;
                if (/^FI[0-9]{8}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{8}$/.test(v)) {
                    return false;
                }
                const weight = [7, 9, 10, 5, 8, 4, 2, 1];
                let sum = 0;
                for (let i = 0; i < 8; i++) {
                    sum += parseInt(v.charAt(i), 10) * weight[i];
                }
                return sum % 11 === 0;
            },
            fr: (value) => {
                let v = value;
                if (/^FR[0-9A-Z]{2}[0-9]{9}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9A-Z]{2}[0-9]{9}$/.test(v)) {
                    return false;
                }
                if (!luhn(v.substr(2))) {
                    return false;
                }
                if (/^[0-9]{2}$/.test(v.substr(0, 2))) {
                    return v.substr(0, 2) === `${parseInt(v.substr(2) + '12', 10) % 97}`;
                }
                else {
                    const alphabet = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
                    let check;
                    if (/^[0-9]$/.test(v.charAt(0))) {
                        check = alphabet.indexOf(v.charAt(0)) * 24 + alphabet.indexOf(v.charAt(1)) - 10;
                    }
                    else {
                        check = alphabet.indexOf(v.charAt(0)) * 34 + alphabet.indexOf(v.charAt(1)) - 100;
                    }
                    return ((parseInt(v.substr(2), 10) + 1 + Math.floor(check / 11)) % 11) === (check % 11);
                }
            },
            gb: (value) => {
                let v = value;
                if (/^GB[0-9]{9}$/.test(v)
                    || /^GB[0-9]{12}$/.test(v)
                    || /^GBGD[0-9]{3}$/.test(v)
                    || /^GBHA[0-9]{3}$/.test(v)
                    || /^GB(GD|HA)8888[0-9]{5}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{9}$/.test(v)
                    && !/^[0-9]{12}$/.test(v)
                    && !/^GD[0-9]{3}$/.test(v)
                    && !/^HA[0-9]{3}$/.test(v)
                    && !/^(GD|HA)8888[0-9]{5}$/.test(v)) {
                    return false;
                }
                const length = v.length;
                if (length === 5) {
                    const firstTwo = v.substr(0, 2);
                    const lastThree = parseInt(v.substr(2), 10);
                    return ('GD' === firstTwo && lastThree < 500) || ('HA' === firstTwo && lastThree >= 500);
                }
                else if (length === 11 && ('GD8888' === v.substr(0, 6) || 'HA8888' === v.substr(0, 6))) {
                    if (('GD' === v.substr(0, 2) && parseInt(v.substr(6, 3), 10) >= 500)
                        || ('HA' === v.substr(0, 2) && parseInt(v.substr(6, 3), 10) < 500)) {
                        return false;
                    }
                    return parseInt(v.substr(6, 3), 10) % 97 === parseInt(v.substr(9, 2), 10);
                }
                else if (length === 9 || length === 12) {
                    const weight = [8, 7, 6, 5, 4, 3, 2, 10, 1];
                    let sum = 0;
                    for (let i = 0; i < 9; i++) {
                        sum += parseInt(v.charAt(i), 10) * weight[i];
                    }
                    sum = sum % 97;
                    if (parseInt(v.substr(0, 3), 10) >= 100) {
                        return sum === 0 || sum === 42 || sum === 55;
                    }
                    else {
                        return sum === 0;
                    }
                }
                return true;
            },
            gr: (value) => {
                let v = value;
                if (/^(GR|EL)[0-9]{9}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{9}$/.test(v)) {
                    return false;
                }
                if (v.length === 8) {
                    v = `0${v}`;
                }
                const weight = [256, 128, 64, 32, 16, 8, 4, 2];
                let sum = 0;
                for (let i = 0; i < 8; i++) {
                    sum += parseInt(v.charAt(i), 10) * weight[i];
                }
                sum = (sum % 11) % 10;
                return `${sum}` === v.substr(8, 1);
            },
            el: (value) => {
                return this.gr(value);
            },
            hu: (value) => {
                let v = value;
                if (/^HU[0-9]{8}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{8}$/.test(v)) {
                    return false;
                }
                const weight = [9, 7, 3, 1, 9, 7, 3, 1];
                let sum = 0;
                for (let i = 0; i < 8; i++) {
                    sum += parseInt(v.charAt(i), 10) * weight[i];
                }
                return sum % 10 === 0;
            },
            hr: (value) => {
                let v = value;
                if (/^HR[0-9]{11}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{11}$/.test(v)) {
                    return false;
                }
                return mod11And10(v);
            },
            ie: (value) => {
                let v = value;
                if (/^IE[0-9][0-9A-Z\*\+][0-9]{5}[A-Z]{1,2}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9][0-9A-Z\*\+][0-9]{5}[A-Z]{1,2}$/.test(v)) {
                    return false;
                }
                const getCheckDigit = (inp) => {
                    let input = inp;
                    while (input.length < 7) {
                        input = `0${input}`;
                    }
                    const alphabet = 'WABCDEFGHIJKLMNOPQRSTUV';
                    let sum = 0;
                    for (let i = 0; i < 7; i++) {
                        sum += parseInt(input.charAt(i), 10) * (8 - i);
                    }
                    sum += 9 * alphabet.indexOf(input.substr(7));
                    return alphabet[sum % 23];
                };
                if (/^[0-9]+$/.test(v.substr(0, 7))) {
                    return v.charAt(7) === getCheckDigit(`${v.substr(0, 7)}${v.substr(8)}`);
                }
                else if ('ABCDEFGHIJKLMNOPQRSTUVWXYZ+*'.indexOf(v.charAt(1)) !== -1) {
                    return v.charAt(7) === getCheckDigit(`${v.substr(2, 5)}${v.substr(0, 1)}`);
                }
                return true;
            },
            is: (value) => {
                let v = value;
                if (/^IS[0-9]{5,6}$/.test(v)) {
                    v = v.substr(2);
                }
                return /^[0-9]{5,6}$/.test(v);
            },
            it: (value) => {
                let v = value;
                if (/^IT[0-9]{11}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{11}$/.test(v)) {
                    return false;
                }
                if (parseInt(v.substr(0, 7), 10) === 0) {
                    return false;
                }
                const lastThree = parseInt(v.substr(7, 3), 10);
                if ((lastThree < 1) || (lastThree > 201) && lastThree !== 999 && lastThree !== 888) {
                    return false;
                }
                return luhn(v);
            },
            lt: (value) => {
                let v = value;
                if (/^LT([0-9]{7}1[0-9]|[0-9]{10}1[0-9])$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^([0-9]{7}1[0-9]|[0-9]{10}1[0-9])$/.test(v)) {
                    return false;
                }
                const length = v.length;
                let sum = 0;
                let i;
                for (i = 0; i < length - 1; i++) {
                    sum += parseInt(v.charAt(i), 10) * (1 + i % 9);
                }
                let check = sum % 11;
                if (check === 10) {
                    sum = 0;
                    for (i = 0; i < length - 1; i++) {
                        sum += parseInt(v.charAt(i), 10) * (1 + (i + 2) % 9);
                    }
                }
                check = check % 11 % 10;
                return `${check}` === v.charAt(length - 1);
            },
            lu: (value) => {
                let v = value;
                if (/^LU[0-9]{8}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{8}$/.test(v)) {
                    return false;
                }
                return `${parseInt(v.substr(0, 6), 10) % 89}` === v.substr(6, 2);
            },
            lv: (value) => {
                let v = value;
                if (/^LV[0-9]{11}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{11}$/.test(v)) {
                    return false;
                }
                const first = parseInt(v.charAt(0), 10);
                const length = v.length;
                let sum = 0;
                let weight = [];
                let i;
                if (first > 3) {
                    sum = 0;
                    weight = [9, 1, 4, 8, 3, 10, 2, 5, 7, 6, 1];
                    for (i = 0; i < length; i++) {
                        sum += parseInt(v.charAt(i), 10) * weight[i];
                    }
                    sum = sum % 11;
                    return sum === 3;
                }
                else {
                    const day = parseInt(v.substr(0, 2), 10);
                    const month = parseInt(v.substr(2, 2), 10);
                    let year = parseInt(v.substr(4, 2), 10);
                    year = year + 1800 + parseInt(v.charAt(6), 10) * 100;
                    if (!isValidDate(year, month, day)) {
                        return false;
                    }
                    sum = 0;
                    weight = [10, 5, 8, 4, 2, 1, 6, 3, 7, 9];
                    for (i = 0; i < length - 1; i++) {
                        sum += parseInt(v.charAt(i), 10) * weight[i];
                    }
                    sum = (sum + 1) % 11 % 10;
                    return `${sum}` === v.charAt(length - 1);
                }
            },
            mt: (value) => {
                let v = value;
                if (/^MT[0-9]{8}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{8}$/.test(v)) {
                    return false;
                }
                const weight = [3, 4, 6, 7, 8, 9, 10, 1];
                let sum = 0;
                for (let i = 0; i < 8; i++) {
                    sum += parseInt(v.charAt(i), 10) * weight[i];
                }
                return sum % 37 === 0;
            },
            nl: (value) => {
                let v = value;
                if (/^NL[0-9]{9}B[0-9]{2}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{9}B[0-9]{2}$/.test(v)) {
                    return false;
                }
                const weight = [9, 8, 7, 6, 5, 4, 3, 2];
                let sum = 0;
                for (let i = 0; i < 8; i++) {
                    sum += parseInt(v.charAt(i), 10) * weight[i];
                }
                sum = sum % 11;
                if (sum > 9) {
                    sum = 0;
                }
                return `${sum}` === v.substr(8, 1);
            },
            no: (value) => {
                let v = value;
                if (/^NO[0-9]{9}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{9}$/.test(v)) {
                    return false;
                }
                const weight = [3, 2, 7, 6, 5, 4, 3, 2];
                let sum = 0;
                for (let i = 0; i < 8; i++) {
                    sum += parseInt(v.charAt(i), 10) * weight[i];
                }
                sum = 11 - sum % 11;
                if (sum === 11) {
                    sum = 0;
                }
                return `${sum}` === v.substr(8, 1);
            },
            pl: (value) => {
                let v = value;
                if (/^PL[0-9]{10}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{10}$/.test(v)) {
                    return false;
                }
                const weight = [6, 5, 7, 2, 3, 4, 5, 6, 7, -1];
                let sum = 0;
                for (let i = 0; i < 10; i++) {
                    sum += parseInt(v.charAt(i), 10) * weight[i];
                }
                return sum % 11 === 0;
            },
            pt: (value) => {
                let v = value;
                if (/^PT[0-9]{9}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{9}$/.test(v)) {
                    return false;
                }
                const weight = [9, 8, 7, 6, 5, 4, 3, 2];
                let sum = 0;
                for (let i = 0; i < 8; i++) {
                    sum += parseInt(v.charAt(i), 10) * weight[i];
                }
                sum = 11 - sum % 11;
                if (sum > 9) {
                    sum = 0;
                }
                return `${sum}` === v.substr(8, 1);
            },
            ro: (value) => {
                let v = value;
                if (/^RO[1-9][0-9]{1,9}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[1-9][0-9]{1,9}$/.test(v)) {
                    return false;
                }
                const length = v.length;
                const weight = [7, 5, 3, 2, 1, 7, 5, 3, 2].slice(10 - length);
                let sum = 0;
                for (let i = 0; i < length - 1; i++) {
                    sum += parseInt(v.charAt(i), 10) * weight[i];
                }
                sum = (10 * sum) % 11 % 10;
                return `${sum}` === v.substr(length - 1, 1);
            },
            ru: (value) => {
                let v = value;
                if (/^RU([0-9]{10}|[0-9]{12})$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^([0-9]{10}|[0-9]{12})$/.test(v)) {
                    return false;
                }
                let i = 0;
                if (v.length === 10) {
                    const weight = [2, 4, 10, 3, 5, 9, 4, 6, 8, 0];
                    let sum = 0;
                    for (i = 0; i < 10; i++) {
                        sum += parseInt(v.charAt(i), 10) * weight[i];
                    }
                    sum = sum % 11;
                    if (sum > 9) {
                        sum = sum % 10;
                    }
                    return `${sum}` === v.substr(9, 1);
                }
                else if (v.length === 12) {
                    const weight1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8, 0];
                    const weight2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8, 0];
                    let sum1 = 0;
                    let sum2 = 0;
                    for (i = 0; i < 11; i++) {
                        sum1 += parseInt(v.charAt(i), 10) * weight1[i];
                        sum2 += parseInt(v.charAt(i), 10) * weight2[i];
                    }
                    sum1 = sum1 % 11;
                    if (sum1 > 9) {
                        sum1 = sum1 % 10;
                    }
                    sum2 = sum2 % 11;
                    if (sum2 > 9) {
                        sum2 = sum2 % 10;
                    }
                    return `${sum1}` === v.substr(10, 1) && `${sum2}` === v.substr(11, 1);
                }
                return false;
            },
            rs: (value) => {
                let v = value;
                if (/^RS[0-9]{9}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{9}$/.test(v)) {
                    return false;
                }
                let sum = 10;
                let temp = 0;
                for (let i = 0; i < 8; i++) {
                    temp = (parseInt(v.charAt(i), 10) + sum) % 10;
                    if (temp === 0) {
                        temp = 10;
                    }
                    sum = (2 * temp) % 11;
                }
                return (sum + parseInt(v.substr(8, 1), 10)) % 10 === 1;
            },
            se: (value) => {
                let v = value;
                if (/^SE[0-9]{10}01$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[0-9]{10}01$/.test(v)) {
                    return false;
                }
                v = v.substr(0, 10);
                return luhn(v);
            },
            si: (value) => {
                const res = value.match(/^(SI)?([1-9][0-9]{7})$/);
                if (!res) {
                    return false;
                }
                const v = res[1] ? value.substr(2) : value;
                const weight = [8, 7, 6, 5, 4, 3, 2];
                let sum = 0;
                for (let i = 0; i < 7; i++) {
                    sum += parseInt(v.charAt(i), 10) * weight[i];
                }
                sum = 11 - sum % 11;
                if (sum === 10) {
                    sum = 0;
                }
                return `${sum}` === v.substr(7, 1);
            },
            sk: (value) => {
                let v = value;
                if (/^SK[1-9][0-9][(2-4)|(6-9)][0-9]{7}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[1-9][0-9][(2-4)|(6-9)][0-9]{7}$/.test(v)) {
                    return false;
                }
                return parseInt(v, 10) % 11 === 0;
            },
            ve: (value) => {
                let v = value;
                if (/^VE[VEJPG][0-9]{9}$/.test(v)) {
                    v = v.substr(2);
                }
                if (!/^[VEJPG][0-9]{9}$/.test(v)) {
                    return false;
                }
                const types = {
                    E: 8,
                    G: 20,
                    J: 12,
                    P: 16,
                    V: 4,
                };
                const weight = [3, 2, 7, 6, 5, 4, 3, 2];
                let sum = types[v.charAt(0)];
                for (let i = 0; i < 8; i++) {
                    sum += parseInt(v.charAt(i + 1), 10) * weight[i];
                }
                sum = 11 - sum % 11;
                if (sum === 11 || sum === 10) {
                    sum = 0;
                }
                return `${sum}` === v.substr(9, 1);
            },
            za: (value) => {
                let v = value;
                if (/^ZA4[0-9]{9}$/.test(v)) {
                    v = v.substr(2);
                }
                return /^4[0-9]{9}$/.test(v);
            },
        };
    };
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            const opts = Object.assign({}, input.options);
            let country = input.value.substr(0, 2);
            if ('function' === typeof opts.country) {
                country = opts.country.call(this);
            }
            else {
                country = opts.country;
            }
            const result = validateVat()[country.toLowerCase()](input.value);
            const output = (result === true || result === false) ? { valid: result } : result;
            output.message = input.l10n
                ? format(opts.message || input.l10n.vat.country, input.l10n.vat.countries[country.toUpperCase()])
                : opts.message;
            return output;
        },
    };
}

function vin() {
    return {
        validate(input) {
            if (input.value === '') {
                return { valid: true };
            }
            if (!/^[a-hj-npr-z0-9]{8}[0-9xX][a-hj-npr-z0-9]{8}$/i.test(input.value)) {
                return { valid: false };
            }
            const v = input.value.toUpperCase();
            const chars = {
                A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
                J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
                S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
                0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
            };
            const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
            const length = v.length;
            let sum = 0;
            for (let i = 0; i < length; i++) {
                sum += chars[`${v.charAt(i)}`] * weights[i];
            }
            let reminder = `${sum % 11}`;
            if (reminder === '10') {
                reminder = 'X';
            }
            return { valid: reminder === v.charAt(8) };
        },
    };
}

function zipCode() {
    const COUNTRY_CODES = [
        'AT', 'BG', 'BR', 'CA', 'CH', 'CZ', 'DE', 'DK', 'ES', 'FR', 'GB', 'IE', 'IN', 'IT', 'MA', 'NL', 'PL', 'PT',
        'RO', 'RU', 'SE', 'SG', 'SK', 'US',
    ];
    const gb = (value) => {
        const firstChar = '[ABCDEFGHIJKLMNOPRSTUWYZ]';
        const secondChar = '[ABCDEFGHKLMNOPQRSTUVWXY]';
        const thirdChar = '[ABCDEFGHJKPMNRSTUVWXY]';
        const fourthChar = '[ABEHMNPRVWXY]';
        const fifthChar = '[ABDEFGHJLNPQRSTUWXYZ]';
        const regexps = [
            new RegExp(`^(${firstChar}{1}${secondChar}?[0-9]{1,2})(\\s*)([0-9]{1}${fifthChar}{2})$`, 'i'),
            new RegExp(`^(${firstChar}{1}[0-9]{1}${thirdChar}{1})(\\s*)([0-9]{1}${fifthChar}{2})$`, 'i'),
            new RegExp(`^(${firstChar}{1}${secondChar}{1}?[0-9]{1}${fourthChar}{1})(\\s*)([0-9]{1}${fifthChar}{2})$`, 'i'),
            new RegExp('^(BF1)(\\s*)([0-6]{1}[ABDEFGHJLNPQRST]{1}[ABDEFGHJLNPQRSTUWZYZ]{1})$', 'i'),
            /^(GIR)(\s*)(0AA)$/i,
            /^(BFPO)(\s*)([0-9]{1,4})$/i,
            /^(BFPO)(\s*)(c\/o\s*[0-9]{1,3})$/i,
            /^([A-Z]{4})(\s*)(1ZZ)$/i,
            /^(AI-2640)$/i,
        ];
        for (const reg of regexps) {
            if (reg.test(value)) {
                return true;
            }
        }
        return false;
    };
    return {
        validate(input) {
            const opts = Object.assign({}, input.options);
            if (input.value === '' || !opts.country) {
                return { valid: true };
            }
            let country = input.value.substr(0, 2);
            if ('function' === typeof opts.country) {
                country = opts.country.call(this);
            }
            else {
                country = opts.country;
            }
            if (!country || COUNTRY_CODES.indexOf(country.toUpperCase()) === -1) {
                return { valid: true };
            }
            let isValid = false;
            country = country.toUpperCase();
            switch (country) {
                case 'AT':
                    isValid = /^([1-9]{1})(\d{3})$/.test(input.value);
                    break;
                case 'BG':
                    isValid = /^([1-9]{1}[0-9]{3})$/.test(input.value);
                    break;
                case 'BR':
                    isValid = /^(\d{2})([\.]?)(\d{3})([\-]?)(\d{3})$/.test(input.value);
                    break;
                case 'CA':
                    isValid = /^(?:A|B|C|E|G|H|J|K|L|M|N|P|R|S|T|V|X|Y){1}[0-9]{1}(?:A|B|C|E|G|H|J|K|L|M|N|P|R|S|T|V|W|X|Y|Z){1}\s?[0-9]{1}(?:A|B|C|E|G|H|J|K|L|M|N|P|R|S|T|V|W|X|Y|Z){1}[0-9]{1}$/i.test(input.value);
                    break;
                case 'CH':
                    isValid = /^([1-9]{1})(\d{3})$/.test(input.value);
                    break;
                case 'CZ':
                    isValid = /^(\d{3})([ ]?)(\d{2})$/.test(input.value);
                    break;
                case 'DE':
                    isValid = /^(?!01000|99999)(0[1-9]\d{3}|[1-9]\d{4})$/.test(input.value);
                    break;
                case 'DK':
                    isValid = /^(DK(-|\s)?)?\d{4}$/i.test(input.value);
                    break;
                case 'ES':
                    isValid = /^(?:0[1-9]|[1-4][0-9]|5[0-2])\d{3}$/.test(input.value);
                    break;
                case 'FR':
                    isValid = /^[0-9]{5}$/i.test(input.value);
                    break;
                case 'GB':
                    isValid = gb(input.value);
                    break;
                case 'IN':
                    isValid = /^\d{3}\s?\d{3}$/.test(input.value);
                    break;
                case 'IE':
                    isValid = /^(D6W|[ACDEFHKNPRTVWXY]\d{2})\s[0-9ACDEFHKNPRTVWXY]{4}$/.test(input.value);
                    break;
                case 'IT':
                    isValid = /^(I-|IT-)?\d{5}$/i.test(input.value);
                    break;
                case 'MA':
                    isValid = /^[1-9][0-9]{4}$/i.test(input.value);
                    break;
                case 'NL':
                    isValid = /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i.test(input.value);
                    break;
                case 'PL':
                    isValid = /^[0-9]{2}\-[0-9]{3}$/.test(input.value);
                    break;
                case 'PT':
                    isValid = /^[1-9]\d{3}-\d{3}$/.test(input.value);
                    break;
                case 'RO':
                    isValid = /^(0[1-8]{1}|[1-9]{1}[0-5]{1})?[0-9]{4}$/i.test(input.value);
                    break;
                case 'RU':
                    isValid = /^[0-9]{6}$/i.test(input.value);
                    break;
                case 'SE':
                    isValid = /^(S-)?\d{3}\s?\d{2}$/i.test(input.value);
                    break;
                case 'SG':
                    isValid = /^([0][1-9]|[1-6][0-9]|[7]([0-3]|[5-9])|[8][0-2])(\d{4})$/i.test(input.value);
                    break;
                case 'SK':
                    isValid = /^(\d{3})([ ]?)(\d{2})$/.test(input.value);
                    break;
                case 'US':
                default:
                    isValid = /^\d{4,5}([\-]?\d{4})?$/.test(input.value);
                    break;
            }
            return {
                message: input.l10n ? format(opts.message || input.l10n.zipCode.country, input.l10n.zipCode.countries[country]) : opts.message,
                valid: isValid,
            };
        },
    };
}

var validators = {
    between,
    blank,
    callback,
    choice,
    creditCard,
    date,
    different,
    digits,
    emailAddress,
    file,
    greaterThan,
    identical,
    integer,
    ip,
    lessThan,
    notEmpty,
    numeric,
    promise,
    regexp,
    remote,
    stringCase,
    stringLength,
    uri,
    base64,
    bic,
    color,
    cusip,
    ean,
    ein,
    grid,
    hex,
    iban,
    id,
    imei,
    imo,
    isbn,
    isin,
    ismn,
    issn,
    mac,
    meid,
    phone,
    rtn,
    sedol,
    siren,
    siret,
    step,
    uuid,
    vat,
    vin,
    zipCode,
};

class Core {
    constructor(form, fields) {
        this.elements = {};
        this.ee = emitter();
        this.filter = filter();
        this.plugins = {};
        this.results = new Map();
        this.validators = {};
        this.form = form;
        this.fields = fields;
    }
    on(event, func) {
        this.ee.on(event, func);
        return this;
    }
    off(event, func) {
        this.ee.off(event, func);
        return this;
    }
    emit(event, ...args) {
        this.ee.emit(event, ...args);
        return this;
    }
    registerPlugin(name, plugin) {
        if (this.plugins[name]) {
            throw new Error(`The plguin ${name} is registered`);
        }
        plugin.setCore(this);
        plugin.install();
        this.plugins[name] = plugin;
        return this;
    }
    deregisterPlugin(name) {
        const plugin = this.plugins[name];
        if (plugin) {
            plugin.uninstall();
        }
        delete this.plugins[name];
        return this;
    }
    registerValidator(name, func) {
        if (this.validators[name]) {
            throw new Error(`The validator ${name} is registered`);
        }
        this.validators[name] = func;
        return this;
    }
    registerFilter(name, func) {
        this.filter.add(name, func);
        return this;
    }
    deregisterFilter(name, func) {
        this.filter.remove(name, func);
        return this;
    }
    addField(field, options) {
        const opts = Object.assign({}, {
            selector: '',
            validators: {},
        }, options);
        this.fields[field] = this.fields[field]
            ? {
                selector: opts.selector || this.fields[field].selector,
                validators: Object.assign({}, this.fields[field].validators, opts.validators),
            }
            : opts;
        this.elements[field] = this.queryElements(field);
        this.emit('core.field.added', {
            elements: this.elements[field],
            field,
            options: this.fields[field],
        });
        return this;
    }
    removeField(field) {
        if (!this.fields[field]) {
            throw new Error(`The field ${field} validators are not defined. Please ensure the field is added first`);
        }
        const elements = this.elements[field];
        const options = this.fields[field];
        delete this.elements[field];
        delete this.fields[field];
        this.emit('core.field.removed', {
            elements,
            field,
            options,
        });
        return this;
    }
    validate() {
        this.emit('core.form.validating');
        return Promise.all(Object.keys(this.fields).map((field) => this.validateField(field))).then((results) => {
            switch (true) {
                case (results.indexOf(Status$1.Invalid) !== -1):
                    this.emit('core.form.invalid');
                    return Promise.resolve(Status$1.Invalid);
                case (results.indexOf(Status$1.NotValidated) !== -1):
                    this.emit('core.form.notvalidated');
                    return Promise.resolve(Status$1.NotValidated);
                default:
                    this.emit('core.form.valid');
                    return Promise.resolve(Status$1.Valid);
            }
        });
    }
    validateField(field) {
        const result = this.results.get(field);
        if (result === Status$1.Valid || result === Status$1.Invalid) {
            return Promise.resolve(result);
        }
        this.emit('core.field.validating', field);
        const elements = this.elements[field];
        if (elements.length === 0) {
            this.emit('core.field.valid', field);
            return Promise.resolve(Status$1.Valid);
        }
        const type = elements[0].getAttribute('type');
        if ('radio' === type || 'checkbox' === type || elements.length === 1) {
            return this.validateElement(field, elements[0]);
        }
        else {
            return Promise.all(elements.map((ele) => this.validateElement(field, ele))).then((results) => {
                switch (true) {
                    case (results.indexOf(Status$1.Invalid) !== -1):
                        this.emit('core.field.invalid', field);
                        this.results.set(field, Status$1.Invalid);
                        return Promise.resolve(Status$1.Invalid);
                    case (results.indexOf(Status$1.NotValidated) !== -1):
                        this.emit('core.field.notvalidated', field);
                        this.results.delete(field);
                        return Promise.resolve(Status$1.NotValidated);
                    default:
                        this.emit('core.field.valid', field);
                        this.results.set(field, Status$1.Valid);
                        return Promise.resolve(Status$1.Valid);
                }
            });
        }
    }
    validateElement(field, ele) {
        this.results.delete(field);
        const validatorList = this.fields[field].validators;
        const elements = this.elements[field];
        this.emit('core.element.validating', {
            element: ele,
            elements,
            field,
        });
        return Promise.all(Object.keys(validatorList).map((v) => {
            const name = this.filter.execute('validator-name', v, [v, field]);
            const opts = validatorList[v];
            opts.message = this.filter.execute('validator-message', opts.message, [this.locale, field, name]);
            if (!this.validators[name] || opts.enabled === false) {
                this.emit('core.validator.validated', {
                    element: ele,
                    elements,
                    field,
                    result: this.normalizeResult(field, name, { valid: true }),
                    validator: name,
                });
                return Promise.resolve(Status$1.Valid);
            }
            const validator = this.validators[name];
            const value = this.getElementValue(field, ele, name);
            const willValidate = this.filter.execute('field-should-validate', true, [field, ele, value, v]);
            if (!willValidate) {
                this.emit('core.validator.notvalidated', {
                    element: ele,
                    elements,
                    field,
                    validator: v,
                });
                return Promise.reject(Status$1.NotValidated);
            }
            this.emit('core.validator.validating', {
                element: ele,
                elements,
                field,
                validator: v,
            });
            const result = validator().validate({
                element: ele,
                elements,
                field,
                l10n: this.localization,
                options: opts,
                value,
            });
            const isPromise = ('function' === typeof result['then']);
            if (isPromise) {
                return result.then((r) => {
                    const data = this.normalizeResult(field, v, r);
                    this.emit('core.validator.validated', {
                        element: ele,
                        elements,
                        field,
                        result: data,
                        validator: v,
                    });
                    return data.valid ? Status$1.Valid : Status$1.Invalid;
                });
            }
            else {
                const data = this.normalizeResult(field, v, result);
                this.emit('core.validator.validated', {
                    element: ele,
                    elements,
                    field,
                    result: data,
                    validator: v,
                });
                return Promise.resolve(data.valid ? Status$1.Valid : Status$1.Invalid);
            }
        })).then((results) => {
            const isValid = results.indexOf(Status$1.Invalid) === -1;
            this.emit('core.element.validated', {
                element: ele,
                elements,
                field,
                valid: isValid,
            });
            const type = ele.getAttribute('type');
            if ('radio' === type || 'checkbox' === type || elements.length === 1) {
                this.emit(isValid ? 'core.field.valid' : 'core.field.invalid', field);
            }
            return Promise.resolve(isValid ? Status$1.Valid : Status$1.Invalid);
        }).catch((reason) => {
            this.emit('core.element.notvalidated', {
                element: ele,
                elements,
                field,
            });
            return Promise.resolve(reason);
        });
    }
    getElementValue(field, ele, validator) {
        const defaultValue = getFieldValue(this.form, field, ele, this.elements[field]);
        return this.filter.execute('field-value', defaultValue, [defaultValue, field, ele, validator]);
    }
    getElements(field) { return this.elements[field]; }
    getFields() { return this.fields; }
    getFormElement() { return this.form; }
    getPlugin(name) {
        return this.plugins[name];
    }
    updateFieldStatus(field, status, validator) {
        const elements = this.elements[field];
        const type = elements[0].getAttribute('type');
        const list = ('radio' === type || 'checkbox' === type) ? [elements[0]] : elements;
        list.forEach((ele) => this.updateElementStatus(field, ele, status, validator));
        switch (status) {
            case Status$1.NotValidated:
                this.emit('core.field.notvalidated', field);
                this.results.delete(field);
                break;
            case Status$1.Validating:
                this.emit('core.field.validating', field);
                this.results.delete(field);
                break;
            case Status$1.Valid:
                this.emit('core.field.valid', field);
                this.results.set(field, Status$1.Valid);
                break;
            case Status$1.Invalid:
                this.emit('core.field.invalid', field);
                this.results.set(field, Status$1.Invalid);
                break;
        }
        return this;
    }
    updateElementStatus(field, ele, status, validator) {
        const elements = this.elements[field];
        const fieldValidators = this.fields[field].validators;
        const validatorArr = validator ? [validator] : Object.keys(fieldValidators);
        switch (status) {
            case Status$1.NotValidated:
                validatorArr.forEach((v) => this.emit('core.validator.notvalidated', {
                    element: ele,
                    elements,
                    field,
                    validator: v,
                }));
                this.emit('core.element.notvalidated', {
                    element: ele,
                    elements,
                    field,
                });
                break;
            case Status$1.Validating:
                validatorArr.forEach((v) => this.emit('core.validator.validating', {
                    element: ele,
                    elements,
                    field,
                    validator: v,
                }));
                this.emit('core.element.validating', {
                    element: ele,
                    elements,
                    field,
                });
                break;
            case Status$1.Valid:
                validatorArr.forEach((v) => this.emit('core.validator.validated', {
                    element: ele,
                    field,
                    result: {
                        message: fieldValidators[v].message,
                        valid: true,
                    },
                    validator: v,
                }));
                this.emit('core.element.validated', {
                    element: ele,
                    elements,
                    field,
                    valid: true,
                });
                break;
            case Status$1.Invalid:
                validatorArr.forEach((v) => this.emit('core.validator.validated', {
                    element: ele,
                    field,
                    result: {
                        message: fieldValidators[v].message,
                        valid: false,
                    },
                    validator: v,
                }));
                this.emit('core.element.validated', {
                    element: ele,
                    elements,
                    field,
                    valid: false,
                });
                break;
        }
        return this;
    }
    resetForm(reset) {
        Object.keys(this.fields).forEach((field) => this.resetField(field, reset));
        this.emit('core.form.reset', {
            reset,
        });
        return this;
    }
    resetField(field, reset) {
        if (reset) {
            const elements = this.elements[field];
            const type = elements[0].getAttribute('type');
            elements.forEach((ele) => {
                if ('radio' === type || 'checkbox' === type) {
                    ele.removeAttribute('selected');
                    ele.removeAttribute('checked');
                }
                else {
                    ele.setAttribute('value', '');
                }
            });
        }
        this.updateFieldStatus(field, Status$1.NotValidated);
        this.emit('core.field.reset', {
            field,
            reset,
        });
        return this;
    }
    revalidateField(field) {
        this.updateFieldStatus(field, Status$1.NotValidated);
        return this.validateField(field);
    }
    disableValidator(field, validator) {
        return this.toggleValidator(false, field, validator);
    }
    enableValidator(field, validator) {
        return this.toggleValidator(true, field, validator);
    }
    updateValidatorOption(field, validator, name, value) {
        if (this.fields[field] && this.fields[field].validators && this.fields[field].validators[validator]) {
            this.fields[field].validators[validator][name] = value;
        }
        return this;
    }
    destroy() {
        Object.keys(this.plugins).forEach((id) => this.plugins[id].uninstall());
        this.ee.clear();
        this.filter.clear();
        this.results.clear();
        this.plugins = {};
        return this;
    }
    setLocale(locale, localization) {
        this.locale = locale;
        this.localization = localization;
        return this;
    }
    queryElements(field) {
        const selector = (this.fields[field].selector)
            ? ('#' === this.fields[field].selector.charAt(0)
                ? `[id="${this.fields[field].selector.substring(1)}"]`
                : this.fields[field].selector)
            : `[name="${field}"]`;
        return [].slice.call(this.form.querySelectorAll(selector));
    }
    normalizeResult(field, validator, result) {
        const opts = this.fields[field].validators[validator];
        return Object.assign({}, result, {
            message: result.message
                || opts.message
                || (this.localization && this.localization[validator] && this.localization[validator].default
                    ? this.localization[validator].default : '')
                || `The field ${field} is not valid`,
        });
    }
    toggleValidator(enabled, field, validator) {
        const validatorArr = this.fields[field].validators;
        if (validator && validatorArr && validatorArr[validator]) {
            this.fields[field].validators[validator].enabled = enabled;
        }
        else if (!validator) {
            Object.keys(validatorArr).forEach((v) => this.fields[field].validators[v].enabled = enabled);
        }
        return this.updateFieldStatus(field, Status$1.NotValidated, validator);
    }
}
function formValidation$1(form, options) {
    const opts = Object.assign({}, {
        fields: {},
        locale: 'en_US',
        plugins: {},
    }, options);
    const core = new Core(form, opts.fields);
    core.setLocale(opts.locale, opts.localization);
    Object.keys(opts.plugins).forEach((name) => core.registerPlugin(name, opts.plugins[name]));
    Object.keys(validators).forEach((name) => core.registerValidator(name, validators[name]));
    Object.keys(opts.fields).forEach((field) => core.addField(field, opts.fields[field]));
    return core;
}

class Plugin {
    constructor(opts) {
        this.opts = opts;
    }
    setCore(core) {
        this.core = core;
        return this;
    }
    install() { }
    uninstall() { }
}

var index$1 = {
    getFieldValue,
};

class Alias extends Plugin {
    constructor(opts) {
        super(opts);
        this.opts = opts || {};
        this.validatorNameFilter = this.getValidatorName.bind(this);
    }
    install() {
        this.core.registerFilter('validator-name', this.validatorNameFilter);
    }
    uninstall() {
        this.core.deregisterFilter('validator-name', this.validatorNameFilter);
    }
    getValidatorName(alias, field) {
        return this.opts[alias] || alias;
    }
}

class Aria extends Plugin {
    constructor() {
        super({});
        this.elementValidatedHandler = this.onElementValidated.bind(this);
        this.fieldValidHandler = this.onFieldValid.bind(this);
        this.fieldInvalidHandler = this.onFieldInvalid.bind(this);
        this.messageDisplayedHandler = this.onMessageDisplayed.bind(this);
    }
    install() {
        this.core
            .on('core.field.valid', this.fieldValidHandler)
            .on('core.field.invalid', this.fieldInvalidHandler)
            .on('core.element.validated', this.elementValidatedHandler)
            .on('plugins.message.displayed', this.messageDisplayedHandler);
    }
    uninstall() {
        this.core
            .off('core.field.valid', this.fieldValidHandler)
            .off('core.field.invalid', this.fieldInvalidHandler)
            .off('core.element.validated', this.elementValidatedHandler)
            .off('plugins.message.displayed', this.messageDisplayedHandler);
    }
    onElementValidated(e) {
        if (e.valid) {
            e.element.setAttribute('aria-invalid', 'false');
            e.element.removeAttribute('aria-describedby');
        }
    }
    onFieldValid(field) {
        const elements = this.core.getElements(field);
        if (elements) {
            elements.forEach((ele) => {
                ele.setAttribute('aria-invalid', 'false');
                ele.removeAttribute('aria-describedby');
            });
        }
    }
    onFieldInvalid(field) {
        const elements = this.core.getElements(field);
        if (elements) {
            elements.forEach((ele) => ele.setAttribute('aria-invalid', 'true'));
        }
    }
    onMessageDisplayed(e) {
        e.messageElement.setAttribute('role', 'alert');
        e.messageElement.setAttribute('aria-hidden', 'false');
        const elements = this.core.getElements(e.field);
        const index = elements.indexOf(e.element);
        const id = `js-fv-${e.field}-${index}-${Date.now()}-message`;
        e.messageElement.setAttribute('id', id);
        e.element.setAttribute('aria-describedby', id);
        const type = e.element.getAttribute('type');
        if ('radio' === type || 'checkbox' === type) {
            elements.forEach((ele) => ele.setAttribute('aria-describedby', id));
        }
    }
}

class AutoFocus extends Plugin {
    constructor() {
        super({});
        this.invalidElements = [];
        this.invalidFormHandler = this.onFormInvalid.bind(this);
        this.elementValidatedHandler = this.onElementValidated.bind(this);
        this.elementNotValidatedHandler = this.onElementNotValidated.bind(this);
    }
    install() {
        this.core
            .on('core.form.invalid', this.invalidFormHandler)
            .on('core.element.validated', this.elementValidatedHandler)
            .on('core.element.notvalidated', this.elementNotValidatedHandler);
    }
    uninstall() {
        this.invalidElements = [];
        this.core
            .off('core.form.invalid', this.invalidFormHandler)
            .off('core.element.validated', this.elementValidatedHandler)
            .off('core.element.notvalidated', this.elementNotValidatedHandler);
    }
    onElementValidated(e) {
        const index = this.invalidElements.indexOf(e.element);
        if (e.valid && index >= 0) {
            this.invalidElements.splice(index, 1);
        }
        else if (!e.valid && index === -1) {
            this.invalidElements.push(e.element);
        }
    }
    onElementNotValidated(e) {
        this.invalidElements.splice(this.invalidElements.indexOf(e.element), 1);
    }
    onFormInvalid() {
        if (this.invalidElements.length) {
            this.invalidElements[0].focus();
        }
    }
}

class Declarative extends Plugin {
    constructor(opts) {
        super(opts);
        this.opts = Object.assign({}, {
            html5Input: false,
            prefix: 'data-fv-',
        }, opts);
    }
    install() {
        const opts = this.parseOptions();
        Object.keys(opts).forEach((field) => this.core.addField(field, opts[field]));
    }
    parseOptions() {
        const prefix = this.opts.prefix;
        const opts = {};
        const fields = this.core.getFields();
        const form = this.core.getFormElement();
        const elements = [].slice.call(form.querySelectorAll(`[name], [${prefix}field]`));
        elements.forEach((ele) => {
            const validators = this.parseElement(ele);
            if (!this.isEmptyOption(validators)) {
                const field = ele.getAttribute('name') || ele.getAttribute(`${prefix}field`);
                opts[field] = Object.assign({}, opts[field], validators);
            }
        });
        Object.keys(opts).forEach((field) => {
            Object.keys(opts[field].validators).forEach((v) => {
                opts[field].validators[v].enabled = opts[field].validators[v].enabled || false;
                if (fields[field] && fields[field].validators && fields[field].validators[v]) {
                    Object.assign(opts[field].validators[v], fields[field].validators[v]);
                }
            });
        });
        return Object.assign({}, fields, opts);
    }
    isEmptyOption(opts) {
        const validators = opts.validators;
        return Object.keys(validators).length === 0 && validators.constructor === Object;
    }
    parseElement(ele) {
        const reg = new RegExp(`^${this.opts.prefix}([a-z0-9\-]+)(___)*([a-z0-9\-]+)*$`);
        const numAttributes = ele.attributes.length;
        const opts = {};
        const type = ele.getAttribute('type');
        for (let i = 0; i < numAttributes; i++) {
            const name = ele.attributes[i].name;
            const value = ele.attributes[i].value;
            if (this.opts.html5Input) {
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
            }
            const items = reg.exec(name);
            if (items && items.length === 4) {
                const v = this.toCamelCase(items[1]);
                opts[v] = Object.assign({}, items[3]
                    ? { [this.toCamelCase(items[3])]: value }
                    : { enabled: ('' === value || 'true' === value) }, opts[v]);
            }
        }
        return { validators: opts };
    }
    toUpperCase(input) {
        return input.charAt(1).toUpperCase();
    }
    toCamelCase(input) {
        return input.replace(/-./g, this.toUpperCase);
    }
}

class DefaultSubmit extends Plugin {
    constructor() {
        super({});
        this.onValidHandler = this.onFormValid.bind(this);
    }
    install() {
        const form = this.core.getFormElement();
        if (form.querySelectorAll('[type="submit"][name="submit"]').length) {
            throw new Error('Do not use `submit` for the name attribute of submit button');
        }
        this.core.on('core.form.valid', this.onValidHandler);
    }
    uninstall() {
        this.core.off('core.form.valid', this.onValidHandler);
    }
    onFormValid() {
        const form = this.core.getFormElement();
        if (form instanceof HTMLFormElement) {
            form.submit();
        }
    }
}

class Dependency extends Plugin {
    constructor(opts) {
        super(opts);
        this.opts = opts || {};
        this.triggerExecutedHandler = this.onTriggerExecuted.bind(this);
    }
    install() {
        this.core.on('plugins.trigger.executed', this.triggerExecutedHandler);
    }
    uninstall() {
        this.core.off('plugins.trigger.executed', this.triggerExecutedHandler);
    }
    onTriggerExecuted(e) {
        if (this.opts[e.field]) {
            const dependencies = this.opts[e.field].split(' ');
            for (const d of dependencies) {
                const dependentField = d.trim();
                if (this.opts[dependentField]) {
                    this.core.revalidateField(dependentField);
                }
            }
        }
    }
}

function addClass(element, classes) {
    classes.split(' ').forEach((clazz) => {
        if (element.classList) {
            element.classList.add(clazz);
        }
        else if (` ${element.className} `.indexOf(` ${clazz} `)) {
            element.className += ` ${clazz}`;
        }
    });
}
function removeClass(element, classes) {
    classes.split(' ').forEach((clazz) => {
        element.classList
            ? element.classList.remove(clazz)
            : (element.className = element.className.replace(clazz, ''));
    });
}
function classSet(element, classes) {
    const adding = [];
    const removing = [];
    Object.keys(classes).forEach((clazz) => {
        if (clazz) {
            classes[clazz] ? adding.push(clazz) : removing.push(clazz);
        }
    });
    removing.forEach((clazz) => removeClass(element, clazz));
    adding.forEach((clazz) => addClass(element, clazz));
}

function matches(element, selector) {
    const nativeMatches = element.matches || element.webkitMatchesSelector
        || element['mozMatchesSelector'] || element['msMatchesSelector'];
    if (nativeMatches) {
        return nativeMatches.call(element, selector);
    }
    const nodes = [].slice.call(element.parentElement.querySelectorAll(selector));
    return nodes.indexOf(element) >= 0;
}
function closest(element, selector) {
    let ele = element;
    while (ele) {
        if (matches(ele, selector)) {
            break;
        }
        ele = ele.parentElement;
    }
    return ele;
}

class Message extends Plugin {
    constructor(opts) {
        super(opts);
        this.messages = new Map();
        this.defaultContainer = document.createElement('div');
        this.opts = Object.assign({}, {
            container: (field, element) => this.defaultContainer,
        }, opts);
        this.fieldAddedHandler = this.onFieldAdded.bind(this);
        this.fieldRemovedHandler = this.onFieldRemoved.bind(this);
        this.validatorValidatedHandler = this.onValidatorValidated.bind(this);
        this.validatorNotValidatedHandler = this.onValidatorNotValidated.bind(this);
    }
    static getClosestContainer(element, upper, pattern) {
        let ele = element;
        while (ele) {
            if (ele === upper) {
                break;
            }
            ele = ele.parentElement;
            if (pattern.test(ele.className)) {
                break;
            }
        }
        return ele;
    }
    install() {
        this.core.getFormElement().appendChild(this.defaultContainer);
        this.core
            .on('core.field.added', this.fieldAddedHandler)
            .on('core.field.removed', this.fieldRemovedHandler)
            .on('core.validator.validated', this.validatorValidatedHandler)
            .on('core.validator.notvalidated', this.validatorNotValidatedHandler);
    }
    uninstall() {
        this.core.getFormElement().removeChild(this.defaultContainer);
        this.messages.forEach((message) => message.parentNode.removeChild(message));
        this.messages.clear();
        this.core
            .off('core.field.added', this.fieldAddedHandler)
            .off('core.field.removed', this.fieldRemovedHandler)
            .off('core.validator.validated', this.validatorValidatedHandler)
            .off('core.validator.notvalidated', this.validatorNotValidatedHandler);
    }
    onFieldAdded(e) {
        const elements = e.elements;
        if (elements) {
            elements.forEach((ele) => {
                const msg = this.messages.get(ele);
                if (msg) {
                    msg.parentNode.removeChild(msg);
                    this.messages.delete(ele);
                }
            });
            this.prepareFieldContainer(e.field, elements);
        }
    }
    onFieldRemoved(e) {
        if (!e.elements.length || !e.field) {
            return;
        }
        const type = e.elements[0].getAttribute('type');
        const elements = ('radio' === type || 'checkbox' === type) ? [e.elements[0]] : e.elements;
        elements.forEach((ele) => {
            if (this.messages.has(ele)) {
                const container = this.messages.get(ele);
                container.parentNode.removeChild(container);
                this.messages.delete(ele);
            }
        });
    }
    prepareFieldContainer(field, elements) {
        if (elements.length) {
            const type = elements[0].getAttribute('type');
            if ('radio' === type || 'checkbox' === type) {
                this.prepareElementContainer(field, elements[0], elements);
            }
            else {
                elements.forEach((ele) => this.prepareElementContainer(field, ele, elements));
            }
        }
    }
    prepareElementContainer(field, element, elements) {
        let container;
        switch (true) {
            case ('string' === typeof this.opts.container):
                let selector = this.opts.container;
                selector = '#' === selector.charAt(0) ? `[id="${selector.substring(1)}"]` : selector;
                container = this.core.getFormElement().querySelector(selector);
                break;
            default:
                container = this.opts.container(field, element);
                break;
        }
        const message = document.createElement('div');
        container.appendChild(message);
        classSet(message, {
            'fv-plugins-message-container': true,
        });
        this.core.emit('plugins.message.placed', {
            element,
            field,
            elements,
            messageElement: message,
        });
        this.messages.set(element, message);
    }
    onValidatorValidated(e) {
        const elements = e.elements;
        const type = e.element.getAttribute('type');
        const element = ('radio' === type || 'checkbox' === type) ? elements[0] : e.element;
        if (this.messages.has(element)) {
            const container = this.messages.get(element);
            const messageEle = container.querySelector(`[data-field="${e.field}"][data-validator="${e.validator}"]`);
            if (!messageEle && !e.result.valid) {
                const ele = document.createElement('div');
                ele.innerHTML = e.result.message;
                ele.setAttribute('data-field', e.field);
                ele.setAttribute('data-validator', e.validator);
                if (this.opts.clazz) {
                    classSet(ele, {
                        [this.opts.clazz]: true,
                    });
                }
                container.appendChild(ele);
                this.core.emit('plugins.message.displayed', {
                    element: e.element,
                    field: e.field,
                    message: e.result.message,
                    messageElement: ele,
                    meta: e.result.meta,
                    validator: e.validator,
                });
            }
            else if (messageEle && !e.result.valid) {
                messageEle.innerHTML = e.result.message;
                this.core.emit('plugins.message.displayed', {
                    element: e.element,
                    field: e.field,
                    message: e.result.message,
                    messageElement: messageEle,
                    meta: e.result.meta,
                    validator: e.validator,
                });
            }
            else if (messageEle && e.result.valid) {
                container.removeChild(messageEle);
            }
        }
    }
    onValidatorNotValidated(e) {
        const elements = e.elements;
        const type = e.element.getAttribute('type');
        const element = ('radio' === type || 'checkbox' === type) ? elements[0] : e.element;
        if (this.messages.has(element)) {
            const container = this.messages.get(element);
            const messageEle = container.querySelector(`[data-field="${e.field}"][data-validator="${e.validator}"]`);
            if (messageEle) {
                container.removeChild(messageEle);
            }
        }
    }
}

class Framework extends Plugin {
    constructor(opts) {
        super(opts);
        this.results = new Map();
        this.containers = new Map();
        this.opts = Object.assign({}, {
            defaultMessageContainer: true,
            rowClasses: '',
            rowValidatingClass: '',
            eleValidClass: '',
            eleInvalidClass: '',
        }, opts);
        this.elementValidatingHandler = this.onElementValidating.bind(this);
        this.elementValidatedHandler = this.onElementValidated.bind(this);
        this.elementNotValidatedHandler = this.onElementNotValidated.bind(this);
        this.iconPlacedHandler = this.onIconPlaced.bind(this);
        this.fieldAddedHandler = this.onFieldAdded.bind(this);
        this.fieldRemovedHandler = this.onFieldRemoved.bind(this);
    }
    install() {
        classSet(this.core.getFormElement(), {
            [this.opts.formClass]: true,
        });
        this.core
            .on('core.element.validating', this.elementValidatingHandler)
            .on('core.element.validated', this.elementValidatedHandler)
            .on('core.element.notvalidated', this.elementNotValidatedHandler)
            .on('plugins.icon.placed', this.iconPlacedHandler)
            .on('core.field.added', this.fieldAddedHandler)
            .on('core.field.removed', this.fieldRemovedHandler);
        if (this.opts.defaultMessageContainer) {
            this.core.registerPlugin('___frameworkMessage', new Message({
                clazz: this.opts.messageClass,
                container: (field, element) => {
                    const selector = ('string' === typeof this.opts.rowSelector)
                        ? this.opts.rowSelector
                        : this.opts.rowSelector(field, element);
                    const groupEle = closest(element, selector);
                    return Message.getClosestContainer(element, groupEle, this.opts.rowPattern);
                },
            }));
        }
    }
    uninstall() {
        this.results.clear();
        this.containers.clear();
        classSet(this.core.getFormElement(), {
            [this.opts.formClass]: false,
        });
        this.core
            .off('core.element.validating', this.elementValidatingHandler)
            .off('core.element.validated', this.elementValidatedHandler)
            .off('core.element.notvalidated', this.elementNotValidatedHandler)
            .off('plugins.icon.placed', this.iconPlacedHandler)
            .off('core.field.added', this.fieldAddedHandler)
            .off('core.field.removed', this.fieldRemovedHandler);
    }
    onIconPlaced(e) { }
    onFieldAdded(e) {
        const elements = e.elements;
        if (elements) {
            elements.forEach((ele) => {
                const groupEle = this.containers.get(ele);
                if (groupEle) {
                    classSet(groupEle, {
                        [this.opts.rowInvalidClass]: false,
                        [this.opts.rowValidatingClass]: false,
                        [this.opts.rowValidClass]: false,
                        'fv-plugins-icon-container': false,
                    });
                    this.containers.delete(ele);
                }
            });
            this.prepareFieldContainer(e.field, elements);
        }
    }
    onFieldRemoved(e) {
        e.elements.forEach((ele) => {
            const groupEle = this.containers.get(ele);
            if (groupEle) {
                classSet(groupEle, {
                    [this.opts.rowInvalidClass]: false,
                    [this.opts.rowValidatingClass]: false,
                    [this.opts.rowValidClass]: false,
                });
            }
        });
    }
    prepareFieldContainer(field, elements) {
        if (elements.length) {
            const type = elements[0].getAttribute('type');
            if ('radio' === type || 'checkbox' === type) {
                this.prepareElementContainer(field, elements[0]);
            }
            else {
                elements.forEach((ele) => this.prepareElementContainer(field, ele));
            }
        }
    }
    prepareElementContainer(field, element) {
        const selector = ('string' === typeof this.opts.rowSelector)
            ? this.opts.rowSelector
            : this.opts.rowSelector(field, element);
        const groupEle = closest(element, selector);
        if (groupEle !== element) {
            classSet(groupEle, {
                [this.opts.rowClasses]: true,
                'fv-plugins-icon-container': true,
            });
            this.containers.set(element, groupEle);
        }
    }
    onElementValidating(e) {
        const elements = e.elements;
        const type = e.element.getAttribute('type');
        const element = ('radio' === type || 'checkbox' === type) ? elements[0] : e.element;
        const groupEle = this.containers.get(element);
        if (groupEle) {
            classSet(groupEle, {
                [this.opts.rowInvalidClass]: false,
                [this.opts.rowValidatingClass]: true,
                [this.opts.rowValidClass]: false,
            });
        }
    }
    onElementNotValidated(e) {
        const elements = e.elements;
        const type = e.element.getAttribute('type');
        const element = ('radio' === type || 'checkbox' === type) ? elements[0] : e.element;
        const groupEle = this.containers.get(element);
        if (groupEle) {
            classSet(groupEle, {
                [this.opts.rowInvalidClass]: false,
                [this.opts.rowValidatingClass]: false,
                [this.opts.rowValidClass]: false,
            });
        }
    }
    onElementValidated(e) {
        const elements = e.elements;
        const type = e.element.getAttribute('type');
        const element = ('radio' === type || 'checkbox' === type) ? elements[0] : e.element;
        classSet(element, {
            [this.opts.eleValidClass]: e.valid,
            [this.opts.eleInvalidClass]: !e.valid,
        });
        const groupEle = this.containers.get(element);
        if (groupEle) {
            if (!e.valid) {
                this.results.set(element, false);
                classSet(groupEle, {
                    [this.opts.rowInvalidClass]: true,
                    [this.opts.rowValidatingClass]: false,
                    [this.opts.rowValidClass]: false,
                });
            }
            else {
                this.results.delete(element);
                let isValid = true;
                this.containers.forEach((value, key) => {
                    if (value === groupEle && this.results.get(key) === false) {
                        isValid = false;
                    }
                });
                if (isValid) {
                    classSet(groupEle, {
                        [this.opts.rowInvalidClass]: false,
                        [this.opts.rowValidatingClass]: false,
                        [this.opts.rowValidClass]: true,
                    });
                }
            }
        }
    }
}

class Icon extends Plugin {
    constructor(opts) {
        super(opts);
        this.icons = new Map();
        this.opts = Object.assign({}, {
            invalid: 'fv-plugins-icon--invalid',
            valid: 'fv-plugins-icon--valid',
            validating: 'fv-plugins-icon--validating',
            onPlaced: () => { },
            onSet: () => { },
        }, opts);
        this.elementValidatingHandler = this.onElementValidating.bind(this);
        this.elementValidatedHandler = this.onElementValidated.bind(this);
        this.elementNotValidatedHandler = this.onElementNotValidated.bind(this);
        this.fieldAddedHandler = this.onFieldAdded.bind(this);
    }
    install() {
        this.core
            .on('core.element.validating', this.elementValidatingHandler)
            .on('core.element.validated', this.elementValidatedHandler)
            .on('core.element.notvalidated', this.elementNotValidatedHandler)
            .on('core.field.added', this.fieldAddedHandler);
    }
    uninstall() {
        this.icons.forEach((icon) => icon.parentNode.removeChild(icon));
        this.icons.clear();
        this.core
            .off('core.element.validating', this.elementValidatingHandler)
            .off('core.element.validated', this.elementValidatedHandler)
            .off('core.element.notvalidated', this.elementNotValidatedHandler)
            .off('core.field.added', this.fieldAddedHandler);
    }
    onFieldAdded(e) {
        const elements = e.elements;
        if (elements) {
            elements.forEach((ele) => {
                const icon = this.icons.get(ele);
                if (icon) {
                    icon.parentNode.removeChild(icon);
                    this.icons.delete(ele);
                }
            });
            this.prepareFieldIcon(e.field, elements);
        }
    }
    prepareFieldIcon(field, elements) {
        if (elements.length) {
            const type = elements[0].getAttribute('type');
            if ('radio' === type || 'checkbox' === type) {
                this.prepareElementIcon(field, elements[0]);
            }
            else {
                elements.forEach((ele) => this.prepareElementIcon(field, ele));
            }
        }
    }
    prepareElementIcon(field, ele) {
        const i = document.createElement('i');
        i.setAttribute('data-field', field);
        ele.parentNode.insertBefore(i, ele.nextSibling);
        classSet(i, {
            'fv-plugins-icon': true,
        });
        const e = {
            classes: {
                invalid: this.opts.invalid,
                valid: this.opts.valid,
                validating: this.opts.validating,
            },
            element: ele,
            field,
            iconElement: i,
        };
        this.core.emit('plugins.icon.placed', e);
        this.opts.onPlaced(e);
        this.icons.set(ele, i);
    }
    onElementValidating(e) {
        const icon = this.setClasses(e.field, e.element, e.elements, {
            [this.opts.invalid]: false,
            [this.opts.valid]: false,
            [this.opts.validating]: true,
        });
        const evt = {
            element: e.element,
            field: e.field,
            status: Status$1.Validating,
            iconElement: icon,
        };
        this.core.emit('plugins.icon.set', evt);
        this.opts.onSet(evt);
    }
    onElementValidated(e) {
        const icon = this.setClasses(e.field, e.element, e.elements, {
            [this.opts.invalid]: !e.valid,
            [this.opts.valid]: e.valid,
            [this.opts.validating]: false,
        });
        const evt = {
            element: e.element,
            field: e.field,
            status: e.valid ? Status$1.Valid : Status$1.Invalid,
            iconElement: icon,
        };
        this.core.emit('plugins.icon.set', evt);
        this.opts.onSet(evt);
    }
    onElementNotValidated(e) {
        const icon = this.setClasses(e.field, e.element, e.elements, {
            [this.opts.invalid]: false,
            [this.opts.valid]: false,
            [this.opts.validating]: false,
        });
        const evt = {
            element: e.element,
            field: e.field,
            status: Status$1.NotValidated,
            iconElement: icon,
        };
        this.core.emit('plugins.icon.set', evt);
        this.opts.onSet(evt);
    }
    setClasses(field, element, elements, classes) {
        const type = element.getAttribute('type');
        const ele = ('radio' === type || 'checkbox' === type) ? elements[0] : element;
        if (this.icons.has(ele)) {
            const icon = this.icons.get(ele);
            classSet(icon, classes);
            return icon;
        }
        else {
            return null;
        }
    }
}

class SubmitButton extends Plugin {
    constructor(opts) {
        super(opts);
        this.opts = Object.assign({}, {
            selector: '[type="submit"]:not([formnovalidate])',
        }, opts);
        this.submitHandler = this.submitHandle.bind(this);
    }
    install() {
        if (!(this.core.getFormElement() instanceof HTMLFormElement)) {
            return;
        }
        const form = this.core.getFormElement();
        form.setAttribute('novalidate', 'novalidate');
        form.addEventListener('submit', this.submitHandler);
        const hiddenButton = document.createElement('button');
        hiddenButton.setAttribute('type', 'submit');
        Object.assign(hiddenButton.style, {
            display: 'none',
            height: '0',
            width: '0',
        });
        form.appendChild(hiddenButton);
        const selectorButtons = [].slice.call(form.querySelectorAll(this.opts.selector));
        const submitButtons = [].slice.call(form.querySelectorAll('[type="submit"]'));
        submitButtons.forEach((button) => {
            button.addEventListener('click', (e) => {
                const target = e.currentTarget;
                if (!e.defaultPrevented && (target instanceof HTMLElement)
                    && (selectorButtons.indexOf(target) === -1)
                    && target !== hiddenButton) {
                    form.removeEventListener('submit', this.submitHandler);
                    form.submit();
                    return false;
                }
            });
        });
    }
    uninstall() {
        const form = this.core.getFormElement();
        if (form instanceof HTMLFormElement) {
            form.removeEventListener('submit', this.submitHandler);
        }
    }
    submitHandle(e) {
        e.preventDefault();
        this.core.validate();
    }
}

class Tooltip extends Plugin {
    constructor(opts) {
        super(opts);
        this.messages = new Map();
        this.opts = Object.assign({}, {
            placement: 'top',
            trigger: 'click',
        }, opts);
        this.iconPlacedHandler = this.onIconPlaced.bind(this);
        this.validatorValidatedHandler = this.onValidatorValidated.bind(this);
        this.elementValidatedHandler = this.onElementValidated.bind(this);
        this.documentClickHandler = this.onDocumentClicked.bind(this);
    }
    install() {
        this.tip = document.createElement('div');
        classSet(this.tip, {
            'fv-plugins-tooltip': true,
            [`fv-plugins-tooltip--${this.opts.placement}`]: true,
        });
        document.body.appendChild(this.tip);
        this.core
            .on('plugins.icon.placed', this.iconPlacedHandler)
            .on('core.validator.validated', this.validatorValidatedHandler)
            .on('core.element.validated', this.elementValidatedHandler);
        if ('click' === this.opts.trigger) {
            document.addEventListener('click', this.documentClickHandler);
        }
    }
    uninstall() {
        this.messages.clear();
        document.body.removeChild(this.tip);
        this.core
            .off('plugins.icon.placed', this.iconPlacedHandler)
            .off('core.validator.validated', this.validatorValidatedHandler)
            .off('core.element.validated', this.elementValidatedHandler);
        if ('click' === this.opts.trigger) {
            document.removeEventListener('click', this.documentClickHandler);
        }
    }
    onIconPlaced(e) {
        classSet(e.iconElement, {
            'fv-plugins-tooltip-icon': true,
        });
        switch (this.opts.trigger) {
            case 'hover':
                e.iconElement.addEventListener('mouseenter', (evt) => this.show(e.element, evt));
                e.iconElement.addEventListener('mouseleave', (evt) => this.hide());
                break;
            case 'click':
            default:
                e.iconElement.addEventListener('click', (evt) => this.show(e.element, evt));
                break;
        }
    }
    onValidatorValidated(e) {
        if (!e.result.valid) {
            const elements = e.elements;
            const type = e.element.getAttribute('type');
            const ele = ('radio' === type || 'checkbox' === type) ? elements[0] : e.element;
            this.messages.set(ele, e.result.message);
        }
    }
    onElementValidated(e) {
        if (e.valid) {
            const elements = e.elements;
            const type = e.element.getAttribute('type');
            const ele = ('radio' === type || 'checkbox' === type) ? elements[0] : e.element;
            this.messages.delete(ele);
        }
    }
    onDocumentClicked(e) {
        this.hide();
    }
    show(ele, e) {
        e.preventDefault();
        e.stopPropagation();
        if (!this.messages.has(ele)) {
            return;
        }
        classSet(this.tip, {
            'fv-plugins-tooltip--hide': false,
        });
        this.tip.innerHTML = `<span class="fv-plugins-tooltip__content">${this.messages.get(ele)}</span>`;
        const icon = e.target;
        const rect = icon.getBoundingClientRect();
        let top = 0;
        let left = 0;
        switch (this.opts.placement) {
            case 'top':
            default:
                top = rect.top - rect.height;
                left = rect.left + rect.width / 2 - this.tip.clientWidth / 2;
                break;
            case 'top-left':
                top = rect.top - rect.height;
                left = rect.left;
                break;
            case 'top-right':
                top = rect.top - rect.height;
                left = rect.left + rect.width - this.tip.clientWidth;
                break;
            case 'bottom':
                top = rect.top + rect.height;
                left = rect.left + rect.width / 2 - this.tip.clientWidth / 2;
                break;
            case 'bottom-left':
                top = rect.top + rect.height;
                left = rect.left;
                break;
            case 'bottom-right':
                top = rect.top + rect.height;
                left = rect.left + rect.width - this.tip.clientWidth;
                break;
            case 'left':
                top = rect.top + rect.height / 2 - this.tip.clientHeight / 2;
                left = rect.left - this.tip.clientWidth;
                break;
            case 'right':
                top = rect.top + rect.height / 2 - this.tip.clientHeight / 2;
                left = rect.left + rect.width;
                break;
        }
        top = top + document.body.scrollTop;
        left = left + document.body.scrollLeft;
        this.tip.setAttribute('style', `top: ${top}px; left: ${left}px`);
    }
    hide() {
        classSet(this.tip, {
            'fv-plugins-tooltip--hide': true,
        });
    }
}

class Trigger extends Plugin {
    constructor(opts) {
        super(opts);
        this.handlers = [];
        this.ieVersion = (() => {
            let v = 3;
            let div = document.createElement('div');
            let a = div['all'] || [];
            while (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><br><![endif]-->', a[0]) { }
            return v > 4 ? v : document['documentMode'];
        })();
        const ele = document.createElement('div');
        this.defaultEvent = (this.ieVersion === 9 || !('oninput' in ele)) ? 'keyup' : 'input';
        this.opts = Object.assign({}, {
            event: this.defaultEvent,
            threshold: 0,
        }, opts);
        this.fieldAddedHandler = this.onFieldAdded.bind(this);
        this.fieldRemovedHandler = this.onFieldRemoved.bind(this);
    }
    install() {
        this.core
            .on('core.field.added', this.fieldAddedHandler)
            .on('core.field.removed', this.fieldRemovedHandler);
    }
    uninstall() {
        this.handlers.forEach((item) => item.element.removeEventListener(item.event, item.handler));
        this.handlers = [];
        this.core
            .off('core.field.added', this.fieldAddedHandler)
            .off('core.field.removed', this.fieldRemovedHandler);
    }
    prepareHandler(field, elements) {
        elements.forEach((ele) => {
            let events = [];
            switch (true) {
                case (!!this.opts.event && this.opts.event[field] === false):
                    events = [];
                    break;
                case (!!this.opts.event && !!this.opts.event[field]):
                    events = this.opts.event[field].split(' ');
                    break;
                case ('string' === typeof this.opts.event && this.opts.event !== this.defaultEvent):
                    events = this.opts.event.split(' ');
                    break;
                default:
                    const type = ele.getAttribute('type');
                    const tagName = ele.tagName.toLowerCase();
                    const event = ('radio' === type || 'checkbox' === type || 'file' === type || 'select' === tagName)
                        ? 'change'
                        : ((this.ieVersion >= 10 && ele.getAttribute('placeholder') ? 'keyup' : this.defaultEvent));
                    events = [event];
                    break;
            }
            events.forEach((evt) => {
                const evtHandler = (e) => this.handleEvent(e, field, ele);
                this.handlers.push({
                    element: ele,
                    event: evt,
                    field,
                    handler: evtHandler,
                });
                ele.addEventListener(evt, evtHandler);
            });
        });
    }
    handleEvent(e, field, ele) {
        if (this.exceedThreshold(field, ele)) {
            this.core.validateElement(field, ele).then((resolve) => {
                this.core.emit('plugins.trigger.executed', {
                    element: ele,
                    event: e,
                    field,
                });
            });
        }
    }
    onFieldAdded(e) {
        this.handlers
            .filter((item) => item.field === e.field)
            .forEach((item) => item.element.removeEventListener(item.event, item.handler));
        this.prepareHandler(e.field, e.elements);
    }
    onFieldRemoved(e) {
        this.handlers
            .filter((item) => item.field === e.field && e.elements.indexOf(item.element) >= 0)
            .forEach((item) => item.element.removeEventListener(item.event, item.handler));
    }
    exceedThreshold(field, element) {
        const threshold = (this.opts.threshold[field] === 0 || this.opts.threshold === 0) ? false : (this.opts.threshold[field] || this.opts.threshold);
        if (!threshold) {
            return true;
        }
        const type = element.getAttribute('type');
        if (['button', 'checkbox', 'file', 'hidden', 'image', 'radio', 'reset', 'submit'].indexOf(type) !== -1) {
            return true;
        }
        const value = this.core.getElementValue(field, element);
        return value.length >= threshold;
    }
}

var index$2 = {
    Alias,
    Aria,
    AutoFocus,
    Declarative,
    DefaultSubmit,
    Dependency,
    Framework,
    Icon,
    Message,
    SubmitButton,
    Tooltip,
    Trigger,
};

function hasClass(element, clazz) {
    return element.classList
        ? element.classList.contains(clazz)
        : new RegExp(`(^| )${clazz}( |$)`, 'gi').test(element.className);
}

var index$3 = {
    call,
    classSet,
    closest,
    fetch,
    format,
    hasClass,
    isValidDate,
};

const locales = {};

exports.algorithms = index;
exports.formValidation = formValidation$1;
exports.filters = index$1;
exports.locales = locales;
exports.plugins = index$2;
exports.utils = index$3;
exports.validators = validators;
exports.Plugin = Plugin;
exports.Status = Status$1;

Object.defineProperty(exports, '__esModule', { value: true });

})));
