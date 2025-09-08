import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        newestOnTop={true}
      />
    </>
  );
}

export default App;
