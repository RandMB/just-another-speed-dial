import React, { Component } from 'react';

import './App.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        var clearStorage = browser.storage.local.clear();
        clearStorage.then();
    }

    render() {
        return (
            <form>
                <button onClick={this.onClick} type="submit">Clear local storage</button>
            </form>
        );
    }
}

export default App;
