import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AuthCallback.css';

function AuthCallback({ setIsAuthenticated, setShop }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      const shop = searchParams.get('shop');

      if (!shop) {
        setStatus('Authentication failed: Missing shop parameter');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      setShop(shop);
      
      try {
        setStatus('Verifying authentication...');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch(`/products?shop=${shop}`);
        
        if (response.ok) {
          setStatus('Authentication successful! Redirecting to products...');
          setIsAuthenticated(true);
          setTimeout(() => {
            navigate(`/products?shop=${shop}`);
          }, 1500);
        } else {
          setStatus('Authentication failed. Redirecting to install page...');
          setIsAuthenticated(false);
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('An error occurred. Redirecting...');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setIsAuthenticated, setShop]);

  return (
    <div className="auth-callback">
      <div className="auth-card">
        <div className="spinner"></div>
        <h2>{status}</h2>
        <p>Please wait while we complete the authentication process...</p>
      </div>
    </div>
  );
}

export default AuthCallback;