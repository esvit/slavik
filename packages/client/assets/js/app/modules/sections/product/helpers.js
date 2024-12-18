var FILTER_PREFIX = 'f';

/**
 * Conver string, array or object to object { min: ?, max: ? }
 *
 * @param range
 * @returns {*}
 */
var toRange = (range) => {
    var res = {};
    if (!range) {
        return null;
    }
    if (angular.isString(range)) {
        range = range.split('-');
    } else if (!angular.isArray(range)) {
        range = [range.min, range.max];
    }
    if (range[0]) { res.min = parseInt(range[0]); }
    if (range[1]) { res.max = parseInt(range[1]); }

    return res;
};

/**
 * Convert $location.search() to filter object
 *
 * @param values
 * @param attributes
 * @param defaults
 * @returns {{}}
 */
var qsToFilter = (values, attributes, defaults, withoutDefaults) => {
    var filter = {};
    values = angular.copy(values);
    $.each(attributes || [], (n, attribute) => {
        if (attribute.hidden) {
            return;
        }
        var value = values[FILTER_PREFIX + attribute.name];
        delete values[FILTER_PREFIX + attribute.name];
        if (value === null || angular.isUndefined(value)) {
            value = defaults[attribute.name];
        }
        switch (attribute.type) {
            case 'number':
            case 'number-slider':
                var range = withoutDefaults ? {} : toRange(attribute.range || {});
                value = toRange(value || {});
                value = [
                    value.min || range.min || 0,
                    value.max || range.max || 1
                ];
                if (withoutDefaults && value[0] == 0 && value[1] == 1) {
                  value = null;
                }
                break;
          case 'number-input':
                const range = toRange(value || {});
                value = [range.min || null, range.max || null];
                break;
            case 'boolean':
                break;
            default:
        }
        if (value !== null && angular.isDefined(value)) {
            filter[attribute.name] = value;
        }
    });
    $.each(values, (key, value) => {
        if (key.substring(0, FILTER_PREFIX.length) != FILTER_PREFIX) {
            return;
        }
        filter[key.substring(FILTER_PREFIX.length)] = value;
    });
    return filter;
};

/**
 * Convert filter to $location.search()
 *
 * @param values
 * @param attributes
 * @param defaults
 * @returns {string}
 */
var filterToParams = (values, attributes, defaults, withDefault) => {
    var params = {};
    values = angular.copy(values);
    $.each(attributes || [], (n, attribute) => {
        if (attribute.hidden) {
            return;
        }
        var value = values[attribute.name],
            defaultValue = defaults[attribute.name];

        delete values[attribute.name];
        if (value === null || angular.isUndefined(value)) {
            return;
        }
        switch (attribute.type) {
            case 'number':
            case 'number-slider':
                value = toRange(value);
                //defaultValue = toRange(defaultValue) || {};
                var attrRange = toRange(attribute.range);
                if (!defaultValue) {
                    return;
                }
                value.min = value.min || attrRange.min;
                value.max = value.max || attrRange.max;
                value = (value.min || '') + '-' + (value.max || '');
                break;
            case 'number-input':
                value = toRange(value);
                value = (value.min || '') + '-' + (value.max || '');
                break;
            case 'boolean':
                break;
            default:
                if (value == defaultValue && !withDefault) {
                    return;
                }
        }

        params[FILTER_PREFIX + attribute.name] = value;
    });

    $.each(values, (key, value) => {
        params[FILTER_PREFIX + key] = value;
    });
    return params;
};

var filterToQs = (values, attributes, defaults) => {
    var qs = [],
        params = filterToParams(values, attributes, defaults);

    $.each(params, (name, value) => {
        qs.push(
            encodeURIComponent(name) + '=' + encodeURIComponent(value)
        );
    });
    return qs.join('&');
};


// tests
/*
 console.assert(angular.equals(toRange([1,2]), { min: 1, max: 2 }), 'Invalid toRange1 result');
 console.assert(angular.equals(toRange([1]), { min: 1 }), 'Invalid toRange2 result');
 console.assert(angular.equals(toRange([,2]), { max: 2 }), 'Invalid toRange3 result');
 console.assert(angular.equals(toRange({ min: 1, max: 2 }), { min: 1, max: 2 }), 'Invalid toRange4 result');
 console.assert(angular.equals(toRange({ min: 1 }), { min: 1 }), 'Invalid toRange5 result');
 console.assert(angular.equals(toRange({ max: 2 }), { max: 2 }), 'Invalid toRange6 result');
 console.assert(angular.equals(toRange('1-2'), { min: 1, max: 2 }), 'Invalid toRange7 result');
 console.assert(angular.equals(toRange('1-'), { min: 1 }), 'Invalid toRange8 result');
 console.assert(angular.equals(toRange('-2'), { max: 2 }), 'Invalid toRange9 result');

var result = qsToFilter({
    ftestNumber1: '1-',
    ftestNumber2: '-2',
    ftestNumber3: '3-4',
    ftestNumber4: '1-',
    ftestNumber5: '-2',
    ftestNumber6: '3-4',
    ftestNumber7: '1-',
    ftestNumber8: '-2',
    ftestNumber9: '3-4',
    ftestNumber10: '1-',
    ftestNumber11: '-2',
    ftestNumber12: '3-4',
    ftestNumber13: '1-',
    ftestNumber14: '-2',
    ftestNumber15: '3-4',
    ftestNumber16: '1-',
    ftestNumber17: '-2',
    ftestNumber18: '3-4',
    ftestString1: 'test',
    ftestString2: ''
}, [
    { name: 'testNumber1', type: 'number', range: { min: 0, max: 5 } },
    { name: 'testNumber2', type: 'number', range: { min: 0, max: 5 } },
    { name: 'testNumber3', type: 'number', range: { min: 0, max: 5 } },
    { name: 'testNumber4', type: 'number', range: '0-5' },
    { name: 'testNumber5', type: 'number', range: '0-5' },
    { name: 'testNumber6', type: 'number', range: '0-5' },
    { name: 'testNumber7', type: 'number', range: { min: 0 } },
    { name: 'testNumber8', type: 'number', range: { min: 0 } },
    { name: 'testNumber9', type: 'number', range: { min: 0 } },
    { name: 'testNumber10', type: 'number', range: '0-' },
    { name: 'testNumber11', type: 'number', range: '0-' },
    { name: 'testNumber12', type: 'number', range: '0-' },
    { name: 'testNumber13', type: 'number', range: { max: 5 } },
    { name: 'testNumber14', type: 'number', range: { max: 5 } },
    { name: 'testNumber15', type: 'number', range: { max: 5 } },
    { name: 'testNumber16', type: 'number', range: '-5' },
    { name: 'testNumber17', type: 'number', range: '-5' },
    { name: 'testNumber18', type: 'number', range: '-5' },
    { name: 'testNumber19', type: 'number', range: { min: 4, max: 5 } },
    { name: 'testNumber20', type: 'number', range: { min: 4, max: 5 } },
    { name: 'testNumber21', type: 'number', range: { min: 4, max: 5 } },
    { name: 'testNumber22', type: 'number', range: { min: 4, max: 5 } },
    { name: 'testNumber23', type: 'number', range: { min: 4, max: 5 } },
    { name: 'testNumber24', type: 'number', range: { min: 4, max: 5 } },
    { name: 'testNumber25', type: 'number', range: { min: 4, max: 5 } },
    { name: 'testString1', type: 'char' },
    { name: 'testString2', type: 'char' },
    { name: 'testString3', type: 'char' }
], {
    testNumber20: { min: 10, max: 20 },
    testNumber21: { min: 10 },
    testNumber22: { max: 20 },
    testNumber23: '10-20',
    testNumber24: '10-',
    testNumber25: '-20'
});

console.info(result);
console.assert(angular.equals(result,
    // expected result
    {
        testNumber1: [1,5],
        testNumber2: [0,2],
        testNumber3: [3,4],
        testNumber4: [1,5],
        testNumber5: [0,2],
        testNumber6: [3,4],
        testNumber7: [1,1],
        testNumber8: [0,2],
        testNumber9: [3,4],
        testNumber10: [1,1],
        testNumber11: [0,2],
        testNumber12: [3,4],
        testNumber13: [1,5],
        testNumber14: [0,2],
        testNumber15: [3,4],
        testNumber16: [1,5],
        testNumber17: [0,2],
        testNumber18: [3,4],
        testNumber19: [4,5],
        testNumber20: [10,20],
        testNumber21: [10,5],
        testNumber22: [4,20],
        testNumber23: [10,20],
        testNumber24: [10,5],
        testNumber25: [4,20],
        testString1: 'test',
        testString2: ''
    }
), 'Invalid qsToFilter result');

var result = filterToQs({
    testNumber1: [1,2],
    testNumber2: [1],
    testNumber3: [,2],
    testNumber4: [1,2],
    testNumber5: [1,3],
    testString1: 'test',
    testString2: '',
    testString3: 'test',
    testString4: 'test'
}, [
    { name: 'testNumber1', type: 'number', range: { min: 0, max: 5 } },
    { name: 'testNumber2', type: 'number', range: { min: 0, max: 5 } },
    { name: 'testNumber3', type: 'number', range: { min: 0, max: 5 } },
    { name: 'testNumber4', type: 'number', range: { min: 0, max: 5 } },
    { name: 'testNumber5', type: 'number', range: { min: 0, max: 5 } },
    { name: 'testString1', type: 'char' },
    { name: 'testString2', type: 'char' },
    { name: 'testString3', type: 'char' },
    { name: 'testString4', type: 'char' }
], {
    testNumber4: [1,2],
    testNumber5: [1,2],
    testString3: 'test',
    testString4: 'notDefault'
});

console.info(result);
console.assert(angular.equals(result,
    // expected result
    [
        'ftestNumber1=1-2',
        'ftestNumber2=1-',
        'ftestNumber3=-2',
        'ftestNumber5=1-3',
        'ftestString1=test',
        'ftestString2=',
        'ftestString4=test'
    ].join('&')
), 'Invalid filterToQs result');
*/

export {toRange, qsToFilter, filterToQs, filterToParams};
