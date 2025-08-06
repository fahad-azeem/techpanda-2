# Shopify React + Express App

A full-stack Shopify public app with React frontend and Express backend.

## Quick Start

1. Install dependencies:
```bash
npm install
cd client && npm install && cd ..
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your Shopify app credentials
```

3. Start ngrok:
```bash
ngrok http 3000
```

4. Update Shopify App Settings:
- App URL: https://your-ngrok-url.ngrok.io
- Redirect URL: https://your-ngrok-url.ngrok.io/auth/callback

5. Run the application:
```bash
npm run dev
```

## Features
- OAuth authentication flow
- Product listing with search
- Session persistence with SQLite
- Beautiful gradient UI
- Concurrent development setup