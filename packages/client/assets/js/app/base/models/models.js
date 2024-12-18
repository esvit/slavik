var appName = 'base.models';

var module = angular.module(appName, [
    'ngResource'
]);

// models
import ProductModel from './ProductModel.js';

module
    .factory('ProductModel', ProductModel)
;

export default appName;