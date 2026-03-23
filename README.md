<<<<<<< HEAD
# The Daily Press — NYT-Style News Website

A full-stack news aggregation platform built with Next.js, Node.js/Express, Supabase, and the New York Times API.

## Project Structure

```
newspaper/
├── frontend/    ← Next.js 14 App Router + Tailwind CSS
├── backend/     ← Node.js + Express REST API
└── tasks/       ← Planning docs
```

## Quick Start

### 1. Setup Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `backend/schema.sql` in the Supabase SQL Editor
3. Get your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

### 2. Get NYT API Key

Register at [developer.nytimes.com](https://developer.nytimes.com) and create an app to get your API key.

### 3. Backend

```bash
cd backend
# Fill in your keys in .env
npm run dev       # starts on http://localhost:4000
```

### 4. Frontend

```bash
cd frontend
npm run dev       # starts on http://localhost:3000
```

## Features

- 📰 NYT-style newspaper layout
- 🔄 Auto-sync articles from New York Times API (every 15 min)
- 🔍 Full-text search
- 📂 Category filtering
- 💬 Comments (auth required)
- ❤️ Likes (auth required)
- 🔖 Bookmarks (auth required)
- 🔐 JWT authentication with role-based access
- 🛠️ Admin dashboard (articles, categories, users, comments)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (httpOnly cookies) |
| News Data | New York Times API |

## Default Admin Setup

After registering, manually set `role = 'admin'` in the Supabase `users` table for your account.
=======
# Pogess
>>>>>>> d9c1f1e703c9ea637ab4b8824d0733f07d5b5ad3
