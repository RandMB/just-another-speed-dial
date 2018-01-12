import localStorage from './storage';
import bookmarks from './bookmarks';
import color from './color';

// Firefox and chrome supports callback based with chrome,
//   Edge uses callbacks with browser. Normalize them, to use just one style
window.chrome = window.chrome || window.browser;

export default {
    getColor: color,
    localStorage,
    bookmarks,
};
