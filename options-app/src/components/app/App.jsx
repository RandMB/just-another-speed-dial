import React, { Component } from 'react';

import './App.css';

class App extends Component {
    static onClick() {
        const clearStorage = browser.storage.local.clear();
        clearStorage.then();
    }

    render() {
        return (
            <form>
                <button onClick={App.onClick} type="submit">Clear local storage</button>
            </form>
        );
    }
}

export default App;
