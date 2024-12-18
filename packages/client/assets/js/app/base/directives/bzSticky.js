export default
['$window',
function ($window) {
  return {
    restrict: 'A', // this directive can only be used as an attribute.
    scope: false,
    link: function linkFn($scope, $elem, $attrs) {
      var el = $elem.parent();
      el
        .stick_in_parent()
        .css({
          'z-index': 10
        })
        .on("sticky_kit:stick", function (e) {
          var height = $('.navbar-fixed-top').outerHeight();
          el.css({marginTop: height});
        })
        .on("sticky_kit:unstick", function (e) {
          el.css({marginTop: '0px'});
        })
      ;
    }
  };
}];
