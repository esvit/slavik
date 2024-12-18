'use strict';

var appName = 'base';

import models from './models/models.js';

var module = angular.module(appName, [
    'ui.bootstrap',
    'ngTouch',
    'ngSanitize',
    'slick',
    'sun.scrollable',
    'ap.fotorama',
    models
]);

module
    .constant('API_URL', '/api')
    .factory('$exceptionHandler', ['$log', function ($log) {
        return function myExceptionHandler(exception, cause) {
            $log.error(exception, cause);
        };
    }])
;

// directives
import bzGallery from './directives/bzGallery.js';
import bzLoadingContainer from './directives/bzLoadingContainer.js';
import bzAttribute from './directives/bzAttribute.js';
import bzDot from './directives/bzDot.js';
import toTop from './directives/toTop.js';
import bzSticky from './directives/bzSticky.js';

module
    .directive('bzGallery', bzGallery)
    .directive('bzLoadingContainer', bzLoadingContainer)
    .directive('bzAttribute', bzAttribute)
    .directive('bzDot', bzDot)
    .directive('toTop', toTop)
    .directive('bzSticky', bzSticky)
;

// filters
import defaultFilter from './filters/default.js';
import trustFilter from './filters/trust.js';
import trustUrlFilter from './filters/trustUrl.js';
import plainFilter from './filters/plain.js';

module
    .filter('default', defaultFilter)
    .filter('trust', trustFilter)
    .filter('trustUrl', trustUrlFilter)
    .filter('plain', plainFilter)
;

// controllers
import BaseGlobalCtrl from './controllers/BaseGlobalCtrl.js';

module
    .controller('BaseGlobalCtrl', BaseGlobalCtrl)
;

// config
import config from './config.js';

module
    .config(config)
    .constant('API', '/api/rest.php')
    .run(['$rootScope', function ($rootScope) {
        $('.splash').css('display', 'none');

        $rootScope.imageUrl = (image, queryString) => {
            if (!angular.isObject(image)) return;

            if (angular.isObject(queryString)) {
                var qs = '';
                if (queryString.width) {
                    qs += 'w=' + queryString.width + '&';
                }
                if (queryString.height) {
                    qs += 'h=' + queryString.height + '&';
                }
                if (queryString.autocrop) {
                    qs += 'zs=1';
                }
                queryString = qs;
            }

            return '/image/' + encodeURIComponent(image.id) + '/' + encodeURIComponent(image.name) + (queryString ? '?' + queryString : '');
        };
    }])
;

export default appName;
