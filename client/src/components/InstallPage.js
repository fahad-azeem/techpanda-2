import React, { useState } from 'react';
import './InstallPage.css';

function InstallPage({ setShop }) {
  const [shopDomain, setShopDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInstall = (e) => {
    e.preventDefault();
    setError('');
    
    if (!shopDomain) {
      setError('Please enter your shop domain');
      return;
    }

    let formattedShop = shopDomain.trim();
    if (!formattedShop.includes('.myshopify.com')) {
      if (!formattedShop.includes('.')) {
        formattedShop = `${formattedShop}.myshopify.com`;
      }
    }

    setLoading(true);
    setShop(formattedShop);
    
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth?shop=${formattedShop}`;
  };

  return (
    <div className="install-page">
      <div className="install-card">
        <h2>Install Shopify App</h2>
        <p>Enter your Shopify store domain to install the app</p>
        
        <form onSubmit={handleInstall}>
          <div className="form-group">
            <label htmlFor="shop">Shop Domain</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="shop"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="your-shop"
                disabled={loading}
              />
              <span className="domain-suffix">.myshopify.com</span>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="install-button" disabled={loading}>
            {loading ? 'Redirecting...' : 'Install App'}
          </button>
        </form>
        
        <div className="help-text">
          <p>Example: If your shop URL is <strong>my-store.myshopify.com</strong>, enter <strong>my-store</strong></p>
        </div>
      </div>
    </div>
  );
}

export default InstallPage;