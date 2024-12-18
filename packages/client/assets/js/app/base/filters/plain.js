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
function () {
    return function(text) {
        return stripHtml(text);
    };
};
