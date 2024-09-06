import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';

const FiberSelect = () => {
  const [selectedType, setSelectedType] = useState('');
  const [providerInfo, setProviderInfo] = useState([]);
  const [visibleItems, setVisibleItems] = useState(getInitialVisibleItems());
  const [showMore, setShowMore] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState({});
  const [error, setError] = useState('');

  // Get initial number of visible items based on screen size
  function getInitialVisibleItems() {
    const width = window.innerWidth;
    if (width >= 1024) return 5; // Desktop
    if (width >= 768) return 3;  // Tablet
    return 2; // Mobile
  }

  // Calculate additional items to show on 'Load More'
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

  // Fetch providers
  useEffect(() => {
    fetch('http://localhost:5000/api/providers')
      .then((response) => response.json())
      .then((data) => {
        setProviderInfo(data);
        setVisibleItems(getInitialVisibleItems());
        setShowMore(data.length > getInitialVisibleItems()); // Show "Load More" only if more providers exist
      })
      .catch((error) => {
        console.error('Error fetching provider info:', error);
        setError('Failed to load provider information.');
      });
  }, []);

  const handleSelectChange = (event) => {
    setSelectedType(event.target.value);
    setSelectedProviders({}); // Reset provider selection when switching between Free and Prepaid
  };

  const handleLoadMore = () => {
    const newVisibleItems = visibleItems + getAdditionalItems();
    setVisibleItems(newVisibleItems);
    
    // Hide the "Load More" button when all providers are visible
    if (newVisibleItems >= providerInfo.length) {
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
          value={selectedType || ''}  
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
            </div>
          ))
        ) : (
          <p style={styles.noOptions}>No options available</p>
        )}
      </div>
      {showMore && selectedType === 'Free' && (
        <button
          onClick={handleLoadMore}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={isHovered ? { ...styles.loadMoreButton, ...styles.loadMoreButtonHovered } : styles.loadMoreButton}
        >
          Load More
        </button>
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
  error: {
    color: 'red',
    textAlign: 'center',
    margin: '20px 0',
  },
};

export default FiberSelect;
