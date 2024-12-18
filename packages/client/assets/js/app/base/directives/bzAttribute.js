var stripHtml = (function () {
    var tmpEl = document.createElement("DIV");

    function strip(html) {
        if (!html) {
            return "";
        }
        tmpEl.innerHTML = html;
        return tmpEl.textContent || tmpEl.innerText || "";
    }

    return strip;
}());

export default
['$sce',
function ($sce) {
    return {
        scope: {
            'attribute': '=bzAttribute',
            'inList': '@',
            'iconUrl': '@'
        },
        replace: true,
        template: '<dl class="attribute ng-hide has-value"></dl>',
        link: ($scope, elem, attrs) => {
            $scope.showTitle = attrs.showTitle ? attrs.showTitle != 'false' : true;

            $scope.$watch('attribute', (attr) => {
                if (angular.isUndefined(attr)) {
                    return;
                }

                if (attr.value === null) {
                    return;
                }
                elem.removeClass('ng-hide');

                var titleHtml = '';
                var icon = '';

                if ($scope.showTitle && attr.title) {
                    if (attr.icon && attr.icon.length) {
                        icon = '<img src="' + $scope.iconUrl + '" class="attribute-icon" />';
                    }

                    titleHtml += '<dt class="text-ellipsis" class="type-' + attr.type + '">' + icon + attr.title + '</dt>';
                }

                var valueHtml = '<dd class="type-' + attr.type + (attr.format == 'rich text' ? ' rich-html' : '') + '">';
                attrType:
                    switch (attr.type) {
                        case 'boolean':
                            valueHtml += attr.value ? '&#10003;' : '&ndash;';
                            break;
                        case 'list':
                            var items = (attr.value || '').split('|');
                            valueHtml += '<ul>';
                            $.each(items, (n, item) => valueHtml += '<li>' + item + '</li>');
                            valueHtml += '</ul>';
                            break;
                        default:
                            var value = attr.value,
                                link = attr.link,
                                target = '';
                            switch (attr.format) {
                                case 'rich text':
                                    valueHtml += '<span class="attribute-rich-text">';
                                    valueHtml += attr.value;

                                    if (attr.suffix) {
                                        valueHtml += '&nbsp;' + attr.suffix;
                                    }
                                    valueHtml += '</span>';
                                    break attrType;
                                case 'youtube':
                                    valueHtml = '<dd class="type-video">';
                                    valueHtml += '<div class="embed-responsive embed-responsive-16by9">';
                                    valueHtml += '<iframe class="youtube" class="embed-responsive-item" src="//www.youtube.com/embed/' + attr.value + '?rel=0" frameborder="0" allowfullscreen></iframe>';
                                    valueHtml += '</div>';
                                    valueHtml += '</dd>';
                                    elem.html(valueHtml);
                                    return;
                                case 'link':
                                    target = '_blank';
                                    link = attr.value;
                                    titleHtml = '';
                                    break;
                                default:
                                    break;
                            }
                            if (link) {
                                valueHtml += '<a href="' + link + '" target="' + target + '">';
                                valueHtml += (attr.format != '') ? (attr.title) : (attr.value);

                                if (attr.format == '' && attr.suffix) {
                                    valueHtml += '&nbsp;' + attr.suffix;
                                }
                                valueHtml += '</a>';
                            } else {
                                valueHtml += '<span class="tooltipped tooltipped-n" aria-label="' + stripHtml(attr.value) + '">';
                                valueHtml += '<span class="text-ellipsis">';
                                valueHtml += ('' + (attr.value || '')).replace(/\n/g,'<br>');

                                if (attr.suffix) {
                                    valueHtml += '&nbsp;' + attr.suffix;
                                }
                                valueHtml += '</span>';
                                valueHtml += '</span>';
                            }
                    }

                valueHtml += '</dd>';
                elem.html(titleHtml + valueHtml);
            });
        }
    };
}];
