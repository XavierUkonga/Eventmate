# EventMate Backend

Standalone backend for the EventMate frontend and project documents.

## Run

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API runs at `http://localhost:4000/api`.

## Main Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/profile/me`
- `PUT /api/profile/me`
- `GET /api/events`
- `GET /api/events/:eventId`
- `POST /api/events/:eventId/attendance`
- `GET /api/matches/recommendations`
- `POST /api/matches/request`
- `POST /api/matches/:matchId/accept`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/messages/:userId`
- `POST /api/messages/:userId`

Authenticated routes require:

```http
Authorization: Bearer <token>
```
