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
    chrome.bookmarks.move(id, destination);
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

function update(id, changes) {
    chrome.bookmarks.update(id, changes);
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

OnMoved.prototype.addListener = function onMovedAddListener(func) {
    chrome.bookmarks.onMoved.addListener(func);
};

OnMoved.prototype.removeListener = function onMovedRemoveListener(func) {
    chrome.bookmarks.onMoved.removeListener(func);
};

function OnCreated() {}

OnCreated.prototype.addListener = function onCreatedAddListener(func) {
    chrome.bookmarks.onCreated.addListener(func);
};

OnCreated.prototype.removeListener = function onCreatedRemoveListener(func) {
    chrome.bookmarks.onCreated.removeListener(func);
};

function OnRemoved() {}

OnRemoved.prototype.addListener = function onRemovedAddListener(func) {
    chrome.bookmarks.onRemoved.addListener(func);
};

OnRemoved.prototype.removeListener = function onRemovedRemoveListener(func) {
    chrome.bookmarks.onRemoved.removeListener(func);
};

function OnChanged() {}

OnChanged.prototype.addListener = function onChangedAddListener(func) {
    chrome.bookmarks.onChanged.addListener(func);
};

OnChanged.prototype.removeListener = function onChangedRemoveListener(func) {
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
    update,
    onMoved: new OnMoved(),
    onCreated: new OnCreated(),
    onRemoved: new OnRemoved(),
    onChanged: new OnChanged(),
    filterChild,
    isBookmark,
    isFolder,
    isOpenable,
};
