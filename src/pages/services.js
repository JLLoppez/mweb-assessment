import React, { useState } from 'react';
import Scrolling from "../components/provider";
// import CampaignsList from "../components/campaigns";
import FiberSelect from "../components/types";
// import ProductFilter from "../components/products";
// import PriceRangeFilter from "../components/priceFilter";

const Services = React.forwardRef ((props, ref) => {
  
    const [selectedProviders, setSelectedProviders] = useState({});
//   const [selectedRanges, setSelectedRanges] = useState([]);

  const handleProviderSelection = (newSelectedProviders) => {
    setSelectedProviders(newSelectedProviders);
  };

//   const handlePriceRangeSelection = (newSelectedRanges) => {
//     setSelectedRanges(newSelectedRanges);
//   };

    return (
        <>
            <section className="what-we-offer"  id="services" ref={ref}>
                <div className="heading__fix u-center-text">
                <h3 className="heading-tertiary u-margin-bottom-small">Fibre Products</h3>
                </div>

                <h2 className="heading-secondary u-margin-bottom-small u-center-text">
                Select a fibre infrastructure provider below, browse the products available and complete a coverage search
                </h2>
                <div>
                    <Scrolling/>
                </div>
                {/* <CampaignsList/>               */}
                <FiberSelect
                     selectedProviders={selectedProviders}
                     onProviderChange={handleProviderSelection} 
                />
                {/* <PriceRangeFilter
                    selectedProviders={selectedProviders}
                    selectedRanges={selectedRanges}
                    onRangeChange={handlePriceRangeSelection}
                /> */}
            </section>
        </>
    );
});

export default Services;