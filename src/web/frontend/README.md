# Wolt website

The React website uses the same Express API and MongoDB database as the mobile app.

## Run with Docker

Follow the [project README](../../../README.md) from the repository root. Compose builds the website and serves it through Node at `http://localhost:3000`.

## Local development

Follow the [local development guide](../../../wiki/run.md#local-development) to start MongoDB, C++ and the API first. In this directory, run `npm ci`, then start React on port `3001`; the API uses `3000`.

PowerShell:

```powershell
$env:PORT = '3001'
$env:REACT_APP_API_BASE_URL = 'http://localhost:3000'
npm start
```

Linux/macOS:

```bash
PORT=3001 REACT_APP_API_BASE_URL=http://localhost:3000 npm start
```

Open `http://localhost:3001`. For a production build, clear `REACT_APP_API_BASE_URL` before running `npm run build`; the built website then calls the API at the same origin.

See the [application walkthrough](../../../wiki/README.md) for registration, restaurant and menu management, cart and order flows.
