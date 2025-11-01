# Project Structure

## Root Level Organization

```
/
├── src/                    # Main React application source
├── public/                 # Static assets and HTML template
├── infobip-elevenlab-*/    # Tutorial project with backend services
├── node_modules/           # Dependencies
└── package.json           # Main project configuration
```

## Main React Application (`/src`)

- **App.js** - Main application component
- **index.js** - React DOM rendering entry point
- **App.css** - Application-specific styles
- **index.css** - Global styles
- **App.test.js** - Component tests
- **setupTests.js** - Test configuration
- **reportWebVitals.js** - Performance monitoring setup

## Tutorial Project Structure

```
infobip-elevenlab-conversational-integration-tutorial/
├── projects/
│   ├── calls_backend/      # Express.js API server
│   │   ├── app.js         # Main server file
│   │   └── package.json   # Backend dependencies
│   └── ws_backend/         # WebSocket server
│       ├── app.js         # WebSocket handler
│       └── package.json   # WS dependencies
├── img/                   # Tutorial documentation images
└── README.MD              # Comprehensive integration guide
```

## File Naming Conventions

- **React Components**: PascalCase (App.js)
- **Stylesheets**: kebab-case or camelCase (.css files)
- **Backend Files**: lowercase (app.js)
- **Configuration**: lowercase (package.json)

## Key Configuration Files

- **package.json** - Dependencies and scripts for main React app
- **public/index.html** - HTML template
- **public/manifest.json** - PWA configuration
- **.gitignore** - Version control exclusions

## Development Workflow

1. Main React app runs on port 3000
2. Calls backend runs on port 3000 (separate process)
3. WebSocket backend runs on port 3500
4. Use ngrok for external API testing and webhooks

## Asset Organization

- Static assets in `/public` directory
- Component-specific styles co-located with components
- Tutorial images in dedicated `/img` folder
- Documentation at project root level
