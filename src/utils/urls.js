import utils from './browser';

function urlParser() {
    let urlCache = {};
    let lastUpdateTime = Date.now();
    let cleanupTimeout = null;

    function cleanCache() {
        const currentTime = Date.now();

        // Cleanup every 5 minutes of inactivity
        if (currentTime - lastUpdateTime > 1000 * 60 * 5) {
            urlCache = {};

            clearTimeout(cleanupTimeout);
            cleanupTimeout = null;
        }
    }

    function parse(url) {
        return new Promise((resolve) => {
            lastUpdateTime = Date.now();

            if (urlCache[url]) {
                resolve(urlCache[url]);
                return;
            }

            utils.runtime.sendMessage({
                task: 'parse-url',
                data: {
                    url,
                },
            }).then((response) => {

                urlCache[url] = response;

                resolve(response);

                if (!cleanupTimeout) {
                    // 5 minutes
                    cleanupTimeout = setTimeout(cleanCache, 1000 * 60 * 5);
                }
            });
        });
    }

    return {
        parse,
    };
}

export default urlParser();
