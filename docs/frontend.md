### Frontend (React + Vite)

- **Dev server**: `npm run dev` (proxies `/api/*` → `http://localhost:5000`)
- **Routing**: `react-router-dom` with routes `/login` and `/register` (root `/` renders login)

### Components

#### `App` (default export)
- **Responsibility**: Sets up `Router`, navigation, and routes.
- **Routes**
  - `/` → `LoginPage`
  - `/login` → `LoginPage`
  - `/register` → `RegisterPage`
- **Usage**: Entry point; no props.

#### `LoginPage` (default export)
- **Props**: none
- **State**: `email`, `password`, `message`
- **Behavior**:
  - Submits `POST /api/auth/login` via `axios`
  - On success, stores `localStorage.authToken` and shows success message
  - On failure, shows error message from API
- **Minimal example**
  ```jsx
  import LoginPage from './pages/LoginPage';
  // Use in a Route: <Route path="/login" element={<LoginPage />} />
  ```
- **API example**
  ```js
  // Successful response
  { success: true, token: '<jwt>' }
  ```

#### `RegisterPage` (default export)
- **Props**: none
- **State**: `email`, `password`, `message`
- **Behavior**:
  - Submits `POST /api/auth/register` via `axios`
  - On success, shows confirmation message
  - On failure, shows error message from API
- **Minimal example**
  ```jsx
  import RegisterPage from './pages/RegisterPage';
  // Use in a Route: <Route path="/register" element={<RegisterPage />} />
  ```
- **API example**
  ```js
  // Successful response
  { success: true, token: '<jwt>' }
  ```

### Axios Base URL

- Calls use a relative path (`/api/...`). During development, Vite proxies requests as configured in `vite.config.js`.
- For production builds, configure your hosting/proxy (or set a base URL for axios):
  ```js
  import axios from 'axios';
  axios.defaults.baseURL = 'https://your-api.example.com';
  ```

### Running Locally

- Start backend:
  ```bash
  cd /workspace/backend && npm install && npm run start
  ```
- Start frontend:
  ```bash
  cd /workspace/frontend && npm install && npm run dev
  ```

### Storing Authentication

- The login flow stores the JWT in `localStorage` under the key `authToken`.
- Use the token for subsequent API calls when protected routes are introduced:
  ```js
  const token = localStorage.getItem('authToken');
  axios.get('/api/protected', { headers: { Authorization: `Bearer ${token}` } });
  ```