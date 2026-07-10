# Todo App

A simple todo app with a React frontend and Express + SQLite backend.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)

## Setup

**Backend**

```bash
cd backend
npm install
npm run db:push
npm run db:generate
```

Copy `.env.example` to `.env` in the `backend` folder before `db:push`.

**Frontend**

```bash
cd frontend
npm install
```

## Run

Start the backend (port 5000):

```bash
cd backend
npm run dev
```

In a second terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).
