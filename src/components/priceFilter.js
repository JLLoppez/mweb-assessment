import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PriceRangeFilter = () => {
  const [selectedRanges, setSelectedRanges] = useState([]);  // Ensuring selectedRanges is always an array
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedRanges.length === 0) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        const query = encodeURIComponent(selectedRanges.join(','));
        const response = await axios.get(`https://mweb-assessment-backend.onrender.com/api/products?priceRanges=${query}`);
        if (response.data.length === 0) {
          setError('No products available for this provider.');
        } else {
          setProducts(response.data);
          setError('');  // Clear error if products are found
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products.');
      }
    };

    fetchProducts();
  }, [selectedRanges]);

  const handleCheckboxChange = (range) => {
    setSelectedRanges((prevSelected) =>
      prevSelected.includes(range)
        ? prevSelected.filter((r) => r !== range)
        : [...prevSelected, range]
    );
  };

  return (
    <div className="price-filter-container">
      <div>
        <h3>Select Price Ranges</h3>
        <label>
          <input
            type="checkbox"
            checked={selectedRanges.includes('R0 - R699')}
            onChange={() => handleCheckboxChange('R0 - R699')}
          />
          R0 - R699
        </label>
        <label>
          <input
            type="checkbox"
            checked={selectedRanges.includes('R700 - R999')}
            onChange={() => handleCheckboxChange('R700 - R999')}
          />
          R700 - R999
        </label>
        <label>
          <input
            type="checkbox"
            checked={selectedRanges.includes('R1000+')}
            onChange={() => handleCheckboxChange('R1000+')}
          />
          R1000+
        </label>
      </div>

      <div className="product-list">
        <h3>Filtered Products</h3>
        {error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <ul>
            {products.map((product) => (
              <li key={product.productCode}>
                {product.productName} - R{product.productRate}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PriceRangeFilter;
