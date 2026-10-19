import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import LiveChatImg from "../../assets/liveChat.png";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { useSelector } from "react-redux";
import CustomeNavbar from "../../components/CustomeNavbar";

const ServiceCollection = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  

  return (
    <>
      <CustomeNavbar name="Customer service"/>
      <div>
        <img src={userInfo.logo} alt="" />
      </div>

      <div className="container-section">
        <Link
          className="flex justify-between items-center mt-2 bg-body p-3 py-4 rounded-lg"
          to="/main/CustomerService/ServiceCollection/problem"
        >
          <div className="flex items-center">
            <img src={LiveChatImg} className="w-8" alt="" />
            <span className="text-base gray-50 ms-2 font-sans font-medium">
              Self Service Recharge & Withdrawal problem
            </span>
          </div>
          <div className="flex items-center">
            <MdOutlineArrowForwardIos className="text-lg gray-100" />
          </div>
        </Link>

        <Link
          className="flex justify-between items-center mt-2 bg-body p-3 py-4 rounded-lg"
          to={userInfo?.telegram}
        >
          <div className="flex items-center">
            <img src={LiveChatImg} className="w-8" alt="" />
            <span className="text-base gray-50 ms-2 font-sans font-medium">
              Other Problem
            </span>
          </div>
          <div className="flex items-center">
            <MdOutlineArrowForwardIos className="text-lg gray-100" />
          </div>
        </Link>
      </div>
    </>
  );
};

export default ServiceCollection;
