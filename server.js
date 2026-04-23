// Minimal production server for Create React App build output.
// Binds to 0.0.0.0 and process.env.PORT (required by many PaaS, including DigitalOcean App Platform).

const express = require('express');
const path = require('path');

const app = express();

const buildPath = path.join(__dirname, 'build');

// Serve static assets from the React build
app.use(express.static(buildPath));

// SPA fallback: for any route that isn't a static asset, return index.html
// Express 5 uses a newer path-to-regexp that doesn't accept the plain "*" string.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const port = Number.parseInt(process.env.PORT, 10) || 3000;
const host = '0.0.0.0';

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://${host}:${port}`);
});
