import React, { useEffect } from 'react'

import Header from './components/Header'

import { BrowserRouter, Routes, Route } from "react-router";

import './style.css'
import Home from './pages/Home';
import Settings from './pages/Settings';
import { startP2PT } from './p2pt';
import { useLocalStorageStore, useMainStore } from './store';

const App = () => {
  const persistentStore = useLocalStorageStore()
  const mainStore = useMainStore()

  useEffect(() => {
    startP2PT(1, persistentStore, mainStore)
  }, []);

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
