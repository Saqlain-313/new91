import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SmileImg from "../assets/smile.png";

import "./navbar.css";

const Navbar = () => {
  const [activeItem, setActiveItem] = useState("/");
  const [showPopup, setShowPopup] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  const naviaget = useNavigate();
  let location = useLocation();

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [activeItem]);

  // Normal navigation click
  const handleClick = (item) => {
    setActiveItem(item);
    naviaget(`/${item}`);
  };

  // Account tab click -> agar login nahi hai to popup, warna normal navigate
  const handleAccountClick = () => {
    if (!userInfo) {
      openPopup();
    } else {
      handleClick("main");
    }
  };

  const openPopup = () => {
    setShowPopup(true);
  };

  // Smooth slide-up animation trigger
  useEffect(() => {
    if (showPopup) {
      const t = setTimeout(() => setPopupVisible(true), 20);
      return () => clearTimeout(t);
    } else {
      setPopupVisible(false);
    }
  }, [showPopup]);

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPopup]);

  const closePopup = () => {
    setPopupVisible(false);
    setTimeout(() => setShowPopup(false), 350); // animation complete hone ka wait
  };

  const handleLoginNow = () => {
    closePopup();
    naviaget("/login"); // apna actual login route yahan daalein
  };

  return (
    <>
      {/* ================= EVENT REWARDS POPUP ================= */}
      {showPopup && (
        <div
          className={`fixed inset-0 flex items-end justify-center z-[2000] transition-colors duration-300 ${
            popupVisible
              ? "bg-black/55 pointer-events-auto"
              : "bg-black/0 pointer-events-none"
          }`}
          onClick={closePopup}
        >
          <div
            className={`font-sans relative w-full max-w-[395px] bg-white rounded-t-[22px] pt-14 pb-8 text-center transition-transform duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
              popupVisible ? "translate-y-0" : "translate-y-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow clipped separately, matching sheet's rounded corners */}
            <div className="absolute inset-0 rounded-t-[22px] overflow-hidden pointer-events-none z-0">
              <div className="absolute inset-0 rounded-t-[22px] overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-[280px] bg-gradient-to-b from-[#FDC7C7] via-[#FFE8E7] to-transparent"></div>
              </div>
            </div>

            {/* Gift image - ab wrapper se bahar hai, isliye upar overflow ho sakta hai */}
            <img
              className="absolute z-20 left-1/2 -translate-x-1/2 -top-16 h-[150px] w-auto"
              src="https://i.ibb.co/QFq7H0W1/gift.png"
              alt="gift"
            />

            <div className="relative z-10 mt-[50px]">
              <h2 className="flex items-center justify-center gap-2 text-2xl font-extrabold text-[#1a1a1a] mb-3">
                <span> Event Rewards </span>
              </h2>

              <p className="text-[15px] text-[#333] mb-6 leading-relaxed">
                Log in to participate in the{" "}
                <span className="text-[#fa6b6b] font-semibold">
                  event rewards
                </span>{" "}
                and unlock all 8 exclusive rewards
              </p>

              <button
                className="w-full py-3.5 border-none rounded-full bg-gradient-to-r from-[#F95B5B] to-[#FF9890] text-white font-bold text-base mb-4 cursor-pointer"
                onClick={handleLoginNow}
              >
                Log in now to participate
              </button>

              <button
                className="bg-transparent border-none text-[#333] text-sm cursor-pointer"
                onClick={closePopup}
              >
                Don't log in yet, continue browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SERVICE ICON ================= */}
      <div
        style={{
          position: "fixed",
          zIndex: 500,
        }}
        className="flex flex-col right-0 bottom-20"
      >
        {userInfo ? (
          <Link
            to={`https://h5support.chennai91.co/?token=${Cookies.get("auth")}`}
            style={{ display: "inline-block" }}
          >
            <img
              src="https://i.ibb.co/GfVXnKyb/smile.png"
              alt="Service"
              className="w-[70px] pe-3"
            />
          </Link>
        ) : (
          <div
            onClick={() => handleClick("main/CustomerService")}
            style={{ display: "inline-block" }}
          >
            <img src={SmileImg} alt="Service" className="w-[70px] pe-3" />
          </div>
        )}
      </div>

      {/* ================= BOTTOM NAVBAR ================= */}
      <div className="navbar-section">
        <div
          className={`flex justify-center items-center flex-col p-2 pb-5 ${
            activeItem === "/" || activeItem === "//" ? "active" : ""
          }`}
          onClick={() => handleClick("/")}
        >
          <svg
            data-v-cbfefb2b=""
            className={`size-6 ${
              activeItem === "/" || activeItem === "//"
                ? "svg-icon"
                : "svg-icons"
            }`}
          >
            <use href="#icon-home"></use>
          </svg>
          <span
            className={`text-[10px] font-medium ${
              activeItem === "/" || activeItem === "//"
                ? "text-[#F95959]"
                : "text-[#BEC6D4]"
            }`}
          >
            Home
          </span>
        </div>

        <div
          className={`flex justify-center items-center flex-col p-2 pb-5 ${
            activeItem === "/activity" ? "active" : ""
          }`}
          onClick={() => handleClick("activity")}
        >
          <svg
            data-v-cbfefb2b=""
            className={`size-6 ${
              activeItem === "/activity" ? "svg-icon" : "svg-icons"
            }`}
          >
            <use href="#icon-activity"></use>
          </svg>
          <span
            className={`text-[10px] font-medium ${
              activeItem === "/activity" ? "text-[#F95959]" : "text-[#BEC6D4]"
            }`}
          >
            Activity
          </span>
        </div>

        <div className="p-2 pb-4" onClick={() => handleClick("WheelSpin")}>
          <div className="nav-promotion relative flex flex-col items-center">
            <img
              src="https://i.ibb.co/PskczZng/wheel.png"
              alt=""
              className="relative"
            />
            <span
              className={`absolute top-14 text-[16px] font-bold ${
                activeItem === "/WheelSpin" ? "active" : "text-red-500"
              }`}
            >
              Get 500
            </span>
          </div>
        </div>

        <div
          className={`flex justify-center items-center flex-col p-2 pb-5 ${
            activeItem === "/promotion" ? "active" : ""
          }`}
          onClick={() => handleClick("promotion")}
        >
          <svg
            data-v-6ab3f23e
            className={`size-6 icon-promotion2 ${
              activeItem === "/promotion" ? "svg-icon" : "svg-icons"
            }`}
          >
            <use xlinkHref="#icon-promotion2" />
          </svg>
          <span
            className={`text-[10px] font-medium ${
              activeItem === "/promotion" ? "text-[#F95959]" : "text-[#BEC6D4]"
            }`}
          >
            Promotion
          </span>
        </div>

        {/* ACCOUNT TAB -> yahan special handler use ho raha hai */}
        <div
          className={`flex justify-center items-center flex-col p-2 pb-5 ${
            activeItem === "/main" ? "active" : ""
          }`}
          onClick={handleAccountClick}
        >
          <svg
            data-v-cbfefb2b=""
            className={`size-6 ${
              activeItem === "/main" ? "svg-icon" : "svg-icons"
            }`}
          >
            <use href="#icon-main"></use>
          </svg>
          <span
            className={`text-[10px] font-medium ${
              activeItem === "/main" ? "text-[#F95959]" : "text-[#BEC6D4]"
            }`}
          >
            Account
          </span>
        </div>
      </div>
    </>
  );
};

export default Navbar;
