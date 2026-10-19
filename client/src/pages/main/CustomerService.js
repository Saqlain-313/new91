import React from "react";
import ServerBg from "../../assets/customerBg.png";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import LiveChatImg from "../../assets/liveChat.png";
import TelegramImg from "../../assets/telegram2.png";

import { MdOutlineArrowForwardIos } from "react-icons/md";
import { useSelector } from "react-redux";
import CustomeNavbar from "../../components/CustomeNavbar";
const CustomerService = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <>
      <CustomeNavbar name="Customer service" />
      <div className="blue-linear2">
        <img src={ServerBg} alt="" />
      </div>
      <div className="container-section">
        <Link
          className="flex justify-between items-center mt-2 bg-body p-3 py-4 rounded-lg"
          to="/main/CustomerService/ServiceCollection"
        >
          <div className="flex items-center">
            <img src={LiveChatImg} className="w-8" alt="" />
            <span className="text-base text-whites ms-2 font-sans font-medium">
              LiveChat
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
            <img src={TelegramImg} className="w-8" alt="" />
            <span className="text-base text-whites ms-2 font-sans font-medium">
              Telegram
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

export default CustomerService;
