/* function connected(p) {
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

browser.runtime.onConnect.addListener(connected); */