export default
['$window',
function ($window) {
  return {
    restrict: 'C',
    link: function(scope, element, attributes) {

      angular.element(document).on('scroll', () => {
        element.toggleClass('show', $window.scrollY > 100);
      });
      element.on('click', () => {
        let verticalOffset = typeof(verticalOffset) != 'undefined' ? verticalOffset : 0,
          body = $('body'),
          offset = body.offset();

        $('html, body').animate({scrollTop: offset.top}, 500, 'linear');
      });
    }
  };
}];
