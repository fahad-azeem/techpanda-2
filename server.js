const express = require('express');
const path = require('path');
const { shopifyApi, LATEST_API_VERSION, Session, RestClient } = require('@shopify/shopify-api');
const { SQLiteSessionStorage } = require('@shopify/shopify-app-session-storage-sqlite');
require('@shopify/shopify-api/adapters/node');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const sessionStorage = new SQLiteSessionStorage('./sessions.sqlite');
const knownSessions = new Map();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['read_products', 'write_products', 'read_orders', 'write_orders'],
  hostName: process.env.HOST.replace(/^https:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
  sessionStorage,
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.use(express.json());

app.get('/auth', async (req, res) => {
  const shop = req.query.shop;

  if (!shop) return res.status(400).send('Missing shop parameter ?shop=your-shop.myshopify.com');

  try {
    await shopify.auth.begin({
      shop,
      callbackPath: '/auth/callback',
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });

    // 🚫 DO NOT call res.redirect() or res.send() here — it's already sent
  } catch (e) {
    console.error('❌ Auth start error:', e);
    res.status(500).send('Auth initiation failed');
  }
});


app.get('/auth/callback', async (req, res) => {
  try {
    const session__ = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    console.log('✅ Auth successful:', session__);
    
    const session_ = JSON.stringify(session__, null, 2);
    const data = JSON.parse(session_);
    
    if (data.session.shop && data.session.id) {
      knownSessions.set(data.session.shop, data);
      console.log('🧠 Stored session for:', data.session.shop);
    }

    const redirectUrl = process.env.NODE_ENV === 'production' 
      ? `/products?shop=${data.session.shop}`
      : `http://localhost:5173/auth/callback?shop=${data.session.shop}`;
    
    res.redirect(redirectUrl);
  } catch (e) {
    console.error('❌ Auth failed:', e);
    res.status(500).send('Authentication failed');
  }
});

app.get('/products', async (req, res) => {
  const shop = req.query.shop;
  const sessionId = knownSessions.get(shop);
  
  if (!shop) {
    return res.status(400).send('Missing shop parameter');
  }

  console.log('🔍 Sessions found---------------:', sessionId);
  if (!sessionId) {
    return res.status(401).send('Unauthorized – session not found');
  }

  const session = new Session(sessionId.session);
  console.log('🔍 Sessions found:', session);

  try {
    const client = new shopify.clients.Rest({ session });
    const products = await client.get({ path: 'products' });
    res.json(products.body.products);
  } catch (e) {
    console.error('❌ Failed to fetch products:', e);
    res.status(500).send('Failed to fetch products');
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  app.use(express.static('public'));
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📱 React app should be running at http://localhost:3001`);
    console.log(`⚠️  Make sure to run 'npm run dev' to start both servers concurrently`);
  }
});