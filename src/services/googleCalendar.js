// Google Calendar API integration service
class GoogleCalendarService {
  constructor() {
    this.gapi = null;
    this.isSignedIn = false;
    this.calendarId = 'primary';
  }

  // Initialize Google API
  async initializeGapi() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
              clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
              scope: 'https://www.googleapis.com/auth/calendar.readonly'
            });
            
            this.gapi = window.gapi;
            this.isSignedIn = this.gapi.auth2.getAuthInstance().isSignedIn.get();
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } else {
        reject(new Error('Google API not loaded'));
      }
    });
  }

  // Sign in to Google
  async signIn() {
    if (!this.gapi) {
      await this.initializeGapi();
    }
    
    const authInstance = this.gapi.auth2.getAuthInstance();
    await authInstance.signIn();
    this.isSignedIn = true;
  }

  // Get events for a specific date range
  async getEvents(startDate, endDate) {
    if (!this.isSignedIn) {
      throw new Error('Not signed in to Google Calendar');
    }

    const response = await this.gapi.client.calendar.events.list({
      calendarId: this.calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    return response.result.items || [];
  }

  // Check if a time slot is available
  isTimeSlotAvailable(events, proposedStart, proposedEnd) {
    return !events.some(event => {
      if (!event.start || !event.end) return false;
      
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd = new Date(event.end.dateTime || event.end.date);
      
      // Check for overlap
      return (proposedStart < eventEnd && proposedEnd > eventStart);
    });
  }

  // Get next working days (Monday-Friday)
  getNextWorkingDays(count = 3) {
    const workingDays = [];
    const today = new Date();
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow

    while (workingDays.length < count) {
      const dayOfWeek = currentDate.getDay();
      // Monday = 1, Friday = 5
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDays.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }

  // Find available interview slots
  async findInterviewSlots(durationMinutes = 60) {
    const workingDays = this.getNextWorkingDays(3);
    const interviewOptions = [];

    for (const day of workingDays) {
      // Set working hours: 9 AM to 5 PM
      const dayStart = new Date(day);
      dayStart.setHours(9, 0, 0, 0);
      
      const dayEnd = new Date(day);
      dayEnd.setHours(17, 0, 0, 0);

      // Get events for this day
      const events = await this.getEvents(dayStart, dayEnd);

      // Find available slots
      const availableSlots = this.findAvailableSlots(
        events, 
        dayStart, 
        dayEnd, 
        durationMinutes
      );

      if (availableSlots.length > 0) {
        interviewOptions.push({
          date: day,
          availableSlots: availableSlots.slice(0, 3) // Top 3 slots per day
        });
      }
    }

    return interviewOptions;
  }

  // Find available time slots within a day
  findAvailableSlots(events, dayStart, dayEnd, durationMinutes) {
    const slots = [];
    const slotDuration = durationMinutes * 60 * 1000; // Convert to milliseconds
    
    // Preferred interview times (10 AM, 2 PM, 4 PM)
    const preferredTimes = [
      { hour: 10, minute: 0 },
      { hour: 14, minute: 0 },
      { hour: 16, minute: 0 }
    ];

    for (const time of preferredTimes) {
      const slotStart = new Date(dayStart);
      slotStart.setHours(time.hour, time.minute, 0, 0);
      
      const slotEnd = new Date(slotStart.getTime() + slotDuration);

      // Check if slot is within working hours and available
      if (slotEnd <= dayEnd && this.isTimeSlotAvailable(events, slotStart, slotEnd)) {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          formatted: this.formatTimeSlot(slotStart, slotEnd)
        });
      }
    }

    return slots;
  }

  // Format time slot for display
  formatTimeSlot(start, end) {
    const options = { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    };
    
    return `${start.toLocaleTimeString('en-US', options)} - ${end.toLocaleTimeString('en-US', options)}`;
  }

  // Format date for display
  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

const googleCalendarService = new GoogleCalendarService();
export default googleCalendarService;