export default
function () {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attrs) {
            var links = element.find('a'),
                slides = [],
                options = {

                };

            links.each(function(index) {
                var el = $(this),
                    size = el.data('size'),
                    item = {
                        src: el.attr('href'),
                        w: 100,
                        h: 100
                    };
                if (el.find('img').size() == 0) {
                    return;
                }

                el.data('index', index);
                if (size) {
                    size = size.split('x');
                    item.w = parseInt(size[0], 10);
                    item.h = parseInt(size[1], 10);
                }
                slides.push(item);
            }).bind('click', function(e) {
                var el = $(this);

                e = e || window.event;
                e.preventDefault ? e.preventDefault() : e.returnValue = false;

                options.index = parseInt(el.data('index'), 10);
                var pswpElement = document.querySelectorAll('.pswp')[0],
                    gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default || false, slides, options);

                gallery.init();
            });

        }
    };
}
