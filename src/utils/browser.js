import localStorage from './storage';
import bookmarks from './bookmarks';
import color from './color';

// Firefox and chrome supports callback based with chrome,
//   Edge uses callbacks with browser. Normalize them, to use just one style
window.chrome = window.chrome || window.browser;

let browserVer = null;
// https://stackoverflow.com/a/19295499
if (/Chrome\/([0-9.]+)/.exec(navigator.userAgent)) {
    browserVer = 'chrome';
} else {
    browserVer = 'firefox';
}

export default {
    colors: color,
    localStorage,
    bookmarks,
    browserType: browserVer,
};
