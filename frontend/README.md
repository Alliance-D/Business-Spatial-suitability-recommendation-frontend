# Spatial Suitability Frontend

React/Vite frontend for a spatial suitability recommendation system for salon location assessment in Kigali, Rwanda.

The frontend provides an interactive map interface where users can select a location, run a suitability assessment, and view factor-level results returned by the FastAPI backend.

## Tech Stack

* React
* Vite
* JavaScript
* Leaflet / React Leaflet
* Axios
* Recharts

## Project Structure

```text
frontend/
  public/
  src/
    components/
    pages/
    App.jsx
    App.css
    constants.js
    index.css
    main.jsx
  package.json
  package-lock.json
  vite.config.js
  index.html
  Dockerfile
  nginx.conf
```

## Requirements

Install the following before setup:

* Node.js
* npm
* Git

## Environment Setup

Install dependencies:

```powershell
npm install
```

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Do not commit `.env` to GitHub.

## Running Locally

Start the frontend development server:

```powershell
npm run dev
```

Open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

Make sure the backend is also running:

```text
http://localhost:8000
```

## Backend Connection

The frontend reads the backend URL from:

```env
VITE_API_BASE_URL
```

For local development:

```env
VITE_API_BASE_URL=http://localhost:8000
```

For deployment:

```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com
```

Do not add `/api/v1` in the environment variable if `src/constants.js` already appends the API route paths.

## Build for Production

Run:

```powershell
npm run build
```

The production build will be generated in:

```text
dist/
```

## Deployment on Render

Create a Render Static Site using this frontend repo.

Render settings:

```text
Build Command:
npm install && npm run build

Publish Directory:
dist
```

Environment variable:

```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com
```

After setting the environment variable, redeploy the static site.

## Notes

This frontend is part of a prototype spatial decision-support system. Results depend on the backend API and available spatial observation data.