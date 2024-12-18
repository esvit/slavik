export default
['$sce',
function ($sce) {
    return function (input) {
        return $sce.trustAsHtml(input || '');
    };
}];
