export default
['ProductModel',
function (ProductModel) {
  return {
    restrict: 'A',
    scope: {
      'config': '=productRelatedProducts',
      'product': '='
    },
    templateUrl: 'views/layout/block-related-products.html',
    replace: true,
    link: function (scope, element, attrs) {

      var loadProducts = () => {
        var section = scope.$parent.section;
        scope.section = section;
        scope.imageUrl = scope.$parent.imageUrl;

        var args = {};

        args.related_fields = $.map(scope.config.attributes, item => item.name).join(',');

        args.id = scope.product.id;
        args.count = scope.config.count;
        args.section_id = section.id;
        args.configuration_id = section.parameters.configuration.value;
        ProductModel.getRelated(args, (res, headers) => {
          scope.products = res;
          scope.loading = false;

          scope.title = headers()['x-section-title'];
        });
      };

      scope.$watch('config', config => {
        loadProducts();
      });
    }
  };
}];
