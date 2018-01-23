'use strict';

(function w() {
    const fullUrl = window.runtime.getUrl('background/public_suffix_list.dat');

    fetch(fullUrl).then((response) => {
        return response.text();
    }).then((text) => {
        window.publicSuffixList.parse(text, window.punycode.toASCII);
    });

    function getHostname(fullUrl) {
        let hostname = null;

        try {
            hostname = new URL(fullUrl).host;
        } catch (error) {
            return null;
        }

        // Chrome doesn't throw if url invalid... Workaround
        if (!hostname) {
            return null;
        }

        return hostname;
    }

    window.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.task === 'parse-url') {
            const hostname = getHostname(msg.data.url);

            // If url parsing failed
            if (!hostname) {
                sendResponse({
                    url: msg.data.url,
                    hostname: msg.data.url,
                    domain: null,
                    suffix: '',
                    subdomain: '',
                });
                return;
            }

            const domain = window.publicSuffixList.getDomain(hostname);
            const suffix = window.publicSuffixList.getPublicSuffix(hostname);


            // The parse was successful, but domain is empty
            //   happens with localhost and if you pass a suffix only (no domain)
            if (suffix.length > 0 && domain.length === 0) {
                sendResponse({
                    url: msg.data.url,
                    hostname: hostname,
                    domain: suffix,
                    suffix: '',
                    subdomain: '',
                });
                return;
            }

            const realDomain = domain.substring(0, domain.indexOf('.'));
            const subdomain = hostname.substring(0, hostname.length - domain.length - 1);

            // www subdomain is useless, don't display it
            const realSubdomain = subdomain !== 'www' ? subdomain : '';

            // console.log(hostname + ' : ' + realSubdomain + ' : ' + realDomain + ' : ' + suffix);

            sendResponse({
                url: msg.data.url,
                hostname: hostname,
                domain: realDomain,
                suffix: suffix,
                subdomain: realSubdomain,
            });
            return;
        }
    })
}());