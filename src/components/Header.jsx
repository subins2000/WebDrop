import React from 'react'
import { Link } from 'react-router';

const Header = () => {
  return (
    <div id="header" className="bg-green flex justify-between items-center px-4">
      <Link to="/">
        <h1 className="text-md">WebDrop</h1>
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/settings">Settings</Link>
      </div>
    </div>
  )
}

export default Header;