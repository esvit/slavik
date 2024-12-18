export default
['$scope', '$window',
function ($scope, $window) {
    $scope.menus = {};
    $scope.toggleMenu = (id) => {
        $scope.menus[id] = !$scope.menus[id];
    };

    $scope.newGallery = () => {
        $scope.sliderOptions = {
            startEvent: "GALLERY",
            slides: [],
            opts: {
                open: false,
                index: 0,
                history: false
            },
            onClose: function () {
                $scope.sliderOptions.open = false;
            },
            showGallery: function (event, i) {
                event.preventDefault();
                event.stopImmediatePropagation();
                $scope.sliderOptions.opts.index = i || $scope.sliderOptions.opts.index;
                $scope.$broadcast($scope.sliderOptions.startEvent);
                $scope.sliderOptions.open = true;

                console.log('==== $scope.sliderOptions.startEvent ====');
                console.log($scope.sliderOptions.startEvent);
                console.log($scope);
            }
        };
        return $scope.sliderOptions;
    };


    $scope.enableSticky = false;

    var scrollbarElement = angular.element($window),
        onScrollEvent;


    function scrollbarYPos() {
        var position;
        if (typeof $window.scrollTop !== 'undefined') {
            position = $window.scrollTop;
        } else if (typeof $window.pageYOffset !== 'undefined') {
            position = $window.pageYOffset;
        } else {
            position = document.documentElement.scrollTop;
        }
        return position;
    }

    var onScroll = () => {
        //$scope.enableSticky = scrollbarYPos() >= 50;
        if ((scrollbarYPos() >= 50) && ($scope.enableSticky === false)) {
            $scope.enableSticky = true;
        }
        if ((scrollbarYPos() < 50) && ($scope.enableSticky === true)) {
            $scope.enableSticky = false;
        }
    };

    onScrollEvent = $scope.$apply.bind($scope, onScroll);
    scrollbarElement.on('scroll', onScrollEvent); // робить баг, що сторінка вічно сповзає
    scrollbarElement.on('resize', onScrollEvent);

    $scope.$on('destroy', () => {
        scrollbarElement.off('scroll', onScrollEvent);
        scrollbarElement.off('resize', onScrollEvent);
    });
}];
