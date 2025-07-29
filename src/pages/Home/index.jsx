import React from "react";
import { Link, Route, Routes, useLocation } from "react-router";
import Messages from "./Messages";
import Devices from "./Devices";
import Files from "./Files";

const Home = () => {
  const location = useLocation();

  const tabs = [
    { id: 'files', label: 'Files', icon: '📁', path: '/' },
    { id: 'messages', label: 'Messages', icon: '💬', path: '/messages' },
    { id: 'devices', label: 'Devices', icon: '📱', path: '/devices' }
  ];

  const getActiveTab = () => {
    const currentPath = location.pathname;
    if (currentPath === '/messages') return 'messages';
    if (currentPath === '/devices') return 'devices';
    return 'files'; // default to files for root path
  };

  const activeTab = getActiveTab();

  return (
    <div>
      <div className="flex tab-nav">
        {tabs.map(tab => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
            {tab.label}
          </Link>
        ))}
      </div>
      <div>
        <Routes>
          <Route path="/devices" element={<Devices />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/" element={<Files />} />
        </Routes>
      </div>
    </div>
  )
}

export default Home;
