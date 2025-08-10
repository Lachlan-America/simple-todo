# 🚀 Building a Smarter, Secure To-Do List with AI Integration
Over the last couple of weeks, I built a Next.js to-do app with some solid AI-powered features, including:
- AI-based Categorization & Summarization of tasks using OpenAI’s GPT API
- Smooth UI with category filtering and a dynamic “typing out” summary experience
- Google Authentication to restrict access to legit users only
- Intelligent debounce + batch processing to reduce API calls and protect tokens
- Server-side rate limiting with Upstash Redis to prevent abuse & reduce costs
- Unit tests covering key functionality (always room for more!)

## 🔑 How I protected my API tokens & controlled costs:
- Rate limiting on categorization and summarization endpoints (e.g., max 5 categorization calls/min, 1 summary/5 min) via Upstash Redis
- Batching and debouncing on the client side — instead of firing a request every time a todo is added, I collect multiple todos for a few seconds and send one request to the API
- Caching user-specific data using hashed emails so tokens and requests are tied to authenticated users — preventing anonymous spam
- Handling API errors and gracefully retrying requests with backoff — to avoid wasted calls
- Google OAuth integration to ensure requests come from real users, not bots

## ⚖️ Tradeoffs & decisions I made
- Real-time vs cost: Balancing immediate categorization with batching to reduce tokens. I accepted slight delay (~3 seconds debounce) for better cost control
- Security vs simplicity: Decided to rely on Google OAuth and rate limiting instead of IP whitelisting for ease of use, since it’s a personal app
- Client-side vs server-side state: Used React context and hooks carefully to avoid excessive renders and keep auth info synced without leaking sensitive data
- Error handling: Instead of failing silently, I added user feedback with spinners and retry logic for a smooth UX

## What’s next?
- Adding IP-range restrictions and Helmet security headers to harden the API
- Expanding unit & integration tests for higher confidence
- Potentially exploring token usage analytics to fine-tune rate limits

## Why this matters?
Developing with an eye on cost efficiency and real user security is essential when building AI-powered apps that use paid APIs. 
This project is a practical example of how to integrate AI while responsibly managing usage and user trust.
