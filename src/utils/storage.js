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

function clear() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.clear(() => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else {
                resolve();
            }
        });
    });
}

function set(items) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set(items, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else {
                resolve();
            }
        });
    });
}

function OnChanged() { }

OnChanged.prototype.addListener = function OnChangedAddListener(func) {
    chrome.storage.onChanged.addListener(func);
};

OnChanged.prototype.removeListener = function OnChangedRemoveListener(func) {
    chrome.storage.onChanged.removeListener(func);
};

export default {
    local: {
        get,
        set,
        clear,
    },
    onChanged: new OnChanged(),
};
