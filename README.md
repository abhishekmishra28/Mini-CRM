# Xeno Mini CRM

A full-stack AI-native CRM for fashion brands. Built with React + TypeScript (frontend) and Node.js + Express + MongoDB (backend), with AI powered by **OpenRouter**.

## Quick Start

### 1. Configure environment

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=<your MongoDB Atlas URI>
OPENAI_API_KEY=<your OpenRouter key — get one free at openrouter.ai/keys>
```

### 2. Start backend
```bash
cd server && npm install && npm run dev
```

### 3. Start frontend
```bash
cd client && npm install && npm run dev
```

Open **http://localhost:5173**

---

## Features

- **Dashboard** — Revenue, customer stats, campaign performance at a glance
- **Customers** — Browse 60 pre-seeded shoppers, view order history
- **Segments** — Build rule-based audiences manually or with AI ("customers who spent > ₹5000 in the last 30 days")
- **Campaigns** — Send across WhatsApp, SMS, Email, RCS — with real-time delivery simulation
- **Analytics** — Delivery rates, open rates, click rates, channel breakdown
- **AI Assistant** — Chat-based CRM copilot powered by OpenRouter

## Tech Stack

| | |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express 5 + Mongoose |
| Database | MongoDB Atlas |
| AI | OpenRouter API (via OpenAI SDK) |

## AI Models

The default model is `google/gemini-2.0-flash-exp:free` (free tier on OpenRouter).  
To switch, change `DEFAULT_MODEL` in `server/src/config/gemini.js`.  
Browse all models at [openrouter.ai/models](https://openrouter.ai/models).

## Project Structure

See full documentation in [documentation.md](./documentation.md) for API reference, data models, and architecture details.
