import React from "react";
import { useSelector } from "react-redux";

import CustomeNavbar from "../../../components/CustomeNavbar";

const ConfidentialityAgreement = () => {
  const { bannergetData } = useSelector((state) => state.user);

  return (
    <>
    
       <CustomeNavbar name="Confidentiality Agreement"/>

      <div className="container-section mt-5 p-3">
        <p className="mb-3 text-sm text-black">
          This Privacy Policy describes Our policies and procedures on the
          collection, use and disclosure of Your information when You use the
          Service and tells You about your privacy rights and the law protects
          You.  
        </p>
        <p className="fs-sm text-black">
          Interpretation and Definitions <br />
          Interpretation
        </p>
        <p className="text-sm text-black">
          The words of which the initial letter is capitalized have meanings
          defined under the following conditions.
        </p>
        <p className="text-sm text-black">
          The following definitions shall have the same meaning regardless of
          whether they appear in singular or in plural.
        </p>
        <p className="text-sm text-black">
          Definitions <br />
          For the purposes of this Privacy Policy:
        </p>
        <p className="text-sm text-black">
          You means the individual accessing or using the Service, or the
          company, or other legal entity on behalf of which such individual is
          accessing or using the Service, as applicable.
        </p>
        <p className="text-sm text-black">
          <b>Company</b>(referred to as either "the Company", "We","Us" or "our"
          in this Agreement) refers to {bannergetData?.gameall?.name}.
        </p>
        <p className="text-sm text-black">
          <b>Affiliate</b> means an entity that controls, is controlled by or is
          under common control with a party where "control" means owenrship of
          50% or more of the shres, equity interest or other securities entitled
          to vote for election of directors or other managing authority.
          <br />
          <b>Account</b> means a unique account created for you to access our
          Service or parts of our Service. <br />
          <b>Website</b> refers to{" "}
          <span className="text-blue-700">{bannergetData?.gameall?.name}</span>{" "}
          accessible from{" "}
          <span className="text-blue-700">{bannergetData?.gameall?.name}</span>{" "}
          <br />
          <b>Service</b> refers to the Website. <br />
          <b>Country</b> refers to; Dhaka, Bangaladesh <br />
          <b>Servic Provider</b> means any natural or legal person who processes
          the data on behalf of the Company. It refers to third-party companies
          or individuals employed by the Company to facilitate the Service, to
          provide the Service on behalf of the Company, to perform services
          related to the Service is used.
        </p>
      </div>
    </>
  );
};

export default ConfidentialityAgreement;
