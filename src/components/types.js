import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';

const FiberSelect = () => {
  const [selectedType, setSelectedType] = useState('');
  const [providerInfo, setProviderInfo] = useState([]);
  const [visibleItems, setVisibleItems] = useState(getInitialVisibleItems());
  const [showMore, setShowMore] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState({});
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  function getInitialVisibleItems() {
    const width = window.innerWidth;
    if (width >= 1024) return 5; // Desktop
    if (width >= 768) return 3;  // Tablet
    return 2; // Mobile
  }

  const priceFilters = [
    { label: 'R0 to R699', value: 'R0-699' },
    { label: 'R700 to R999', value: 'R700-999' },
    { label: 'R1000+', value: 'R1000+' }
  ];

  const [priceRange, setPriceRange] = useState(null);

  const handlePriceFilterChange = (event) => {
    setPriceRange(event.target.value);
  };

  const filteredProducts = products.filter(product => {
    if (priceRange === 'R0-699') {
      return product.productRate >= 0 && product.productRate <= 699;
    } else if (priceRange === 'R700-999') {
      return product.productRate >= 700 && product.productRate <= 999;
    } else if (priceRange === 'R1000+') {
      return product.productRate >= 1000;
    } else {
      return true; // If no filter is selected, show all products
    }
  });

  const providers = [
    "OpenServe",
    "Balwin",
    "Web Connect",
    "TT Connect",
    "Thinkspeed",
    "MFN NOVA",
    "Octotel",
    "Vodacom",
    "Lightstruck",
    "MFN",
    "Frogfoot Air",
    "ClearAccess",
    "Vumatel",
    "ZoomFibre",
    "Frogfoot",
    "Evotel"
  ];

  function getAdditionalItems() {
    const width = window.innerWidth;
    if (width >= 1024) return 5; // Desktop
    if (width >= 768) return 3;  // Tablet
    return 2; // Mobile
  }

  useEffect(() => {
    const handleResize = debounce(() => {
      setVisibleItems(getInitialVisibleItems());
    }, 300);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/providers')
      .then((response) => response.json())
      .then((data) => {
        setProviderInfo(data);
        setVisibleItems(getInitialVisibleItems());
      })
      .catch((error) => {
        console.error('Error fetching provider info:', error);
        setError('Failed to load provider information.');
      });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const responses = await Promise.all(
          Object.keys(selectedProviders).filter(code => selectedProviders[code]).map(code => 
            fetch(`http://localhost:5000/api/products/${code}`)
          )
        );
        const data = await Promise.all(responses.map(res => res.json()));
        setProducts(data.flat()); // Flatten array if necessary
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products.');
      }
    };

    fetchProducts();
  }, [selectedProviders]); // Update when `selectedProviders` changes

  const handleSelectChange = (event) => {
    setSelectedType(event.target.value);
  };

  const handleLoadMore = () => {
    setVisibleItems((prev) => prev + getAdditionalItems());
    if (providerInfo.length <= visibleItems + getAdditionalItems()) {
      setShowMore(false);
    }
  };

  const handleCheckboxChange = (code) => {
    setSelectedProviders(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const filteredOptions = providerInfo.filter(option =>
    selectedType === '' || (selectedType === 'Free' && option.code !== 'vumareach') || (selectedType === 'Prepaid' && option.code === 'vumareach')
  ).slice(0, visibleItems);

  return (
    <div style={styles.container}>
      <div style={styles.selectContainer}>
        <label htmlFor="fiber-select" style={styles.label}>Select Fibre Campaign:</label>
        <select
          id="fiber-select"
          style={styles.select}
          value={selectedType}
          onChange={handleSelectChange}
        >
          <option value="Free">FREE setup + router</option>
          <option value="Prepaid">Prepaid Fibre</option>
        </select>
        <h2 style={styles.h2}>Fibre Providers</h2>
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
              {selectedProviders[option.code] && (
                <div style={styles.productsContainer}>
                  <h3>Products:</h3>
                  <ul>
                    {filteredProducts.filter(product => product.providerCode === option.code).map(product => (
                      <li key={product.productCode}>{product.productName} - R{product.productRate}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <p style={styles.noOptions}>No options available</p>
        )}
      </div>
      {showMore && (
        <button
          onClick={handleLoadMore}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={isHovered ? { ...styles.loadMoreButton, ...styles.loadMoreButtonHovered } : styles.loadMoreButton}
        >
          Load More
        </button>
      )}

      <div>
        <h2>Filter by Price</h2>
        <div>
          {priceFilters.map(filter => (
            <label key={filter.value}>
              <input
                type="radio"
                name="priceFilter"
                value={filter.value}
                checked={priceRange === filter.value}
                onChange={handlePriceFilterChange}
              />
              {filter.label}
            </label>
          ))}
        </div>
      </div>
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
    color: 'red',
    textAlign: 'center',
    width: '100%',
  },
  loadMoreButton: {
    display: 'block',
    margin: '20px auto',
    padding: '10px 40px',
    fontSize: '16px',
    borderRadius: '10px',
    border: '1px solid #ccc',
    backgroundColor: '#f0f0f0',
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
  },
  loadMoreButtonHovered: {
    backgroundColor: '#ddd',
    color: '#333',
  },
  productsContainer: {
    marginTop: '10px',
    textAlign: 'left',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: '20px 0',
  },
};

export default FiberSelect;
