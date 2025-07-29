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
        <div id="container">
          <Routes>
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
