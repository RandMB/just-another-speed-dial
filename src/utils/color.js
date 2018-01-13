const colors = ['#0a84ff', '#00feff', '#ff1ad9', '#30e60b', '#ffe900', '#ff0039', '#9400ff', '#ff9400', '#0060df', '#00c8d7', '#ed00b5', '#12bc00', '#d7b600', '#d70022', '#8000d7', '#d76e00'];

// See: https://stackoverflow.com/a/5624139
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function getRandomPhotonColor() {
    return colors[getRandomInt(colors.length)];
}

function getTextColor(bgColor) {
    // See: https://stackoverflow.com/a/1855903
    // Counting the perceptive luminance - human eye favors green color...
    const a = 1 - (0.299 * bgColor.r + 0.587 * bgColor.g + 0.114 * bgColor.b) / 255;

    if (a < 0.5) {
        return [0, 0, 0]; // bright colors - black font
    } else {
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
    });
}

export default getColors;
