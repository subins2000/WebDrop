import React, { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Header from './components/Header'

import { BrowserRouter, Routes, Route } from "react-router";

import './css/utils.css'
import './css/style.css'

import Home from './pages/Home';
import Settings from './pages/Settings';
import { startP2PT } from './p2pt';

const App = () => {
  useEffect(() => {
    startP2PT(1)
  }, []);

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Home />} />
        </Routes>
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
