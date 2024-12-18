export default
['$resource',
function ProductModel($resource) {
    var resource = $resource('/cms-ajax', {
        section: '@section'
    }, {
        'getProducts': { method: 'GET', params: { section_id: '@section_id', configuration_id: '@configuration_id' }, url: '/api/products/' },
        'getRelated': { method: 'GET', isArray: true, params: { section_id: '@section_id', configuration_id: '@configuration_id' }, url: '/api/products/:id/related' },
        'getFilters': { method: 'GET', url: '/api/configuration/:configurationId/filter' },
        'getSearchs': { method: 'GET', url: '/api/configuration/:configurationId/search' }
    });
    return resource;
}];
