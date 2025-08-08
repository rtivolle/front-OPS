### Project Documentation

- **Backend API**: See `docs/backend-api.md`
- **Frontend (React)**: See `docs/frontend.md`

### Quickstart

- **Prerequisites**
  - **Node.js**: v18+
  - **MongoDB**: a running instance with a connection URI

- **Environment**
  - Create `/workspace/backend/.env` with:
    ```
    MONGO_URI=mongodb://localhost:27017/your-db
    JWT_SECRET=replace-with-a-strong-secret
    PORT=5000
    ```

- **Start Backend**
  ```bash
  cd /workspace/backend && npm install && npm run start
  ```

- **Start Frontend**
  ```bash
  cd /workspace/frontend && npm install && npm run dev
  ```
  - Dev server proxies API requests from `/api/*` to `http://localhost:5000`.

### Repository Structure

- `backend/`: Express server, Mongoose models, auth routes
- `frontend/`: React + Vite app with login and registration pages
- `docs/`: Documentation files