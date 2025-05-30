# PraetorAI

**PraetorAI** is an AI-first project management and productivity platform designed to help users break down complex projects into manageable tasks. It integrates AI assistance at every step to help with task expansion, prioritization, and exporting to shareable formats. The backend (Praetorium) and frontend (Aquila) are structured for clean modularity, with Minerva serving as the Postgres-based database.

## Features

- AI-assisted project and task management
- JWT-based user authentication
- Project and task saving
- File export for free-tier users (TXT, PDF)
- Clean modular backend (Flask) and frontend (React)
- PostgreSQL database with structured schemas

## Technologies Used

- Python, Flask (Praetorium)
- React, Redux Toolkit (Aquila)
- PostgreSQL (Minerva)
- JWT for secure auth
- Firebase Hosting (optional for frontend)
- Docker (planned)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/TJLSmith0831/praetorai.git
   cd praetorai
   ```

2. Set up the backend:

   - Create a `.env` file in `praetorium/` with your Flask config.
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```

3. Set up the frontend:

   ```bash
   cd aquila
   yarn install
   yarn start
   ```

4. Run database migrations and set up tables via PgAdmin.

## Roadmap

- AI agents for automatic project decomposition
- Jira and Slack integration
- Premium tier with persistent cloud storage

---
