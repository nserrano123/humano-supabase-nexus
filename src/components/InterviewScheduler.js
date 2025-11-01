import React, { useState, useEffect } from 'react';
import googleCalendarService from '../services/googleCalendar';
import './InterviewScheduler.css';

const InterviewScheduler = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [interviewOptions, setInterviewOptions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    initializeCalendar();
  }, []);

  const initializeCalendar = async () => {
    try {
      await googleCalendarService.initializeGapi();
      setIsSignedIn(googleCalendarService.isSignedIn);
    } catch (error) {
      setError('Failed to initialize Google Calendar. Please check your API configuration.');
      console.error('Calendar initialization error:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await googleCalendarService.signIn();
      setIsSignedIn(true);
      setError(null);
    } catch (error) {
      setError('Failed to sign in to Google Calendar');
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const findInterviewSlots = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const options = await googleCalendarService.findInterviewSlots(60); // 60-minute interviews
      setInterviewOptions(options);
      
      if (options.length === 0) {
        setError('No available interview slots found in the next 3 working days');
      }
    } catch (error) {
      setError('Failed to find interview slots: ' + error.message);
      console.error('Find slots error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotSelection = (dayIndex, slotIndex) => {
    const selectedOption = interviewOptions[dayIndex];
    const selectedSlotData = selectedOption.availableSlots[slotIndex];
    
    setSelectedSlot({
      date: selectedOption.date,
      slot: selectedSlotData,
      dayIndex,
      slotIndex
    });
  };

  const confirmInterview = () => {
    if (selectedSlot) {
      // Here you would typically create the calendar event
      // For now, we'll just show a confirmation
      alert(`Interview scheduled for ${googleCalendarService.formatDate(selectedSlot.date)} at ${selectedSlot.slot.formatted}`);
      setSelectedSlot(null);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="interview-scheduler">
        <div className="scheduler-header">
          <h2>Interview Scheduler</h2>
          <p>Connect to Google Calendar to find available interview slots</p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button 
          onClick={handleSignIn}
          disabled={isLoading}
          className="sign-in-button"
        >
          {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
        </button>
      </div>
    );
  }

  return (
    <div className="interview-scheduler">
      <div className="scheduler-header">
        <h2>Interview Scheduler</h2>
        <p>Find available interview slots in your calendar</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="scheduler-actions">
        <button 
          onClick={findInterviewSlots}
          disabled={isLoading}
          className="find-slots-button"
        >
          {isLoading ? 'Checking Calendar...' : 'Find Available Slots'}
        </button>
      </div>

      {interviewOptions.length > 0 && (
        <div className="interview-options">
          <h3>Available Interview Slots</h3>
          <div className="options-grid">
            {interviewOptions.map((option, dayIndex) => (
              <div key={dayIndex} className="day-option">
                <h4>{googleCalendarService.formatDate(option.date)}</h4>
                <div className="time-slots">
                  {option.availableSlots.map((slot, slotIndex) => (
                    <button
                      key={slotIndex}
                      onClick={() => handleSlotSelection(dayIndex, slotIndex)}
                      className={`time-slot ${
                        selectedSlot?.dayIndex === dayIndex && 
                        selectedSlot?.slotIndex === slotIndex ? 'selected' : ''
                      }`}
                    >
                      {slot.formatted}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="confirmation-panel">
          <h3>Confirm Interview</h3>
          <p>
            <strong>Date:</strong> {googleCalendarService.formatDate(selectedSlot.date)}
          </p>
          <p>
            <strong>Time:</strong> {selectedSlot.slot.formatted}
          </p>
          <div className="confirmation-actions">
            <button onClick={confirmInterview} className="confirm-button">
              Schedule Interview
            </button>
            <button 
              onClick={() => setSelectedSlot(null)} 
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewScheduler;