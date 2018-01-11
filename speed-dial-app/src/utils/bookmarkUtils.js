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

function extractFolders(bookmarkArray, defaultObject = {}) {
    return bookmarkArray
        .filter((element) => element.title && !element.url)
        .map((element) => {
            return Object.assign({}, defaultObject, {
                id: element.id,
                title: element.title,
            });
        });
}

function filterChildren(children) {
    return children.filter((child) => {
        // Is a bookmark
        if (child.title && child.url) {
            // Extensions can't open these urls anyway
            return !(child.url.startsWith('place:') || child.url.startsWith('about:'));
        }

        // Is a folder
        return child.title && !child.url;
    });
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



export default {
    get,
    getTree,
    getChildren,
    getRootChildren,
    getSubfolders,
    getFolderChildren,
    move,
};