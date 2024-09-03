import React, { useEffect, useState } from 'react';

const CampaignsList = () => {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/campaigns');
        const data = await response.json();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchCampaigns();
  }, []); // Empty dependency array means this runs once when the component mounts

  return (
    <div>
      <h1>Campaigns</h1>
      <ul>
        {campaigns.map((campaign) => (
          <li key={campaign.code}>
            <h2>{campaign.name}</h2>
            <p>{campaign.description}</p>
            <ul>
              {campaign.promocodes.map((code, index) => (
                <li key={index}>{code}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CampaignsList;
