import { useEffect, useState } from "react";
import "./navbar.css";

import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [activeItem, setActiveItem] = useState("/");
  const naviaget = useNavigate();

  const handleClick = (item) => {
    setActiveItem(`/${item}`);
    naviaget(`/${item}`);
  };
  let location = useLocation();
  useEffect(() => {
    setActiveItem(location.pathname);
  }, [activeItem]);

  return (
    <>
      <div>{/* <ServiceRotate /> */}</div>
      <div className="navbar-section">
        <div
          className={`gray-100 flex  justify-center items-center flex-col p-2  ${
            activeItem === "/promotion" ? "active" : ""
          }`}
          onClick={() => handleClick("promotion")}
        >
          <div className="flex justify-center items-center ml-[5px]">
            {/* <RiHomeSmileLine className="text-2xl" /> */}
            {/* <MdHeartBroken
              className={`text-2xl  ${
                activeItem === "/promotion"
                  ? "active"
                  : "text-[#9ea2a8] "
              }`}
            /> */}
            <svg
              data-v-fb80cf49
              className={
                activeItem === "/promotion"
                  ? "svg-icon icon-p3_promotion_a"
                  : "svg-icon icon-p3_promotion"
              }
            >
              <use
                xlinkHref={
                  activeItem === "/promotion"
                    ? "#icon-p3_promotion_a"
                    : "#icon-p3_promotion"
                }
              />
            </svg>
          </div>
          <span
            className={`text-[11px] font-medium   ${
              activeItem === "/promotion" ? "text-white" : " text-[#9ea2a8] "
            }`}
          >
            Promotion
          </span>
        </div>
        <div
          className={`gray-100 flex  justify-center items-center flex-col p-2   ${
            activeItem === "/activity" ? "active" : ""
          } `}
          onClick={() => handleClick("activity")}
        >
          {/* <BiSolidGift
            className={`text-2xl ${
              activeItem === "/activity"
                ? "active"
                : "text-[#9ea2a8] "
            }`}
          /> */}
          <svg
            data-v-fb80cf49
            className={
              activeItem === "/activity"
                ? "svg-icon icon-p3_activity_a"
                : "svg-icon icon-p3_activity"
            }
          >
            <use
              xlinkHref={
                activeItem === "/activity"
                  ? "#icon-p3_activity_a"
                  : "#icon-p3_activity"
              }
            />
          </svg>

          <span
            className={`text-[11px] font-medium   ${
              activeItem === "/activity" ? "text-white" : " text-[#9ea2a8] "
            }`}
          >
            Activity
          </span>
        </div>

        <div
          onClick={() => handleClick("")}
          className={` flex  justify-center items-center flex-col p-2   ${
            activeItem === "/" ? "promotion" : "gray-100"
          } `}
        >
          <div className="nav-promotion">
            {/* <LiaGamepadSolid
              className={`text-2xl ${
                activeItem === "/" ? "text-black" : " text-black"
              }`}
            /> */}
            <svg data-v-fb80cf49 className="svg-icon icon-p3_home_a">
              <use xlinkHref="#icon-p3_home_a" />
            </svg>
          </div>
          <span
            className={`text-[11px] font-medium   ${
              activeItem === "/" ? "text-white" : ""
            }`}
          ></span>
        </div>

        <div
          className={`gray-100 flex  justify-center items-center flex-col p-2   ${
            activeItem === "/wallet" ? "active" : ""
          }`}
          onClick={() => handleClick("wallet")}
        >
          {/* <IoWallet
            className={`text-2xl ${
              activeItem === "/wallet"
                ? "active"
                : " text-[#9ea2a8] "
            }`}
          /> */}
          <svg
            data-v-fb80cf49
            className={
              activeItem === "/wallet"
                ? "svg-icon icon-p3_wallet"
                : "svg-icon icon-p3_wallet_a"
            }
          >
            <use
              xlinkHref={
                activeItem === "/wallet"
                  ? "#icon-p3_wallet_a"
                  : "#icon-p3_wallet"
              }
            />
          </svg>

          <span
            className={`text-[11px] font-medium   ${
              activeItem === "/wallet" ? "text-white" : "text-[#9ea2a8] "
            }`}
          >
            Wallet
          </span>
        </div>
        <div
          className={`gray-100 flex  justify-center items-center flex-col p-2   ${
            activeItem === "/main" ? "active" : ""
          }`}
          onClick={() => handleClick("main")}
        >
          {/* <FaUser
            className={`text-2xl text-[#9ea2a8] ${
              activeItem === "/main" ? "active" : ""
            }`}
          /> */}
          <svg
            data-v-fb80cf49
            className={
              activeItem === "/main"
                ? "svg-icon icon-p3_main_a"
                : "svg-icon icon-p3_main"
            }
          >
            <use
              xlinkHref={
                activeItem === "/main" ? "#icon-p3_main_a" : "#icon-p3_main"
              }
            />
          </svg>

          <span
            className={`text-[11px] font-medium   ${
              activeItem === "/main" ? "text-white" : "text-[#9ea2a8] "
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
