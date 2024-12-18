export default
['$location', '$compile',
function ($location, $compile) {

  return {
    restrict: 'A',
    replace: true,
    scope: {
      url: "=pageForm"
    },
    link: function (scope, element, attr) {
      scope.$watch('url', url => {
        if (!url) {
          return;
        }
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.charset = 'utf-8';

        element.addClass('page-form').html('').append(script);
      });
    }
  };
}];
