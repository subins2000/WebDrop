import React from 'react'

import { Header } from './components/Header'

import './style.css'

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" component={Home} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
