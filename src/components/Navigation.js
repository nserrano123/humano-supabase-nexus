import React from 'react';
import './Navigation.css';

const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'scheduler', label: 'Interview Scheduler', icon: '📅' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>Recruitment Platform</h1>
      </div>
      <div className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;