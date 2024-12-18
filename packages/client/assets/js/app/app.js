import base from './base/base.js';
import modules from './modules/modules.config';
import './ie.polyfill.js';

let appName = 'app';

angular.module(appName, ['views', base].concat(modules));

export default appName;
