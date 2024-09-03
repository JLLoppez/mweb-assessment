import React from "react";
import Scrolling from "../components/provider";
// import CampaignsList from "../components/campaigns";
import FiberSelect from "../components/types";
import ProductFilter from "../components/products";

const Services = React.forwardRef ((props, ref) => {
  
   

    return (
        <>
            <section className="what-we-offer"  id="services" ref={ref}>
                <div className="heading__fix u-center-text">
                <h3 className="heading-tertiary u-margin-bottom-small">Fibre Products</h3>
                </div>

                <h2 className="heading-secondary u-margin-bottom-small u-center-text">
                Select a fibre infrastructure provider bellow, browser the products available and complete a coverage search
                </h2>
                <div>
                    <Scrolling/>
                </div>
                {/* <CampaignsList/>               */}
                <FiberSelect/>
            </section>
        </>
    );
});

export default Services;