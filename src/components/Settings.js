import React, { useState, useEffect } from 'react';
import googleCalendarService from '../services/googleCalendar';
import './Settings.css';

const Settings = ({ onSettingsChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCurrentSettings();
    checkConnectionStatus();
  }, []);

  const loadCurrentSettings = () => {
    // Load from localStorage (in production, this would be from your backend)
    const savedApiKey = localStorage.getItem('google_api_key') || process.env.REACT_APP_GOOGLE_API_KEY;
    const savedClientId = localStorage.getItem('google_client_id') || process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (savedApiKey && savedApiKey !== 'your_google_api_key_here') {
      setApiKey(savedApiKey);
    }
    if (savedClientId && savedClientId !== 'your_google_client_id_here') {
      setClientId(savedClientId);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      await googleCalendarService.initializeGapi();
      if (googleCalendarService.isSignedIn) {
        setIsConnected(true);
        const profile = googleCalendarService.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        setUserEmail(profile.getEmail());
      }
    } catch (error) {
      console.log('Not connected to Google Calendar');
    }
  };

  const saveSettings = async () => {
    if (!apiKey || !clientId) {
      setMessage('Please provide both API Key and Client ID');
      return;
    }

    setIsSaving(true);
    try {
      // Save to localStorage (in production, save to your backend)
      localStorage.setItem('google_api_key', apiKey);
      localStorage.setItem('google_client_id', clientId);
      
      // Update environment variables for current session
      process.env.REACT_APP_GOOGLE_API_KEY = apiKey;
      process.env.REACT_APP_GOOGLE_CLIENT_ID = clientId;

      // Reinitialize the service with new credentials
      await googleCalendarService.initializeGapi();
      
      setMessage('Settings saved successfully! You can now connect to Google Calendar.');
      onSettingsChange && onSettingsChange();
    } catch (error) {
      setMessage('Error saving settings: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const connectToGoogle = async () => {
    try {
      await googleCalendarService.signIn();
      setIsConnected(true);
      const profile = googleCalendarService.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
      setUserEmail(profile.getEmail());
      setMessage('Successfully connected to Google Calendar!');
    } catch (error) {
      setMessage('Failed to connect to Google Calendar: ' + error.message);
    }
  };

  const disconnectFromGoogle = async () => {
    try {
      await googleCalendarService.gapi.auth2.getAuthInstance().signOut();
      setIsConnected(false);
      setUserEmail('');
      setMessage('Disconnected from Google Calendar');
    } catch (error) {
      setMessage('Error disconnecting: ' + error.message);
    }
  };

  console.log('Settings component rendering');
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', background: 'white', borderRadius: '8px' }}>
      <h2>Calendar Settings</h2>
      
      <div className="settings-section">
        <h3>Google Calendar Integration</h3>
        
        {isConnected ? (
          <div className="connection-status connected">
            <div className="status-info">
              <span className="status-indicator"></span>
              <div>
                <p><strong>Connected to Google Calendar</strong></p>
                <p className="user-email">{userEmail}</p>
              </div>
            </div>
            <button onClick={disconnectFromGoogle} className="btn-secondary">
              Disconnect
            </button>
          </div>
        ) : (
          <div className="connection-status disconnected">
            <div className="status-info">
              <span className="status-indicator"></span>
              <p>Not connected to Google Calendar</p>
            </div>
            {apiKey && clientId ? (
              <button onClick={connectToGoogle} className="btn-primary">
                Connect to Google Calendar
              </button>
            ) : (
              <p className="setup-required">Please configure API credentials below</p>
            )}
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>API Configuration</h3>
        <p className="section-description">
          Configure your Google Calendar API credentials. These will be saved securely for future use.
        </p>
        
        <div className="form-group">
          <label htmlFor="apiKey">Google API Key</label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Google API Key"
            className="settings-input"
          />
          <small>Get this from Google Cloud Console → APIs & Services → Credentials</small>
        </div>

        <div className="form-group">
          <label htmlFor="clientId">OAuth Client ID</label>
          <input
            id="clientId"
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Enter your OAuth Client ID"
            className="settings-input"
          />
          <small>Create an OAuth 2.0 Client ID for web applications</small>
        </div>

        <button 
          onClick={saveSettings} 
          disabled={isSaving || (!apiKey || !clientId)}
          className="btn-primary save-button"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') || message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="settings-section">
        <h3>Setup Instructions</h3>
        <div className="instructions">
          <ol>
            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
            <li>Create a new project or select existing one</li>
            <li>Enable the Google Calendar API</li>
            <li>Create credentials (API Key + OAuth Client ID)</li>
            <li>Add <code>http://localhost:3002</code> to authorized origins</li>
            <li>Copy and paste the credentials above</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Settings;