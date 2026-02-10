# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Environment Setup

Copy `.env.example` to `.env` and fill in your Firebase configuration:

```bash
cp .env.example .env
```

### API Base URL Configuration

For **development**, leave `VITE_API_BASE_URL` empty to use the Vite proxy configuration.

For **production**, set `VITE_API_BASE_URL` to your backend API URL:
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Authentication Features

The application includes Firebase authentication with the following enhancements:

- **Automatic Token Refresh**: Firebase ID tokens expire after one hour. The application automatically refreshes tokens when a 401 Unauthorized response is received from the API.
- **Error Handling**: Comprehensive error handling for login, registration, and logout operations with user-friendly error messages.
- **Environment-Specific Configuration**: API base URL can be configured via environment variables for different deployment environments.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
