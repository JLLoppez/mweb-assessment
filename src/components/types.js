import React, { useState, useEffect, useRef } from 'react';

const FiberSelect = () => {
  const [selectedType, setSelectedType] = useState('');
  const [providerInfo, setProviderInfo] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState({});
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('');

  const productsRef = useRef(null); // Ref for the products container

  useEffect(() => {
    fetch('https://mweb-assessment-backend.onrender.com/api/providers')
      .then((response) => response.json())
      .then((data) => {
        setProviderInfo(data);
      })
      .catch((error) => {
        console.error('Error fetching provider info:', error);
        setError('Failed to load provider information.');
      });
  }, []);

  useEffect(() => {
    const fetchProductsForSelectedProviders = async () => {
      const selectedProviderCodes = Object.keys(selectedProviders).filter(code => selectedProviders[code]);

      setProducts([]);
      setError('');

      if (selectedProviderCodes.length > 0) {
        try {
          const allProviderProducts = await Promise.all(
            selectedProviderCodes.map(code => 
              fetch(`https://mweb-assessment-backend.onrender.com/api/products/${code}`)
                .then(res => {
                  if (res.status === 404) {
                    throw new Error(`No products available for this provider ${code}.`);
                  }
                  return res.json();
                })
            )
          );

          const productsArray = allProviderProducts.flat();

          if (productsArray.length > 0) {
            const filteredProducts = productsArray.filter(product => {
              const matchesPriceRange = !selectedPriceRange || (() => {
                switch (selectedPriceRange) {
                  case 'R0 - R699':
                    return product.productRate >= 0 && product.productRate <= 699;
                  case 'R700 - R999':
                    return product.productRate >= 700 && product.productRate <= 999;
                  case 'R1000+':
                    return product.productRate >= 1000;
                  default:
                    return true;
                }
              })();

              return matchesPriceRange;
            });

            if (filteredProducts.length > 0) {
              setProducts(filteredProducts);
            } else {
              setError('No products found for the selected price range.');
            }
          } else {
            const providerWithoutProducts = selectedProviderCodes.find(code => 
              !productsArray.some(product => product.provider === code)
            );

            if (providerWithoutProducts) {
              setError(`No products available for this provider (${providerWithoutProducts}). Please select another one.`);
            }
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          setError(error.message || 'Failed to load products.');
        }
      }
    };

    fetchProductsForSelectedProviders();
  }, [selectedProviders, selectedPriceRange]);

  useEffect(() => {
    // Scroll to the products container if there are products
    if (products.length > 0 && productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [products]);

  const handleSelectChange = (event) => {
    const selectedType = event.target.value;
    setSelectedType(selectedType);
    setSelectedProviders({});
  };

  const handleCheckboxChange = (code) => {
    setSelectedProviders(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const handlePriceRangeChange = (event) => {
    setSelectedPriceRange(event.target.value);
  };

  const filteredOptions = providerInfo
    .filter(option => option && option.code && (
      selectedType === '' || 
      (selectedType === 'Free' && option.code !== 'vumareach') || 
      (selectedType === 'Prepaid' && option.code === 'vumareach')
    ));

  return (
    <div style={styles.container}>
      <div style={styles.selectContainer}>
        <label htmlFor="fiber-select" style={styles.label}>Select Fibre Campaign:</label>
        <select
          id="fiber-select"
          style={styles.select}
          value={selectedType || ''}
          onChange={handleSelectChange}
        >
          <option value="Free">FREE setup + router</option>
          <option value="Prepaid">Prepaid Fibre</option>
        </select>
        <h2 style={styles.h2}>Fibre Providers</h2>
      </div>

      <div style={styles.priceFilter}>
        <h3 style={styles.priceLabel}>Filter by</h3>
        <select 
          value={selectedPriceRange} 
          onChange={handlePriceRangeChange}
          style={styles.priceDropdown}
        >
          <option value="" disabled>Price</option>
          <option value="R0 - R699">R0 - R699</option>
          <option value="R700 - R999">R700 - R999</option>
          <option value="R1000+">R1000+</option>
        </select>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.grid}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map(option => (
            <div key={option.code} style={styles.card}>
              <img src={option.url} alt={option.name} style={styles.image} />
              <label style={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  style={styles.checkbox} 
                  checked={selectedProviders[option.code] || false}
                  onChange={() => handleCheckboxChange(option.code)} 
                />
                {option.name}
              </label>
            </div>
          ))
        ) : (
          <p style={styles.noOptions}>No options available</p>
        )}
      </div>
      
      {products.length > 0 && (
        <div style={styles.productsContainer} ref={productsRef}>
          <h2 style={styles.h2}>Products</h2>
          <div className="grid grid-nogutter">
            {products.map(product => (
              <div className="col" key={product.productCode}>
                <div className="text-center p-3 border-round-sm bg-primary font-bold">
                  {product.productName} - R{product.productRate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Responsive styles
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '900px',
    margin: '0 auto',
  },
  h2: {
    textAlign: 'left',
    margin: '10px'
  },
  selectContainer: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  label: {
    fontSize: '18px',
    marginRight: '10px',
  },
  select: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #ccc',
    fontSize: '16px',
    outline: 'none',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    border: '1px solid #eee',
    borderRadius: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s',
    overflow: 'hidden',
  },
  image: {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
    marginBottom: '10px',
  },
  checkboxLabel: {
    fontSize: '16px',
    textAlign: 'center',
  },
  checkbox: {
    marginRight: '8px',
  },
  noOptions: {
    textAlign: 'center',
    fontSize: '18px',
  },
  priceFilter: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: '18px',
    marginBottom: '5px',
  },
  priceDropdown: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid rgb(204, 204, 204)',
    fontSize: '16px',
    outline: 'none',
    cursor: 'pointer',
    width: '200px', // Adjust the width as needed
  },
  productsContainer: {
    marginTop: '20px',
  },
};

export default FiberSelect;
