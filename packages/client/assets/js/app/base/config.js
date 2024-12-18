export default
['$httpProvider', '$compileProvider', '$sceProvider', '$locationProvider',
function configState($httpProvider, $compileProvider, $sceProvider, $locationProvider) {

  $httpProvider.defaults.withCredentials = true;
  $httpProvider.defaults.useXDomain = true;

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false,
    rewriteLinks: false
  });

  $sceProvider.enabled(false);

  // Optimize load start with remove binding information inside the DOM element
  $compileProvider.debugInfoEnabled(false);

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
}];
