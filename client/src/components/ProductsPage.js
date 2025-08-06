import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductsPage.css';

function ProductsPage({ shop }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (shop) {
      fetchProducts();
    }
  }, [shop]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/products?shop=${shop}`);
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.status === 401 
        ? 'Session expired. Please reinstall the app.' 
        : 'Failed to fetch products. Please try again.');
      setLoading(false);
      
      if (err.response?.status === 401) {
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (variant) => {
    if (!variant || !variant.price) return 'N/A';
    return `$${parseFloat(variant.price).toFixed(2)}`;
  };

  const getProductImage = (product) => {
    if (product.image && product.image.src) {
      return product.image.src;
    } else if (product.images && product.images.length > 0) {
      return product.images[0].src;
    }
    return 'https://via.placeholder.com/250x250?text=No+Image';
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={fetchProducts} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Products ({products.length})</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={fetchProducts} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>{searchTerm ? 'No products found matching your search.' : 'No products available.'}</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={getProductImage(product)} alt={product.title} />
                {product.status === 'active' && (
                  <span className="status-badge active">Active</span>
                )}
                {product.status === 'draft' && (
                  <span className="status-badge draft">Draft</span>
                )}
              </div>
              <div className="product-details">
                <h3 className="product-title">{product.title}</h3>
                <p className="product-vendor">{product.vendor || 'No vendor'}</p>
                <p className="product-type">{product.product_type || 'No type'}</p>
                <div className="product-price">
                  {product.variants && product.variants.length > 0 ? (
                    <>
                      <span className="price">{formatPrice(product.variants[0])}</span>
                      {product.variants.length > 1 && (
                        <span className="variants-count">
                          +{product.variants.length - 1} variants
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="price">No variants</span>
                  )}
                </div>
                <div className="product-inventory">
                  {product.variants && product.variants[0] && (
                    <span className="inventory">
                      Stock: {product.variants[0].inventory_quantity || 0}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsPage;