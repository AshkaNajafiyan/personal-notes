# Personal Notes

A full-stack personal notes application with user accounts, JWT authentication, and per-user note management.

The backend is an Express API backed by MongoDB/Mongoose. The frontend is a Vite React app with routes for login, registration, listing notes, creating notes, editing notes, searching notes, and switching between light and dark themes.

## Features

- User registration and login
- JWT-protected notes API
- Password hashing with bcrypt
- Create, read, update, and delete notes
- Search notes by title or content
- Store tags on notes
- Paginated notes list
- Frontend auth token storage in `localStorage`
- Light/dark theme toggle

## Tech Stack

Backend:

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens
- bcrypt
- dotenv

Frontend:

- React
- Vite
- React Router
- Tailwind CSS/Vite plugin

## Project Structure

```text
.
├── server.js                         # Express API entry point
├── middleware/
│   └── auth.js                       # JWT auth middleware
├── models/
│   ├── Notes.js                      # Note schema
│   └── User.js                       # User schema and password helpers
├── personal-notes-frontend/
│   ├── src/
│   │   ├── api/                      # Frontend API clients
│   │   ├── components/               # Shared UI components
│   │   ├── pages/                    # Route pages
│   │   ├── App.jsx                   # Frontend routing and theme state
│   │   └── main.jsx                  # React entry point
│   └── package.json
├── package.json                      # Backend scripts and dependencies
└── test.http                         # Manual API request scratch file
```

## Prerequisites

- Node.js
- npm
- MongoDB connection string, either local or hosted

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/personal-notes
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
```

Optional frontend environment file:

```env
# personal-notes-frontend/.env
VITE_API_BASE_URL=http://localhost:8000
```

If `VITE_API_BASE_URL` is not set, the frontend sends requests to relative `/api/...` paths. For the default local setup with the backend on port `8000` and Vite on port `5173`, set `VITE_API_BASE_URL=http://localhost:8000`.

## Installation

Install backend dependencies from the root:

```bash
npm install
```

Install frontend dependencies:

```bash
npm install --prefix personal-notes-frontend
```

## Running Locally

Start the backend only:

```bash
npm run back
```

Start the frontend only:

```bash
npm run front
```

Start both backend and frontend together:

```bash
npm run full
```

Default local URLs:

- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:5173`

## Available Scripts

Root scripts:

- `npm start`: run the Express server with Node
- `npm run back`: run the Express server with nodemon
- `npm run front`: run the Vite dev server from `personal-notes-frontend`
- `npm run full`: run backend and frontend together with concurrently

Frontend scripts:

- `npm run dev --prefix personal-notes-frontend`: start Vite
- `npm run build --prefix personal-notes-frontend`: build production frontend assets
- `npm run lint --prefix personal-notes-frontend`: run ESLint
- `npm run preview --prefix personal-notes-frontend`: preview the production build

## API Overview

Health and auth metadata:

- `GET /`: API health message
- `GET /api/auth`: auth API information

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`

Notes:

- `GET /api/notes?page=1&limit=10`
- `POST /api/notes`
- `GET /api/notes/search?q=query`
- `GET /api/notes/search?tag=tag-name`
- `GET /api/notes/:id`
- `PUT /api/notes/:id`
- `DELETE /api/notes/:id`

Protected note routes require an authorization header:

```http
Authorization: Bearer <jwt-token>
```

Example register request:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ashkan","email":"ashkan@example.com","password":"password123"}'
```

Example login request:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ashkan@example.com","password":"password123"}'
```

Example create note request:

```bash
curl -X POST http://localhost:8000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"title":"First note","content":"Remember this.","tags":["personal"]}'
```

## Data Models

User:

- `username`: unique string
- `email`: unique string
- `password`: hashed string
- `createdAt` / `updatedAt`

Note:

- `title`: required string
- `content`: required string
- `tags`: string array
- `user`: owning user ID
- `createdAt` / `updatedAt`

## Notes

- The backend defaults to `PORT=8000`.
- The backend defaults `JWT_SECRET` to `verysecretkey` if not provided. Set `JWT_SECRET` in `.env` for any non-throwaway environment.
- `CLIENT_ORIGIN` can contain a comma-separated list of allowed frontend origins.
- `node_modules` and frontend build output should normally not be committed to source control.
