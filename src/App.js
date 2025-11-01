import React from 'react';
import InterviewScheduler from './components/InterviewScheduler';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Recruitment Platform</h1>
        <p>Schedule interviews with Google Calendar integration</p>
      </header>
      <main>
        <InterviewScheduler />
      </main>
    </div>
  );
}

export default App;
