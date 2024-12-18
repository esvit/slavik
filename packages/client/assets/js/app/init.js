import appName from './app';

try {
  angular.module('views');
} catch (e) {
  angular.module('views', []);
}
angular.element(document).ready(function () {
  try {
    angular.bootstrap(document, [appName]);
  } catch (err) {
    console.info(err);
  }

  // side widget
  var slideout = $('#slideout');
  var slideoutInner = $('#slideout_inner');
  var scrollZone = slideout.find('.nano');

  var toggle = function () {
    slideout.toggleClass('active-out');
    slideoutInner.toggleClass('active-inner');

    scrollZone.nanoScroller({ destroy: true });
    scrollZone.nanoScroller({
      nanoClass: 'nano',
      contentClass: 'nano-content'
    });
  };
  slideout.find('.toggler').click(toggle);
});
