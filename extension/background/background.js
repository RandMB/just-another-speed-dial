const baseUrl = 'https://s2.googleusercontent.com/s2/favicons?domain_url=';

function getImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        // Can't set cross origin to be anonymous for data url's
        // https://github.com/mrdoob/three.js/issues/1305
        if (imageUrl.substring(0, 5) !== 'data:')
            img.crossOrigin = "Anonymous";

        img.onload = function () {
            resolve(img);
        };

        img.onerror = function () {
            reject();
        };

        img.src = imageUrl;
    });
}

function getColors(url) {
    const imgUrl = baseUrl + encodeURIComponent(url);
    return new Promise((resolve) => {
        getImage(imgUrl).then((img) => {
            const colorThief = new ColorThief();

            const dominant = colorThief.getColor(img, 3);

            // See: https://stackoverflow.com/a/1855903
            let d = 0;

            // Counting the perceptive luminance - human eye favors green color... 
            let a = 1 - (0.299 * dominant[0] + 0.587 * dominant[1] + 0.114 * dominant[2]) / 255;

            if (a < 0.5) {
                d = 0; // bright colors - black font
            }
            else {
                d = 255; // dark colors - white font
            }
            
            console.log(imgUrl);
            console.log(dominant);
            console.log(`rgb(${d}, ${d}, ${d})`);
            
            resolve({
                background: dominant,
                text: [d, d, d],
            });
        }).catch(() => {
            // Return some sane defaults
            resolve({
                background: [255, 255, 255],
                text: [0, 0, 0],
            });
        });
    });
}

function connected(p) {
    p.onMessage.addListener((message) => {
        getColors(message.url).then((color) => {
            p.postMessage({
                id: message.id,
                background: color.background,
                text: color.text,
            });
        });
    });
}

browser.runtime.onConnect.addListener(connected);