export default
['$sce',
function ($sce) {
    return {
      restrict: 'A',
      link: function(scope, element, attributes) {
        scope.$watch(attributes.ngBindHtml, () => {
          element.dotdotdot({watch: true});
        });
      }
    };
}];
