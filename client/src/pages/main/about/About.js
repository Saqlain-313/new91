import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import AboutBg from "../../../assets/aboutBg.png";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import CAIcon from "../../../assets/copyinvitationcode.png";
import RCDIcon from "../../../assets/invitationrule.png";
import CustomeNavbar from "../../../components/CustomeNavbar";
const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <CustomeNavbar name="About us" bgClass="nav-bg" />

      <div>
        <img src={AboutBg} alt="" />
      </div>

      <div className="container-section">
        <Link
          to={"/main/About/AboutDetail"}
          className="flex justify-between items-center mt-2 bg-body p-3 py-4 rounded-lg"
        >
          <div className="flex items-center">
            <img src={CAIcon} className="w-6 text-[#F95959]" alt="" />
            <span className="text-base text-whites ms-2 font-sans ">
              Confidentiality Agreement
            </span>
          </div>
          <div className="flex items-center">
            <MdOutlineArrowForwardIos className="text-lg text-whites" />
          </div>
        </Link>
        <Link
          to={"/main/About/RiskDisclosure"}
          className="flex justify-between items-center mt-2 bg-body p-3 py-4 rounded-lg"
        >
          <div className="flex items-center">
            <img src={RCDIcon} className="w-6" alt="" />
            <span className="text-base text-whites ms-2 font-sans ">
              Risk Disclosure Agreement
            </span>
          </div>
          <div className="flex items-center">
            <MdOutlineArrowForwardIos className="text-lg text-whites" />
          </div>
        </Link>
      </div>
    </>
  );
};

export default About;
