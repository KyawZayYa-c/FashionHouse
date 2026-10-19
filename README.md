# Fashion House - E-commerce Website

## Project Overview
Fashion House is a full-stack clothing e-commerce website built with React.js + Vite on the frontend and Node.js + Express.js + MongoDB on the backend.

## Directory Structure
```
fashion-house/
├── frontend/          # React + Vite frontend
│   └── ... (see frontend/README.md)
│
├── backend/           # Node.js + Express.js backend
│   └── ... (see backend/README.md)
│
├── .gitignore         # Root git ignore
├── package.json       # Root package.json with scripts
└── README.md          # This file
```

## Available Scripts
Run from the root directory (`fashion-house/`):

- `npm run start:all` - Starts both frontend and backend concurrently
- `npm run start:frontend` - Starts only the frontend (Vite dev server)
- `npm run start:backend` - Starts only the backend (Express server)
- `npm run build:frontend` - Builds the frontend for production
- `npm run build:backend` - Builds the backend (no-op for JS)

## Development
1. Install dependencies: `npm install`
2. Set up environment variables (see `.env.example` files)
3. Ensure MongoDB is running
4. Start: `npm run start:all`
5. Frontend: http://localhost:5173
6. Backend API: http://localhost:5000/api

## Architecture
- **Frontend**: React Router DOM for routing, Axios for API calls, Tailwind CSS for styling
- **Backend**: Express.js with Mongoose ODM, REST API architecture, centralized error handling
- **Database**: MongoDB with Mongoose schemas (products, categories, users, orders)
- **API**: /api/health health check endpoint, future endpoints under /api/products, /api/categories, etc.