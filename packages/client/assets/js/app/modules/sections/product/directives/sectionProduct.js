import {qsToFilter, filterToQs, filterToParams} from '../helpers';

export default
['ProductModel', '$location', '$rootScope', '$window',
function (ProductModel, $location, $rootScope, $window) {
    return {
        restrict: 'A',
        scope: true,
        replace: true,
        link: function (scope, element, attrs) {
            var state = window.getComputedStyle(document.querySelector('.state-indicator'), ':before').getPropertyValue('content').replace(/"/g, ''),
                isProductPage = attrs.isProductPage == 'true';

            scope.skinSettings = ((window.skinSettings || {}).product || {});
            scope.skinSettings.useFotorama = state != 'desktop';

            scope.section = {
                id: parseInt(attrs.sectionProduct, 10),
                configurationId: parseInt(attrs.configId, 10),
                imageTypes: angular.fromJson(attrs.imageTypes),
                template: attrs.template,
                url: attrs.url,
                link: attrs.link
            };
            var SESSION_LAST_SEARCH_KEY = 'lastSearch' + scope.section.id;

            scope.fotoRamaOptions = {
                width: '100%',
                height: 250,
                loop: true,
                keyboard: true,
                nav: 'thumbs',
                allowfullscreen: true
            };
            scope.fotoRamaImages = [];
            scope.$watch('localCurrent.fotoImages', (images) => {
                scope.fotoRamaImages = images;
            });

            scope.current = {
                showFilterPopup: false,
                infiniteScrollDisabled: true,
                isCollapsed: state != 'desktop'
            };

            scope.checkboxesState = ($window.skinSettings && $window.skinSettings.products && $window.skinSettings.products.filter) && $window.skinSettings.products.filter == 'on';
            scope.section.imageTypes = angular.extend(scope.section.imageTypes, ($window.skinSettings.products && $window.skinSettings.products.imageTypes) || {});

            scope.defaultFilter = {};
            scope.productFilter = {};
            scope.enabledFilter = {}; // for checkboxes
            scope.products = [];
            scope.filterData = {};
            scope.searchData = {};

            var hash = $location.hash();
            if (hash) {
                var scrollTo = ($('a[name="' + hash + '"]').offset() || {}).top || 0;
                scrollTo -= $('.navbar-fixed-top').height() || 0;
                $('html, body').animate({
                    scrollTop: parseInt(scrollTo)
                }, 500);
            }

            scope.$watch('localCurrent.tabs', tabs => {
                setTimeout(() => {
                    const scrollEl = /*state == 'desktop' ? '.product-section' : */ '.product-attributes';
                    if ($(scrollEl).size() == 0) {
                        return;
                    }
                    const top = $(scrollEl).offset().top - $('.navbar.top').height() - $('.product-filter-outer').height();

                    $('html, body').animate({
                        scrollTop: top
                    }, 500);
                }, 200)
            }, true);

            scope.filterWith = (name, value) => {
                if (value === null) {
                    delete scope.productFilter[name];
                } else {
                    scope.productFilter[name] = value;
                }
                scope.filterProducts();
            };

            scope.filterProducts = () => {
                var productFilter = angular.copy(scope.productFilter);

                for (var key in scope.enabledFilter) {
                    if (scope.enabledFilter.hasOwnProperty(key) && !scope.enabledFilter[key]) {
                        delete productFilter[key];
                    }
                }
                var qs = filterToParams(productFilter, scope.filterData.attributes, scope.enabledFilter);
                sessionStorage.setItem(SESSION_LAST_SEARCH_KEY, angular.toJson(qs));

                if (isProductPage) {
                    var q = filterToQs(productFilter, scope.filterData.attributes, scope.enabledFilter);
                    q = (scope.section.url.indexOf('?') === -1 ? '?' : '&') + q;
                    location.href = scope.section.url + q;
                    return;
                }
                // if (qs) {
                //   qs = (scope.section.settings.url.indexOf('?') == -1 ? '?' : '&') + qs;
                // }

                var scrollTo = ($('.product-section-anchor', element).offset() || {}).top || 0;
                scrollTo -= $('.navbar-fixed-top').height() || 0;
                $('html, body').animate({
                    scrollTop: parseInt(scrollTo)
                }, 500);
                scope.current.isCollapsed = true;
                $location.search(qs);

                scope.productFilter = qsToFilter(qs, scope.filterData.attributes, {});
                scope.products = [];
                getProducts();
            };

            scope.resetFilter = () => {
                scope.enabledFilter = {};
                scope.productFilter = {};
                scope.section.activeFilters = {};
                angular.copy(scope.defaultFilter, scope.productFilter);
                //scope.filterProducts();
                $location.search({});
                sessionStorage.removeItem(SESSION_LAST_SEARCH_KEY);
                getProducts();
            };
            scope.canReset = () => {
                return Object.keys($location.search()).length > 0;
            };

            var onFilterChange = () => {
                if (scope.loadingCount || !scope.filterData) {
                    return;
                }
                //console.info('onFilterChange', scope.productFilter, scope.filterData.attributes);
                var args = scope.getQueryArguments();

                for (var key in scope.enabledFilter) {
                    if (scope.enabledFilter.hasOwnProperty(key) && scope.enabledFilter[key]) {
                        args['f' + key] = scope.productFilter[key];
                        if (angular.isArray(args['f' + key])) {
                            args['f' + key] = args['f' + key].join('-');
                        }
                    }
                }
              //console.info('onFilterChange2', args);
                scope.loadingCount = true;

                args.section_id = scope.section.id;
                args.configuration_id = scope.section.configurationId;
                args.only_count = true;
                delete args.offset;
                getFilter();
                ProductModel.getProducts(args, (res, headers) => {
                    scope.filterCount = headers()['x-total-count'];
                    scope.loadingCount = false;
                });
            };
            scope.$watch('enabledFilter', onFilterChange, true);
            scope.$watch('productFilter', onFilterChange, true);

            var getSearch = (() => {
              return ProductModel.getSearchs(
                {
                  configurationId: scope.section.configurationId
                }, (result) => {
                  if (result.searchData && !result.searchData.disabled) {
                    return scope.searchData = angular.extend(scope.searchData, result.searchData);
                  } else {
                    return scope.searchData.disabled = true;
                  }
              }).$promise;
            })();

            scope.loadMore = () => {
                if (!scope.productsData) {
                    return;
                }
                getProducts();
            };

            scope.goto = url => {
                if (!url) return;
                location.href = url;
            };

            var firstFilterCall = true;
            var getFilter = () => {
                var args = scope.filterData ? scope.getQueryArguments() : {};
                args.configurationId = scope.section.configurationId;

                for (var key in scope.enabledFilter) {
                    if (scope.enabledFilter.hasOwnProperty(key) && scope.enabledFilter[key]) {
                        args['f' + key] = scope.productFilter[key];
                        if (angular.isArray(args['f' + key])) {
                            args['f' + key] = args['f' + key].join('-');
                        }
                    }
                }
                return ProductModel.getFilters(args, (res) => {
                    if (!firstFilterCall) {
                        $.each(res.attributes, (n, attribute) => {
                            var attr = scope.filterData.attributes.find(item => item.id == attribute.id);
                            if (!attr || args['f' + attr.name]) {
                                return;
                            }
                            if (attribute.range) {
                                scope.productFilter[attr.name] = [parseInt(attribute.range.min), parseInt(attribute.range.max)];
                            }
                            attr.values = attribute.values;
                        });
                        return;
                    }
                    res.attributes = $.each(res.attributes, (n, attribute) => {
                        if (attribute.range) {
                            attribute.range.min = parseInt(attribute.range.min);
                            attribute.range.max = parseInt(attribute.range.max);
                        }
                        return attribute;
                    });
                    scope.filterData = res;
                    firstFilterCall = false;
                    scope.current.infiniteScrollDisabled = scope.filterData.loadListChunks == 'manual';

                    scope.defaultFilter = qsToFilter({}, scope.filterData.attributes, {});
                    scope.productFilter = qsToFilter($location.search(), scope.filterData.attributes, {});

                    if (scope.checkboxesState) {
                        $.each(scope.filterData.attributes, (n, attribute) => {
                            if (attribute.type === 'number-slider' && !attribute.hidden) {
                                scope.enabledFilter[attribute.name] = true;
                            }
                        });
                    }
                }).$promise;
            };

            scope.getQueryArguments = () => {
                var args = {
                    section: scope.section.id,
                    offset: scope.products.length
                }, filter = filterToParams(scope.productFilter, scope.filterData.attributes, {}, true);

                return angular.extend(args, filter);
            };

            var getProducts = () => {
                // get product only when no active loading and its first query on product page (for counter of products)
                if (scope.loading) {
                    return;
                }

                var args = scope.getQueryArguments();

                var enabled = qsToFilter($location.search(), scope.filterData.attributes, {}, true),
                    activeFilter = {};

                $.each(enabled, (filterName, value) => {
                    if (!value || (Array.isArray(value) && value[0] === null && value[1] === null)) {
                        return;
                    }
                    activeFilter[filterName] = scope.filterData.attributes.find(item => item.name === filterName);
                    if (!activeFilter[filterName]) {
                        delete activeFilter[filterName];
                    } else {
                        scope.enabledFilter[filterName] = true;
                    }
                });
                for (var key in scope.enabledFilter) {
                    if (scope.enabledFilter.hasOwnProperty(key) && scope.enabledFilter[key]) {
                        args['f' + key] = scope.productFilter[key];
                        if (angular.isArray(args['f' + key])) {
                            args['f' + key] = args['f' + key].join('-');
                        }
                    }
                }
                scope.section.activeFilters = activeFilter;
                scope.section.hasActiveFilters = Object.keys(activeFilter).length;

                scope.isCanReset = scope.canReset();
                scope.loading = true;
                scope.current.showFilterPopup = false;

                args.section_id = scope.section.id;
                args.configuration_id = scope.section.configurationId;

                if (!scope.searchData.disabled && scope.searchData.query && angular.isArray(scope.searchData.attributes)) {
                  scope.searchData.attributes.forEach(attributeName => (args['search' + attributeName] = scope.searchData.query));
                }

                ProductModel.getProducts(args, (res) => {
                    scope.productsData = res.data;
                    scope.loaded = !res.data.nextCount;

                    scope.products = scope.products.concat(
                        $.map(res.data.products, product => {
                            // replace url if set link in simple product section
                            if (scope.section.template === 'simple-product') {
                                if (scope.section.link && scope.section.link !== '') {
                                    var str = product.url;
                                    product.url = scope.section.link + str.substring(str.lastIndexOf('/'));
                                    product.url = product.url.replace(location.origin, '');
                                }
                            }
                            return product;
                        })
                    );
                    scope.loading = false;
                });
            };

            getFilter().then(function () {
                scope.loadingCount = true;
                if (isProductPage) {
                    var lastSearch = sessionStorage.getItem(SESSION_LAST_SEARCH_KEY);
                    if (lastSearch) {
                        scope.productFilter = qsToFilter(angular.fromJson(lastSearch), scope.filterData.attributes, {}, true);
                        scope.section.activeFilters = {};
                        $.each(scope.productFilter, (filterName, value) => {
                            if (!value) {
                                return;
                            }
                            var name = filterName.substring(0);
                            scope.section.activeFilters[name] = scope.filterData.attributes.find(item => item.name == name);
                            if (!scope.section.activeFilters[name]) {
                                delete scope.section.activeFilters[name];
                            } else {
                                scope.enabledFilter[name] = true;
                            }
                            if (scope.section.activeFilters[name] === '-') {
                              delete scope.section.activeFilters[name];
                            }
                        });
                        console.info('active', scope.section.activeFilters);
                        scope.section.hasActiveFilters = Object.keys(scope.section.activeFilters).length;
                        scope.isCanReset = scope.section.hasActiveFilters;

                        var q = filterToQs(scope.productFilter, scope.filterData.attributes, {}, true);
                        q = (scope.section.url.indexOf('?') === -1 ? '?' : '&') + q;
                        $('#productPageBackButton').attr('href', scope.section.url + q);
                        scope.loadingCount = false;
                    }
                } else {
                    scope.productFilter = qsToFilter($location.search(), scope.filterData.attributes, {}, true);
                    scope.products = [];

                    var activeFilter = {};

                    $.each(scope.productFilter, (filterName, value) => {
                        if (!value) {
                            return;
                        }
                        activeFilter[filterName] = scope.filterData.attributes.find(item => item.name === filterName);
                        if (!activeFilter[filterName]) {
                            delete activeFilter[filterName];
                        } else {
                            scope.enabledFilter[filterName] = true;
                        }
                    });

                    firstFilterCall = true;
                    scope.loadingCount = false;
                    getFilter().then(getProducts);
                }
            });

            scope.removeFilter = filter => {
                delete scope.enabledFilter[filter.name];
                if (filter.type === 'number-slider') {
                  scope.filterWith(filter.name, [parseInt(filter.range.min), parseInt(filter.range.max)]);
                } else if (filter.type === 'number-input') {
                  scope.filterWith(filter.name, null);
                } else {
                  scope.filterWith(filter.name, null);
                }
            };
        }
    };
}];
