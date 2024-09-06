import React, { useEffect, useState } from 'react';

const Scrolling = () => {
  const [providerInfo, setProviderInfo] = useState([]);

  useEffect(() => {
    // Fetch provider information from the backend
    const fetchProviderInfo = async () => {
      try {
        const response = await fetch('https://mweb-assessment-backend.onrender.com/api/providers');
        const data = await response.json();
        setProviderInfo(data);
      } catch (error) {
        console.error('Error fetching provider information:', error);
      }
    };

    fetchProviderInfo();
  }, []); // Empty dependency array means this runs once when the component mounts

  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", width: "100%" }}>
      <div
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          animation: "scroll 25s linear infinite"
        }}
      >
        {providerInfo.map((provider, index) => (
          <img
            key={index}
            src={provider.url}
            alt={provider.name}
            style={{ 
              width: "100px", 
              height: "auto", 
              display: "inline-block", 
              marginRight: "150px" // Add gap between images
            }}
          />
        ))}
        {/* Duplicate the content to ensure a seamless scroll
        {providerInfo.map((provider, index) => (
          <img
            key={index + providerInfo.length}
            src={provider.url}
            alt={provider.name}
            style={{ 
              width: "100px", 
              height: "auto", 
              display: "inline-block", 
              marginRight: "40px" // Add gap between images
            }}
          />
        ))} */}
      </div>
    </div>
  );
};

export default Scrolling;
