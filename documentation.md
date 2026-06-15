# Xeno Mini CRM — Project Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup & Running](#setup--running)
5. [Environment Variables](#environment-variables)
6. [Backend API Reference](#backend-api-reference)
7. [AI Integration (OpenRouter)](#ai-integration-openrouter)
8. [Frontend Architecture](#frontend-architecture)
9. [Data Models](#data-models)

---

## Overview

Xeno Mini CRM is a full-stack customer relationship management system for a fashion brand. It lets marketing teams:

- Browse and search **customers** with their order history
- Build **segments** (rule-based audience groups) manually or using AI
- Create and launch **campaigns** across WhatsApp, SMS, Email, and RCS
- Track **analytics** — delivery rates, open rates, click rates, and revenue
- Chat with an **AI assistant** powered by OpenRouter

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express 5 + MongoDB + Mongoose |
| AI | OpenRouter API (via OpenAI SDK as drop-in) |
| Database | MongoDB Atlas (cloud) |

---

## Project Structure

```
ai-native-mini-crm-development/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                   # One file per page
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── Segments.tsx
│   │   │   ├── Campaigns.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── AIAssistant.tsx
│   │   ├── hooks/                   # Data-fetching hooks (React Query style)
│   │   │   ├── useDashboard.ts
│   │   │   ├── useCustomers.ts
│   │   │   ├── useSegments.ts
│   │   │   └── useCampaigns.ts
│   │   ├── services/api/            # Axios API client modules
│   │   │   ├── api.ts               # Base axios instance (baseURL: localhost:5000/api)
│   │   │   ├── customers.api.ts
│   │   │   ├── segments.api.ts
│   │   │   ├── campaigns.api.ts
│   │   │   ├── analytics.api.ts
│   │   │   └── ai.api.ts
│   │   ├── components/
│   │   │   └── Layout.tsx
│   │   └── types/                   # Shared TypeScript interfaces
│
└── server/                          # Express backend
    ├── server.js                    # Entry point — dotenv + DB connect + listen
    ├── .env                         # Environment variables (see below)
    └── src/
        ├── app.js                   # Express app, CORS, route mounting
        ├── config/
        │   ├── db.js                # Mongoose connection
        │   └── gemini.js            # OpenRouter client (lazy init)
        ├── models/                  # Mongoose schemas
        │   ├── Customer.js
        │   ├── Order.js
        │   ├── Segment.js
        │   ├── Campaign.js
        │   └── Communication.js
        ├── controllers/             # Thin HTTP handlers
        │   ├── customer.controller.js
        │   ├── segment.controller.js
        │   ├── campaign.controller.js
        │   ├── analytics.controller.js
        │   └── ai.controller.js
        ├── services/                # Business logic
        │   ├── segment.service.js
        │   ├── campaign.service.js   # Background delivery simulation
        │   ├── analytics.service.js
        │   └── ai.service.js        # OpenRouter AI functions
        ├── routes/
        │   ├── customer.routes.js
        │   ├── segment.routes.js
        │   ├── campaign.routes.js
        │   ├── analytics.routes.js
        │   └── ai.routes.js
        └── utils/
            ├── asyncHandler.js
            ├── apiResponse.js
            └── seedData.js          # Seeds 60 sample customers on first start
```

---

## Setup & Running

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure environment

Edit `server/.env` (already created):

```env
PORT=5000
MONGO_URI=<your MongoDB Atlas connection string>
OPENAI_API_KEY=<your OpenRouter API key>
```

### 3. Start the backend

```bash
cd server
npm run dev      # uses nodemon for hot-reload
```

You should see:
```
✅ OpenRouter AI client initialized successfully
MongoDB connected
Server running on PORT : 5000
```

### 4. Start the frontend

```bash
cd client
npm run dev
```

Open **http://localhost:5173**

---

## Environment Variables

All environment variables live in `server/.env`. The frontend has no secrets.

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Port the Express server listens on (default: 5000) |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `OPENAI_API_KEY` | Yes | Your **OpenRouter** API key (`sk-or-v1-...`) — get one free at [openrouter.ai/keys](https://openrouter.ai/keys) |

> **Note:** Despite the name `OPENAI_API_KEY`, this is an **OpenRouter** key. The OpenAI SDK is used as a drop-in client pointed at `https://openrouter.ai/api/v1`.

---

## Backend API Reference

All responses follow this envelope:
```json
{ "statusCode": 200, "data": { ... }, "message": "...", "success": true }
```

### Customers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customers` | List all customers (with search/filter via query params) |
| `GET` | `/api/customers/:id` | Get single customer |
| `GET` | `/api/customers/:id/orders` | Get customer's order history |

### Segments

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/segments` | List all segments |
| `POST` | `/api/segments` | Create a new segment |
| `PUT` | `/api/segments/:id` | Update a segment |
| `DELETE` | `/api/segments/:id` | Delete a segment |
| `POST` | `/api/segments/preview` | Preview customer count without saving |

### Campaigns

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/campaigns` | List all campaigns |
| `POST` | `/api/campaigns` | Create a new campaign (status: `draft`) |
| `PUT` | `/api/campaigns/:id` | Update a campaign |
| `DELETE` | `/api/campaigns/:id` | Delete a campaign |
| `POST` | `/api/campaigns/:id/send` | Launch campaign (triggers background delivery) |
| `GET` | `/api/campaigns/:id/communications` | Get delivery logs for a campaign |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics` | Full dashboard analytics (customers, revenue, campaign stats) |
| `GET` | `/api/analytics/dashboard` | Alias for the above |

### AI

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `POST` | `/api/ai/chat` | `{ prompt, context }` | Chat with the AI assistant |
| `POST` | `/api/ai/generate-segment` | `{ prompt }` | Generate segment JSON from natural language |
| `POST` | `/api/ai/generate-message` | `{ prompt }` | Generate a campaign message |
| `POST` | `/api/ai/insights` | — | Get AI-generated business insights |

---

## AI Integration (OpenRouter)

### How It Works

The AI layer uses the **OpenAI SDK pointed at the OpenRouter API** — this gives access to hundreds of models (GPT-4o, Claude 3.5, Gemini, Llama, etc.) through a single endpoint, with automatic fallbacks.

**File:** `server/src/config/gemini.js` (kept the filename for backward compat)

```js
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,  // OpenRouter key
});
```

**Current model:** `google/gemini-2.0-flash-exp:free` — a free-tier model on OpenRouter. To switch models, change `DEFAULT_MODEL` in `server/src/config/gemini.js`.

### Lazy Initialization

The client is initialized on the **first API call**, not at module load time. This guarantees `dotenv` has already populated `process.env` before the key is read — avoiding subtle startup race conditions.

### Fallback Behaviour

Every AI function has a graceful fallback:
- If the key is missing → helpful navigation hints
- If the API returns an error (rate limit, network) → friendly error message, no server crash

### AI Features

| Feature | Endpoint | Prompt Pattern |
|---|---|---|
| **Chat Assistant** | `/api/ai/chat` | Freeform conversation with CRM context injected as system prompt |
| **Segment Builder** | `/api/ai/generate-segment` | "Customers who haven't ordered in 3 months and spent over ₹5000" |
| **Message Generator** | `/api/ai/generate-message` | "WhatsApp message for summer sale, friendly tone" |
| **Insights** | `/api/ai/insights` | Auto-analyzes current customer and campaign data |

### Switching Models

To use a different model (e.g., Claude or GPT-4o), change `DEFAULT_MODEL` in `server/src/config/gemini.js`:

```js
// Free options on OpenRouter:
const DEFAULT_MODEL = "google/gemini-2.0-flash-exp:free";
const DEFAULT_MODEL = "meta-llama/llama-3.1-8b-instruct:free";
const DEFAULT_MODEL = "mistralai/mistral-7b-instruct:free";

// Paid options (billed per token):
const DEFAULT_MODEL = "openai/gpt-4o";
const DEFAULT_MODEL = "anthropic/claude-3-5-sonnet";
```

Browse all available models at [openrouter.ai/models](https://openrouter.ai/models).

---

## Frontend Architecture

### API Layer (`client/src/services/api/`)

Each domain has its own API module:

```ts
// Example: ai.api.ts
export const aiApi = {
  chat: (prompt, context?) => api.post('/ai/chat', { prompt, context }).then(res => res.data.data),
  generateSegment: (prompt) => api.post('/ai/generate-segment', { prompt }).then(res => res.data.data),
  generateMessage: (prompt) => api.post('/ai/generate-message', { prompt }).then(res => res.data.data.response),
  getInsights: () => api.post('/ai/insights').then(res => res.data.data.response),
};
```

### Custom Hooks (`client/src/hooks/`)

Each page uses a custom hook for data fetching:

```ts
// useDashboard — polls every 5 seconds for real-time campaign updates
const { analytics, loading } = useDashboard();

// useSegments — includes createSegment, updateSegment, deleteSegment
const { segments, createSegment, loading } = useSegments();

// useCampaigns — includes sendCampaign, useCampaignCommunications
const { campaigns, sendCampaign } = useCampaigns();
```

### Page → Hook → API → Backend Flow

```
Page component
  └── Custom hook (useState + useEffect)
        └── API module (axios)
              └── Express route
                    └── Controller
                          └── Service (business logic)
                                └── Mongoose model / OpenRouter
```

---

## Data Models

### Customer
```
name, email, phone, city, tags[], total_spent, order_count,
first_order_date, last_order_date, createdAt
```

### Order
```
customer (ref), amount, items[], status, createdAt
```

### Segment
```
name, description, conditions[], operator (AND|OR),
customer_count, ai_generated, createdAt
```

### Campaign
```
name, message, channel (whatsapp|sms|email|rcs),
segment (ref), status (draft|sending|completed),
total_sent, delivered, opened, clicked, failed,
sent_at, createdAt
```

### Communication
```
campaign (ref), customer (ref), status (queued|delivered|opened|clicked|failed),
channel, message, sent_at, delivered_at, opened_at, clicked_at
```
