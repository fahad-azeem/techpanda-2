import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import InstallPage from './components/InstallPage';
import ProductsPage from './components/ProductsPage';
import AuthCallback from './components/AuthCallback';

function App() {
  const [shop, setShop] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shopParam = urlParams.get('shop');
    
    if (shopParam) {
      setShop(shopParam);
      checkSession(shopParam);
    }
  }, []);

  const checkSession = async (shopDomain) => {
    try {
      const response = await fetch(`/api/products?shop=${shopDomain}`);
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setIsAuthenticated(false);
    }
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Shopify App</h1>
          {shop && <p>Shop: {shop}</p>}
        </header>
        
        <Routes>
          <Route path="/" element={<InstallPage setShop={setShop} />} />
          <Route path="/auth/callback" element={<AuthCallback setIsAuthenticated={setIsAuthenticated} setShop={setShop} />} />
          <Route path="/products" element={
            isAuthenticated ? (
              <ProductsPage shop={shop} />
            ) : (
              <Navigate to="/" replace />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;