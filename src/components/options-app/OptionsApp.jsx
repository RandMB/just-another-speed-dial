import React, { Component } from 'react';

import './OptionsApp.css';

class OptionsApp extends Component {
    static onClick() {
        const clearStorage = browser.storage.local.clear();
        clearStorage.then();
    }

    render() {
        return (
            <form>
                <button onClick={OptionsApp.onClick} type="submit">Clear local storage</button>
            </form>
        );
    }
}

export default OptionsApp;
