import React, { useState, useEffect, useRef } from 'react';
import PropagateLoader from 'react-spinners/PropagateLoader'; // Import the loader
import Popup from './popup';

const FiberSelect = () => {
  const [selectedType, setSelectedType] = useState('');
  const [providerInfo, setProviderInfo] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState({});
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(''); // Default to Show All
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const productsRef = useRef(null); // Ref for the products container

  useEffect(() => {
    setIsLoading(true); // Start loading
    fetch('https://mweb-assessment-backend.onrender.com/api/providers')
      .then((response) => response.json())
      .then((data) => {
        setProviderInfo(data);
        setIsLoading(false); // Stop loading when data is fetched
      })
      .catch((error) => {
        console.error('Error fetching provider info:', error);
        setError('Failed to load provider information.');
        setIsLoading(false); // Stop loading even on error
      });
  }, []);

  useEffect(() => {
    const fetchProductsForSelectedProviders = async () => {
      const selectedProviderCodes = Object.keys(selectedProviders).filter(
        (name) => selectedProviders[name]
      );

      setProducts([]);
      setIsLoading(true); // Start loading when fetching products

      if (selectedProviderCodes.length > 0) {
        try {
          const allProviderProducts = await Promise.all(
            selectedProviderCodes.map((name) =>
              fetch(
                `https://mweb-assessment-backend.onrender.com/api/products/${name}`
              ).then((res) => {
                if (res.status === 404) {
                  throw new Error(
                    `No products available for this provider ${name}.`
                  );
                }
                return res.json();
              })
            )
          );

          const productsArray = allProviderProducts.flat();

          if (productsArray.length > 0) {
            const filteredProducts = productsArray.filter((product) => {
              const matchesPriceRange =
                !selectedPriceRange ||
                selectedPriceRange === 'Show All' ||
                (() => {
                  switch (selectedPriceRange) {
                    case 'R0 - R699':
                      return (
                        product.productRate >= 0 && product.productRate <= 699
                      );
                    case 'R700 - R999':
                      return (
                        product.productRate >= 700 && product.productRate <= 999
                      );
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
            const providerWithoutProducts = selectedProviderCodes.find(
              (name) =>
                !productsArray.some((product) => product.provider === name)
            );

            if (providerWithoutProducts) {
              setError(
                `No products available for this provider (${providerWithoutProducts}).`
              );
            }
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          setError(error.message || 'Failed to load products.');
        } finally {
          setIsLoading(false); // Stop loading when done
        }
      } else {
        setIsLoading(false); // Stop loading when no providers selected
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
    setSelectedProviders((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  const handlePriceRangeChange = (event) => {
    setSelectedPriceRange(event.target.value);
  };

  const filteredOptions = providerInfo.filter(
    (option) =>
      option &&
      option.code &&
      (selectedType === '' ||
        (selectedType === 'Free' && option.code !== 'vumareach') ||
        (selectedType === 'Prepaid' && option.code === 'vumareach'))
  );

  return (
    <div style={styles.container}>
      <div style={styles.selectContainer}>
        <label htmlFor="fiber-select" style={styles.label}>
          Select Fibre Campaign:
        </label>
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
        <h3 style={styles.priceLabel}>Filter by:</h3>
        <select
          value={selectedPriceRange}
          onChange={handlePriceRangeChange}
          style={styles.priceDropdown}
        >
          <option value="Show All">Show All</option>
          <option value="R0 - R699">R0 - R699</option>
          <option value="R700 - R999">R700 - R999</option>
          <option value="R1000+">R1000+</option>
        </select>
      </div>

      {isLoading ? (
        <div style={styles.loaderContainer}>
          <PropagateLoader color="#0ba3d1" /> {/* Display loader */}
        </div>
      ) : error ? (
        <Popup message={error} onClose={() => setError('')} />
      ) : null}

      <div style={styles.grid}>
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
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
            {products.map((product) => (
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
    border: '1px solid #0ba3d1cf',
    fontSize: '16px',
    outline: 'none',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#0ba3d1',
    fontWeight: '500',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2px',
    border: '1px solid #0ba3d1cf',
    borderRadius: '10px',
    boxShadow: '#282c34 0px 2px 4px',
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
    fontSize: '15px',
    textAlign: 'center',
    marginBottom: '10px'
  },
  checkbox: {
    marginRight: '8px',
  },
  noOptions: {
    textAlign: 'center',
    fontSize: '18px',
    color:'#e11414',
    fontWeight: '500'
  },
  priceFilter: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: '14px',
    marginBottom: '5px',
    fontWeight:'400'
  },
  priceDropdown: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #0ba3d1cf',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    width: '125px', // Adjust the width as needed
  },
  productsContainer: {
    marginTop: '20px',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
  },
  
};

export default FiberSelect;
