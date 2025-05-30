# 🦅 Aquila

**Aquila** is the frontend application of the PraetorAI platform. Built in React and Redux Toolkit, it provides a clean, interactive interface for managing projects and tasks with AI assistance. It integrates seamlessly with the Flask backend and uses JWT for user sessions.

## Key Features

- React + Redux-based SPA
- Secure login/register with JWT
- Project and task manager UI
- AI-powered task expansion and prioritization
- Dark mode and user customization

## Tech Stack

- React
- Redux Toolkit
- React Router
- Styled Components or Tailwind (optional)
- Firebase (optional, for hosting)

## Getting Started

1. Navigate to the frontend directory:

   ```bash
   cd aquila
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Start the development server:

   ```bash
   yarn start
   ```

4. Make sure the backend server (`Praetorium`) is running and configured correctly to allow CORS requests.

## Environment Variables

Create a `.env` file in the `aquila/` directory with the following:

```
REACT_APP_API_URL=http://localhost:5000
```

---
