# Technology Stack

## Frontend

- **React 19.1.0** - Main UI framework
- **Create React App** - Build tooling and development setup
- **React Testing Library** - Testing framework for React components
- **Web Vitals** - Performance monitoring

## Backend (Tutorial Projects)

- **Node.js** - Runtime environment
- **Express.js** - Web framework for REST APIs
- **WebSocket (ws)** - Real-time communication
- **Axios** - HTTP client for API calls

## External APIs & Services

- **Infobip Calls API** - Voice call orchestration and WebRTC
- **ElevenLabs API** - Conversational AI agents
- **ngrok** - Local development tunneling (for testing)

## Development Tools

- **ESLint** - Code linting with react-app configuration
- **Jest** - Testing framework (via react-scripts)
- **npm** - Package management

## Common Commands

### Main React Application

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Eject from Create React App (one-way operation)
npm run eject
```

### Backend Services (Tutorial)

```bash
# Calls backend
cd infobip-elevenlab-conversational-integration-tutorial/projects/calls_backend
npm start

# WebSocket backend
cd infobip-elevenlab-conversational-integration-tutorial/projects/ws_backend
npm start
```

### Development Setup

```bash
# Install dependencies
npm install

# Local tunneling for API testing
ngrok start --all
```

## Audio Specifications

- **Sample Rate**: 16kHz PCM
- **Packetization**: 640 bytes per chunk
- **Format**: Base64 encoded audio for WebSocket transmission
