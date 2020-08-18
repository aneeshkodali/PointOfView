import React, { Component } from 'react';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import Matches from './components/Matches';

import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <AppNavbar />
        <Header />
        <Matches />
      </div>
    )
  }
}

export default App;
