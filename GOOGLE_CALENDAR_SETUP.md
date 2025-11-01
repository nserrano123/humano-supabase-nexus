# Google Calendar API Setup Guide

## Prerequisites

1. A Google account
2. Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "Recruitment Calendar")
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

## Step 3: Create Credentials

### API Key (for public data access)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Click "Restrict Key" and select "Google Calendar API"

### OAuth 2.0 Client ID (for user authentication)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name: "Recruitment Platform"
   - Add your email as developer contact
   - Add scopes: `../auth/calendar.readonly`
4. Choose "Web application" as application type
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (when deployed)
6. Copy the Client ID

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   REACT_APP_GOOGLE_API_KEY=your_api_key_here
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
   ```

## Step 5: Test the Integration

1. Start your development server:

   ```bash
   npm start
   ```

2. Open http://localhost:3000
3. Click "Connect Google Calendar"
4. Sign in with your Google account
5. Grant calendar permissions
6. Click "Find Available Slots"

## Features

The Interview Scheduler will:

- ✅ Check your Google Calendar for existing events
- ✅ Find available time slots in the next 3 working days
- ✅ Propose 3 interview options per day at preferred times:
  - 10:00 AM - 11:00 AM
  - 2:00 PM - 3:00 PM
  - 4:00 PM - 5:00 PM
- ✅ Allow selection and confirmation of interview slots
- ✅ Work within business hours (9 AM - 5 PM, Monday-Friday)

## Troubleshooting

### "API Key not valid" error

- Check that the API key is correctly set in `.env`
- Ensure the Google Calendar API is enabled
- Verify API key restrictions allow your domain

### "OAuth client not found" error

- Verify the Client ID is correct in `.env`
- Check authorized JavaScript origins include your domain
- Ensure OAuth consent screen is configured

### "Access blocked" error

- Complete OAuth consent screen configuration
- Add test users if app is in testing mode
- Verify scopes include calendar access

## Security Notes

- Never commit `.env` file to version control
- Use environment-specific credentials for production
- Consider implementing additional security measures for production use
