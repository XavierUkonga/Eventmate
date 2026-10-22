# EventMate

EventMate is a full-stack event discovery and social networking application designed to help users discover events, connect with other users, and communicate through an integrated social platform.

## Features

- User registration and login
- JWT-based authentication
- User profile creation and editing
- Event discovery and event details
- User connections and profile matching
- Direct messaging
- Social posts and engagement
- Protected routes for authenticated users

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- JavaScript

### Backend
- Node.js
- Express
- JWT
- bcrypt
- REST APIs

### Development Tools
- Git
- GitHub
- npm

## Project Structure

```text
EventMate/
├── src/                 # React frontend
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── data/
├── backend/
│   └── src/
│       ├── routes/
│       ├── middleware/
│       ├── data/
│       └── utils/
├── public/
└── README.md
```

## Running the Project

### Frontend

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

### Backend

Navigate to the backend directory:

```bash
cd backend
```

Install backend dependencies:

```bash
npm install
```

Create a `.env` file based on `.env.example`.

Example:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret-key
```

Start the backend:

```bash
npm run dev
```

## Team

EventMate was developed as a collaborative software engineering project.

Contributors:
- Xavier Ukonga
- Alexis Parham
- Maitriben Patel
- Steven Dong

## My Contributions

I primarily worked on the backend development of EventMate.

My contributions included:

Built and maintained backend routes using Node.js and Express.

Implemented REST API functionality for core application features.

Worked on authentication and protected backend functionality using JWT and bcrypt.

Supported backend features related to users, events, messaging, profiles, and social interactions.

Tested and debugged API behavior while collaborating with the frontend team to integrate backend endpoints.

Used Git and GitHub to manage changes and collaborate with the development team.

## Future Improvements

- Google Maps integration
- Real-time messaging
- Improved event recommendations
- Expanded profile matching
- Production database integration
- Deployment of the frontend and backend