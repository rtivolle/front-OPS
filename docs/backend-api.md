### Backend API

- **Base URL (dev)**: `http://localhost:5000`
- **Health**: `GET /` → `200 OK` text "API is running..."
- **Auth**: JWT tokens are issued on successful registration/login. Tokens expire in 1 day. No routes currently require auth headers.
- **OpenAPI spec**: See `docs/openapi.yaml` (import into Swagger UI, Postman, or VS Code REST Client)

### Environment Variables

- **MONGO_URI**: MongoDB connection string
- **JWT_SECRET**: Secret used to sign JWTs
- **PORT**: Port for the Express server (default `5000`)

### Endpoints

#### POST `/api/auth/register`
- **Description**: Create a new user and return a JWT.
- **Body**
  ```json
  {
    "email": "user@example.com",
    "password": "string (min 6)"
  }
  ```
- **Responses**
  - `200 OK`
    ```json
    { "success": true, "token": "<jwt>" }
    ```
  - `400 Bad Request`
    ```json
    { "success": false, "error": "<message>" }
    ```
- **cURL**
  ```bash
  curl -X POST http://localhost:5000/api/auth/register \
    -H 'Content-Type: application/json' \
    -d '{"email":"user@example.com","password":"secret123"}'
  ```

#### POST `/api/auth/login`
- **Description**: Authenticate user and return a JWT.
- **Body**
  ```json
  {
    "email": "user@example.com",
    "password": "string"
  }
  ```
- **Responses**
  - `200 OK`
    ```json
    { "success": true, "token": "<jwt>" }
    ```
  - `400 Bad Request` or `401 Unauthorized`
    ```json
    { "success": false, "error": "<message>" }
    ```
- **cURL**
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"user@example.com","password":"secret123"}'
  ```

### Error Format

- All error responses follow:
  ```json
  { "success": false, "error": "<message>" }
  ```

### JWT Details

- Signed payload: `{ id: <userId> }`
- Algorithm and expiry are provided by `jsonwebtoken` with `expiresIn: '1d'`.
- Store the token client-side (e.g., `localStorage`) and include as needed in `Authorization: Bearer <token>` for future secured routes.

### Data Models

#### `User`
- **Schema fields**
  - `email: string` (required, unique, email format)
  - `password: string` (required, min length 6, not selected by default)
- **Hooks**
  - Pre-save: hashes `password` with bcrypt (10 salt rounds) when modified
- **Instance methods**
  - `matchPassword(enteredPassword: string): Promise<boolean>`

### Local Development

- Start server:
  ```bash
  cd /workspace/backend && npm install && npm run start
  ```
- Logs printed to stdout. Unhandled promise rejections trigger graceful shutdown.