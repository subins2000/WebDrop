import React from 'react'

import Header from './components/Header'

import { BrowserRouter, Routes, Route } from "react-router";

import './style.css'
import Home from './pages/Home';
import Settings from './pages/Settings';

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" component={Home} />
          <Route path="/settings" component={Settings} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
