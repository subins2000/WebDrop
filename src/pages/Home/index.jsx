import React from "react";
import { Link, Route, Routes, useLocation } from "react-router";
import Messages from "./Messages";
import Devices from "./Devices";
import Files from "./Files";
import DragDrop from "../../components/DragDrop";
import FilesDropAcceptor from "../../components/FilesDropAcceptor";
import { useMainStore } from "../../store";

const Home = () => {
  const location = useLocation();
  const { shares, msgs, users } = useMainStore();

  const tabs = [
    { id: 'files', label: 'Files', icon: '📁', path: '/', count: Object.keys(shares).length },
    { id: 'messages', label: 'Messages', icon: '💬', path: '/messages', count: msgs.length },
    { id: 'devices', label: 'Devices', icon: '📱', path: '/devices', count: Object.keys(users).length }
  ];

  const getActiveTab = () => {
    const currentPath = location.pathname;
    if (currentPath === '/messages') return 'messages';
    if (currentPath === '/devices') return 'devices';
    return 'files'; // default to files for root path
  };

  const activeTab = getActiveTab();

  return (
    <>
      <FilesDropAcceptor />
      <div id="container">
        <div className="flex tab-nav mb-2">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
              <span className="hidden md:inline-block">{tab.label}</span>&nbsp;&nbsp;
              <div>
                <div className="tag tag-teal">{tab.count}</div>
              </div>
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
    </>
  )
}

export default Home;
