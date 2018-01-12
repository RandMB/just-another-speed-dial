import localStorage from './storageUtils';
import bookmarks from './bookmarkUtils';

// Firefox and chrome supports callback based with chrome,
//   Edge uses callbacks with browser. Normalize them, to use just one style
window.chrome = window.chrome || window.browser;

export default {
    localStorage,
    bookmarks,
};
