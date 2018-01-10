import React, { Component } from 'react';

import './App.css';

class App extends Component {
    render() {
        return (
            <form>
                <label>Favourite colour</label>
                <input type="text" id="colour" />>
                    <button type="submit">Save</button>
            </form>
        );
    }
}

export default App;
