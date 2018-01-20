function getTree() {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.getTree((data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else {
                resolve(data);
            }
        });
    });
}

function getChildren(id) {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.getChildren(id, (data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else {
                resolve(data);
            }
        });
    });
}

function move(id, destination = {}) {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.move(id, destination, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else {
                resolve();
            }
        });
    });
}

function get(ids) {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.get(ids, (data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else {
                resolve(data);
            }
        });
    });
}

function isBookmark(item) {
    // An item is a bookmark if it has a url
    return !!item.url;
}

function isFolder(item) {
    // An item is a folder if it has a title but no url
    return item.title && !item.url;
}

function isOpenable(item) {
    // Extensions can't open these urls anyway
    return !item.url.startsWith('place:') && !item.url.startsWith('about:') && !item.url.startsWith('data:');
}

function extractFolders(bookmarkArray, defaultObject = {}) {
    return bookmarkArray
        .filter(element => isFolder(element))
        .map((element) => {
            return Object.assign({}, defaultObject, {
                id: element.id,
                title: element.title,
            });
        });
}

function filterChild(child) {
    if (isBookmark(child) && isOpenable(child)) {
        return {
            id: child.id,
            index: child.index,
            url: child.url,
            title: child.title,
            type: 'bookmark',
        };
    }

    if (isFolder(child)) {
        return {
            id: child.id,
            index: child.index,
            title: child.title,
            type: 'folder',
        };
    }

    return null;
}

function filterChildren(children) {
    return children.reduce((acc, child) => {
        const filtered = filterChild(child);

        if (filtered) {
            acc.push(filtered);
        }

        return acc;
    }, []);
}

async function getRootChildren(defaultObject) {
    const tree = await getTree();
    const rootChildren = await getChildren(tree[0].id);

    return extractFolders(rootChildren, defaultObject);
}

async function getSubfolders(id, defaultObject) {
    const children = await getChildren(id);

    return extractFolders(children, defaultObject);
}

async function getFolderChildren(id) {
    const children = await getChildren(id);

    return filterChildren(children);
}

function OnMoved() {}

OnMoved.prototype.addEventListener = function onMovedAddEventListener(func) {
    chrome.bookmarks.onMoved.addListener(func);
};

OnMoved.prototype.removeEventListener = function onMovedRemoveEventListener(func) {
    chrome.bookmarks.onMoved.removeListener(func);
};

function OnCreated() {}

OnCreated.prototype.addEventListener = function onCreatedAddEventListener(func) {
    chrome.bookmarks.onCreated.addListener(func);
};

OnCreated.prototype.removeEventListener = function onCreatedRemoveEventListener(func) {
    chrome.bookmarks.onCreated.removeListener(func);
};

function OnRemoved() {}

OnRemoved.prototype.addEventListener = function onRemovedAddEventListener(func) {
    chrome.bookmarks.onRemoved.addListener(func);
};

OnRemoved.prototype.removeEventListener = function onRemovedRemoveEventListener(func) {
    chrome.bookmarks.onRemoved.removeListener(func);
};

function OnChanged() {}

OnChanged.prototype.addEventListener = function onChangedAddEventListener(func) {
    chrome.bookmarks.onChanged.addListener(func);
};

OnChanged.prototype.removeEventListener = function onChangedRemoveEventListener(func) {
    chrome.bookmarks.onChanged.removeListener(func);
};

export default {
    get,
    getTree,
    getChildren,
    getRootChildren,
    getSubfolders,
    getFolderChildren,
    move,
    onMoved: new OnMoved(),
    onCreated: new OnCreated(),
    onRemoved: new OnRemoved(),
    onChanged: new OnChanged(),
    filterChild,
    isBookmark,
    isFolder,
    isOpenable,
};
