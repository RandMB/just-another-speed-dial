function get(keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, (data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else {
                resolve(data);
            }
        });
    });
}

function set(items) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(items, (data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else {
                resolve();
            }
        });
    });
}

export default {
    get,
    set,
};