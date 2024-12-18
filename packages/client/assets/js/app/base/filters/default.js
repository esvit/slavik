export default function () {
    return function (input, defaultString) {
        let str = $.trim(input || '');
        if (str == '') {
            return defaultString;
        }
        return input;
    };
}
