let appName = 'module.sections.product';

let module = angular.module(appName, [
  'ngResource',
  'ui.bootstrap-slider',
  'infinite-scroll',
  'ap.fotorama',
  'rzSlider'
]);

// directives
import sectionProduct from './directives/sectionProduct.js';
import productRelatedProducts from './directives/productRelatedProducts.js';

module
  .directive('sectionProduct', sectionProduct)
  .directive('productRelatedProducts', productRelatedProducts)
;

export default appName;
