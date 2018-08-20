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
