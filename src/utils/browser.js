import storage from './storage';
import bookmarks from './bookmarks';
import colors from './color';
import runtime from '../../extension/shared/runtime';

// Firefox and chrome supports callback based with chrome,
//   Edge uses callbacks with browser. Normalize them, to use just one style
window.chrome = window.chrome && window.chrome.runtime ? window.chrome : window.browser;

let browserType = null;
// https://stackoverflow.com/a/19295499
if (/Chrome\/([0-9.]+)/.exec(navigator.userAgent)) {
    browserType = 'chrome';
} else {
    browserType = 'firefox';
}

export default {
    colors,
    storage,
    bookmarks,
    runtime,
    browserType,
};
