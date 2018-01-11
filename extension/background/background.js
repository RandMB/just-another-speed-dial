const colors = ['#0a84ff', '#00feff', '#ff1ad9', '#30e60b', '#ffe900', '#ff0039', '#9400ff', '#ff9400', '##0060df', '#00c8d7', '#ed00b5', '#12bc00', '#d7b600', '#d70022', '#8000d7', '#d76e00', '#ffffff'];

// See: https://stackoverflow.com/a/5624139 
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function getRandomPhotonColor() {
    return colors[getRandomInt(colors.length)];
}

function getTextColor(backgroundColor) {
    // See: https://stackoverflow.com/a/1855903
    // Counting the perceptive luminance - human eye favors green color... 
    const a = 1 - (0.299 * backgroundColor.r + 0.587 * backgroundColor.g + 0.114 * backgroundColor.b) / 255;

    if (a < 0.5) {
        return [0, 0, 0]; // bright colors - black font
    }
    else {
        return [255, 255, 255]; // dark colors - white font
    }
}

function getColors() {
    return new Promise((resolve) => {
        const color = hexToRgb(getRandomPhotonColor());
        const textColor = getTextColor(color);

        resolve({
            background: [color.r, color.g, color.b],
            text: textColor,
        });
    })
}

function connected(p) {
    p.onMessage.addListener((message) => {
        getColors().then((color) => {
            p.postMessage({
                id: message.id,
                background: color.background,
                text: color.text,
            });
        });
    });
}

browser.runtime.onConnect.addListener(connected);