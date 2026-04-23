# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode (CRA dev server).\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm start`

Runs the **production server** (`server.js`) that serves the static build output from `build/`.

> Note: For local dev, use `npm run dev`. The `start` script is meant for production / App Platform.

### `npm test`

Launches the test runner.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## DigitalOcean App Platform deployment

This repo is set up to deploy to DigitalOcean App Platform directly from GitHub.

### What App Platform needs

- A non-interactive start command that runs a web server
- The server must bind to:
  - host: `0.0.0.0`
  - port: `process.env.PORT` (injected by DigitalOcean)

### How this repo works

- `npm run build` creates the production bundle in `build/`
- `npm start` runs `node server.js`, an Express server that:
  - serves static files from `build/`
  - falls back to `build/index.html` for SPA routes
  - listens on `0.0.0.0:$PORT`

### Procfile

A root-level `Procfile` is included to make the start command explicit:

- `web: npm run start`

### Typical App Platform configuration

- **Build Command:** `npm run build`
- **Run Command:** `npm run start`

### Local smoke test (production mode)

You can verify the production server locally by building and running with a custom port:

```bash
npm run build
PORT=8080 npm start
```

Then open: http://localhost:8080

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
