let appName = 'module.pages.form';

let module = angular.module(appName, [
    'ui.router',
    'ngResource'
]);

// directives
import pageForm from './directives/pageForm.js';

module
    .directive('pageForm', pageForm)
;

export default appName;