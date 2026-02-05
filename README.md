# Front-OPS Application

A full-stack authentication application with React frontend and Express.js backend.

## Project Structure

```
front-OPS/
├── frontend/          # React + Vite frontend
├── backend/           # Express.js + MongoDB backend
├── README.md          # This file
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure secret key for JWT tokens
   - `PORT`: Server port (optional, defaults to 5000)

5. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Features

- User registration with email validation
- User login with JWT authentication
- Password hashing with bcrypt
- CORS enabled for development
- Input validation and error handling
- Responsive React frontend with routing

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /` - Health check endpoint

## Development

### Linting and Building

Frontend:
```bash
cd frontend
npm run lint    # Run ESLint
npm run build   # Build for production
```

### Project Dependencies

Backend:
- Express.js - Web framework
- Mongoose - MongoDB object modeling
- bcryptjs - Password hashing
- jsonwebtoken - JWT token generation
- cors - Cross-origin resource sharing
- dotenv - Environment variable management

Frontend:
- React - UI library
- React Router DOM - Client-side routing
- Axios - HTTP client
- Vite - Build tool and dev server

## Notes

- The backend runs on port 5000 by default
- The frontend dev server runs on port 5173
- Make sure MongoDB is running before starting the backend
- The frontend is configured to proxy API requests to the backend during development