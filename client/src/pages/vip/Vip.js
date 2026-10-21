import { useEffect, useRef, useState } from "react";

import { BsDatabaseFill } from "react-icons/bs";
import { IoDiamondSharp } from "react-icons/io5";
import { RiVipDiamondFill } from "react-icons/ri";
import Wallet from "../../assets/balance.png";
import MRewards from "../../assets/coince.png";
import Rate from "../../assets/rate.png";
import Rewards from "../../assets/rewards.png";

import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "./vip.css";

// Import all VIP images and backgrounds
import vip1 from "../../assets/1-1fca7935.png";
import vip11 from "../../assets/1-d951dc6d.png";
import vip10 from "../../assets/10-0eaf39a0.png";
import vip22 from "../../assets/2-5df32e87.png";
import vip2 from "../../assets/2-fcf77958.png";
import vip3 from "../../assets/3-9cf04b7e.png";
import vip4 from "../../assets/4-a4cfd018.png";
import vip5 from "../../assets/5-89e9b349.png";
import vip6 from "../../assets/6-05959c7c.png";
import vip7 from "../../assets/7-a50aebe0.png";
import vip8 from "../../assets/8-8cbed392.png";
import vip9 from "../../assets/9-63365227.png";
import vipBg1 from "../../assets/bg1-7ff97a99.png";
import vipBg10 from "../../assets/bg10-76abb4b7.png";
import vipBg2 from "../../assets/bg2-ee7fbf5e.png";
import vipBg3 from "../../assets/bg3-96f1cdae.png";
import vipBg4 from "../../assets/bg4-c3caf0f8.png";
import vipBg5 from "../../assets/bg5-e2132369.png";
import vipBg6 from "../../assets/bg6-8b5d1b4f.png";
import vipBg7 from "../../assets/bg7-535312da.png";
import vipBg8 from "../../assets/bg8-8bdc102c.png";
import vipBg9 from "../../assets/bg9-74d6723d.png";

import { Crown } from "lucide-react"; // Only Crown is used from lucide-react in the new welfare section
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CustomeNavbar from "../../components/CustomeNavbar";
import ServiceRotate from "../../components/ServiceRotate";
import {
  invitationBonus,
  vipLevel,
  vipsectionData,
} from "../../store/reducer/activityReducer";
import { AvatarData, VIPImg } from "../main/AvatarData"; // Assuming VIPImg is correctly mapped 0-indexed or 1-indexed as per VIP levels
import VIPCard from "./VIPCard";

const Vip = () => {
  const [activeRule, setActiveRule] = useState(1);
  const { userInfo } = useSelector((state) => state.auth);
  const { vipLevelData } = useSelector((state) => state.activity);

  const dispatch = useDispatch();
  // Renamed 'count' to 'currentVipIndex' to better reflect its purpose with the slider
  const [currentVipIndex, setCurrentVipIndex] = useState(0); // Initialize to 0 for the first VIP level (VIP 1)
  const [exp, setExp] = useState(0); // User's current experience points
  const [vipData, setVipData] = useState([]); // VIP level data (amount needed for each level, benefits)

  const [daysLeft, setDaysLeft] = useState(0);
  const [hoursLeft, setHoursLeft] = useState(0);

  const sliderRef = useRef(null); // Ref for the slider to control it programmatically

  useEffect(() => {
    const currentDate = new Date();
    // Get the last day of the current month
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0, // Setting day to 0 gets the last day of the previous month, so Month+1 and Day 0 gets last day of current month
    );

    const timeDiff = lastDayOfMonth.getTime() - currentDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const hoursDiff = Math.floor(
      (timeDiff % (1000 * 3600 * 24)) / (1000 * 3600),
    );

    setDaysLeft(daysDiff);
    setHoursLeft(hoursDiff);
  }, []);

  // VIP Level definitions
  // Ensure `maxProgress` is correctly mapped from `vipData` based on the level.
  const levels = [
    {
      level: 1,
      // progress: exp, // This should reflect the user's current EXP towards the *next* level
      // maxProgress: vipData[0]?.amount, // This will be set dynamically in the VIPCard
      bgColor: "#889ebe",
      vipImage: vip1,
      iconImage: vip11,
      bgImage: vipBg1,
      track: "#647a9a",
    },
    {
      level: 2,
      bgColor: "#e2984e",
      vipImage: vip2,
      iconImage: vip22,
      bgImage: vipBg2,
      track: "#d57c26",
    },
    {
      level: 3,
      bgColor: "#ff7878",
      vipImage: vip3,
      iconImage: vip22,
      bgImage: vipBg3,
      track: "#ef5b5b",
    },
    {
      level: 4,
      bgColor: "#48c7f0",
      vipImage: vip4,
      iconImage: vip22,
      bgImage: vipBg4,
      track: "#32b6e8",
    },
    {
      level: 5,
      bgColor: "#ef82d5",
      vipImage: vip5,
      iconImage: vip22,
      bgImage: vipBg5,
      track: "#ea69ca",
    },
    {
      level: 6,
      bgColor: "#46c188",
      vipImage: vip6,
      iconImage: vip22,
      bgImage: vipBg6,
      track: "#1eb18b",
    },
    {
      level: 7,
      bgColor: "#41ac46",
      vipImage: vip7,
      iconImage: vip22,
      bgImage: vipBg7,
      track: "#137b48",
    },
    {
      level: 8,
      bgColor: "#4a9ded",
      vipImage: vip8,
      iconImage: vip22,
      bgImage: vipBg8,
      track: "#215dce",
    },
    {
      level: 9,
      bgColor: "#b068f0",
      vipImage: vip9,
      iconImage: vip22,
      bgImage: vipBg9,
      track: "#742cef",
    },
    {
      level: 10,
      bgColor: "#f49c3b",
      vipImage: vip10,
      iconImage: vip22,
      bgImage: vipBg10,
      track: "#e46f1a",
    },
  ];

  const settings = {
    dots: false,
    infinite: false, // Set to false so it doesn't loop unnecessarily
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    arrows: false,
    centerPadding: "20px",
    afterChange: (current) => setCurrentVipIndex(current), // Update currentVipIndex when slide changes
  };

  useEffect(() => {
    dispatch(invitationBonus()); // Dispatch this if needed for other parts of the app

    // Fetch user's current experience points
    dispatch(vipLevel()).then((res) => {
      setExp(res.payload.levels); // Assuming res.payload.levels is the current experience
      // If res.payload.levels represents the user's *current VIP level*,
      // then you might want to set the initial slider position here:
      // sliderRef.current.slickGoTo(res.payload.levels - 1); // Adjust for 0-indexed array
    });

    // Fetch VIP section data (amounts needed for each level, benefits)
    dispatch(vipsectionData()).then((res) => {
      setVipData(res.payload.data);
      // After fetching vipData, if userInfo?.vip_level is available,
      // set the slider to the user's current VIP level.
      if (userInfo?.vip_level && sliderRef.current) {
        // VIP levels are typically 1-indexed, so adjust for 0-indexed array
        sliderRef.current.slickGoTo(userInfo.vip_level - 1);
        setCurrentVipIndex(userInfo.vip_level - 1);
      }
    });

    window.scrollTo(0, 0);
  }, [dispatch, userInfo?.vip_level]); // Add userInfo?.vip_level to dependency array

  // Calculate the current VIP level data for displaying benefits
  // Use currentVipIndex to get the correct VIP level's benefits
  const currentLevelBenefits = vipData?.find(
    (item) => item.id === levels[currentVipIndex]?.level,
  );

  return (
    <>
      <CustomeNavbar name="VIP" />
      <ServiceRotate />
      <div className="nav-bg py-5 pb-10">
        <div className="container-section">
          <div className="flex items-center">
            <img
              src={AvatarData[userInfo?.userPhoto]}
              alt=""
              className="w-20 rounded-full h-20"
            />
            <div className="ms-2">
              <h3 className="heaing-h3 flex items-center text-xl">
                {" "}
                <img
                  src={VIPImg[userInfo?.vip_level]}
                  alt=""
                  className="w-16"
                />
              </h3>
              <p className="text-sm mt-1">{userInfo?.name_user}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-section relative top-[-20px]">
        <div className="flex items-stretch justify-between gap-2">
          <div className="w-[48%] bg-popup-nav flex flex-col justify-center items-center py-4 rounded-md">
            <p className="text-sm font-bold color-blue">
              {Math.floor(exp)} EXP
            </p>
            <p className="text-sm gray-text">My experience</p>
          </div>
          <div className="w-[48%] bg-popup-nav flex flex-col justify-center items-center py-4 rounded-md">
            <p className="text-sm gray-text">
              <span className="text-white text-xl font-bold">
                {daysLeft + 2}
              </span>{" "}
              Days
            </p>
            <p className="text-sm gray-text">Payout time</p>
          </div>
        </div>
      </div>

      <div className="container-section">
        <p className="border border-gray-400 py-1 rounded-md fs-sm gray-text text-center">
          VIP level rewards are settled at 2:00 am on the 1st every month
        </p>

        <div className="m-auto mt-3 w-[100%] overflow-x-hidden">
          {Array.isArray(levels) && levels.length > 0 ? (
            <Slider {...settings} ref={sliderRef}>
              {levels.map((vip, i) => {
                // Dynamically get maxProgress for the current VIP level
                const currentVipLevelData = vipData.find(
                  (data) => data.id === vip.level,
                );
                return (
                  <div key={i} className="px-2">
                    <VIPCard
                      level={vip?.level ?? 0}
                      progress={exp ?? 0} // Pass the user's current experience
                      maxProgress={currentVipLevelData?.amount ?? 100} // Use amount from vipData
                      bgColor={vip?.bgColor ?? "#fff"}
                      vipImage={vip?.vipImage ?? ""}
                      iconImage={vip?.iconImage ?? ""}
                      bgImage={vip?.bgImage ?? ""}
                      track={vip?.track ?? ""}
                      userVipLevel={userInfo?.vip_level}
                      className="mx-auto h-[220px] w-[400px] rounded-xl shadow-md"
                      style={{
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundImage: `url(${vip?.bgImage ?? ""})`,
                      }}
                    />
                  </div>
                );
              })}
            </Slider>
          ) : (
            <p className="text-center text-gray-500">No VIP data available.</p>
          )}
        </div>

        {/* Display benefits for the currently active VIP level in the slider */}
        {currentLevelBenefits && (
          <div className="nav-bg p-3 mt-4">
            <div className="flex items-center ">
              <span>
                <IoDiamondSharp className="color-l text-xl" />
              </span>
              <h3 className="heading-h3 text-whites ms-1 font-medium">
                VIP{currentLevelBenefits.id} Benefits level
              </h3>
            </div>
            <hr className="border-color-slat" />
            <div className="flex justify-between items-center">
              <div className="flex items-center mt-2">
                <img src={Rewards} alt="" className="w-14 mr-1" />
                <div>
                  <p className="text-sm text-whites">Level up rewards</p>
                  <p className="fs-sm gray-50 mt-2">
                    Each account can only receive 1 time
                  </p>
                </div>
              </div>
              <div>
                <div className="border border-[--yellow-200] rounded-md color-yellow-200 flex items-center px-4 text-sm">
                  <img src={Wallet} className="w-3 mr-1" alt="" />
                  <span>{currentLevelBenefits.onetime} </span>
                </div>
                <div className="border border-[#21D9CC] rounded-md color-l flex items-center px-4 text-sm mt-1">
                  <RiVipDiamondFill className="color-l mr-1" />
                  <span>0</span>{" "}
                  {/* Assuming this value is static or from another source */}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center mt-2">
                <img src={MRewards} alt="" className="w-14 mr-1" />
                <div>
                  <p className="text-sm text-whites">Monthly rewards</p>
                  <p className="fs-sm gray-50 ">
                    Each account can only receive 1 time per month
                  </p>
                </div>
              </div>
              <div>
                <div className="border border-[--yellow-200] rounded-md color-yellow-200 flex items-center px-4 text-sm">
                  <img src={Wallet} className="w-3 mr-1" alt="" />
                  <span>{currentLevelBenefits.monthstime}</span>
                </div>
                <div className="border border-[#21D9CC] rounded-md color-l flex items-center px-4 text-sm mt-1">
                  <RiVipDiamondFill className="color-l mr-1" />
                  <span>0</span>{" "}
                  {/* Assuming this value is static or from another source */}
                </div>
              </div>
            </div>

            {/* <div className="flex justify-between items-center">
              <div className="flex items-center mt-2">
                <img src={Safe} alt="" className="w-14 mr-1" />
                <div>
                  <p className="text-sm text-whites">Safe</p>
                  <p className="fs-sm gray-50 mt-2">
                    Increase the extra income of the safe
                  </p>
                </div>
              </div>
              <div>
                <div className="border border-[#21D9CC] rounded-md color-l flex items-center px-2 py-1 text-sm mt-1">
                  <RiVipDiamondFill className="color-l mr-1" />
                  <span>{currentLevelBenefits.sefe}%</span>
                </div>
              </div>
            </div> */}
            <div className="flex justify-between items-center">
              <div className="flex items-center mt-2">
                <img src={Rate} alt="" className="w-14 mr-1" />
                <div>
                  <p className="text-sm text-whites">Rebate rate</p>
                  <p className="fs-sm gray-50 mt-2">
                    Increase income of rebate
                  </p>
                </div>
              </div>
              <div>
                <div className="border border-[#21D9CC] rounded-md color-l flex items-center px-2 py-1 text-sm mt-1">
                  <BsDatabaseFill className="color-l mr-1" />
                  <span>{currentLevelBenefits.rebet}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {userInfo?.vip_level !== 0 && (
          <div className="vip-content-myWelfare mt-5 nav-bg rounded text-white font-inter">
            <div className="slideMy">
              {/* Header section */}
              <div className="vip-content-myWelfare-head flex items-center p-4 border-b border-gray-700 sticky top-0 z-10 bg-[#1E2530]">
                <Crown className="text-xl text-yellow-400 mr-2" />
                <h1 className="text-xl font-bold">My Benefits</h1>
              </div>

              {/* Welfare content area  */}
              <div className="grid grid-cols-2 gap-2 p-2 nav-bg">
                {/* Level up rewards */}
                <div className="flex flex-col gap-1 w-full">
                  <div className="bg-[#28323E] rounded-lg overflow-hidden w-full shadow-lg flex flex-col h-full">
                    <div className="relative h-[120px] bg-gradient-to-r from-[#FAE59F] to-[#C4933F] flex-shrink-0 flex items-end justify-center">
                      {/* Adjusted image size and position */}
                      <img
                        src="https://bdg70.com/assets/png/welfare1-eee87ee1.png"
                        alt="Level Up Reward"
                        className="h-36 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://i.ibb.co/spZ9gP5X/1-1fca7935.png";
                        }}
                      />

                      <div className="absolute  w-full  flex items-center justify-between  bg-black bg-opacity-30">
                        <p className="flex items-center text-sm font-semibold p-1  rounded-full backdrop-blur-sm">
                          <img
                            src={Wallet}
                            alt="gold"
                            className="h-4 w-4 mr-1"
                          />
                          {(userInfo?.vip_level &&
                            vipData[userInfo.vip_level - 1]?.onetime) ||
                            0}{" "}
                          {/* Dynamic value */}
                        </p>
                        <p className="flex items-center text-sm font-semibold p-1  rounded-full backdrop-blur-sm">
                          <img
                            src={Rewards}
                            alt="love"
                            className="h-4 w-4 mr-1"
                          />
                          0 {/* This might need to be dynamic */}
                        </p>
                      </div>
                    </div>
                    <div className="p-2 flex-grow flex flex-col justify-between">
                      <div>
                        <h2 className="text-lg font-semibold mb-1 whitespace-nowrap">
                          Level Up Rewards
                        </h2>
                        <p className="text-xs text-gray-400 mb-4 overflow-hidden text-ellipsis line-clamp-2">
                          Each account can only receive 1 time
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    className="w-full bg-gray-600 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-full transition cursor-not-allowed mt-1"
                    disabled // This should be dynamic based on whether it's claimed
                  >
                    Received
                  </button>
                </div>

                {/* Monthly reward */}
                <div className="flex flex-col gap-1 w-full">
                  <div className="bg-[#28323E] rounded-lg overflow-hidden w-full shadow-lg flex flex-col h-full">
                    <div className="relative h-[120px] bg-gradient-to-r from-[#FAE59F] to-[#C4933F] flex-shrink-0 flex items-end justify-center">
                      {/* Adjusted image size and position */}
                      <img
                        src="https://bdg70.com/assets/png/welfare2-cf757d28.png"
                        alt="Monthly Reward"
                        className="h-36 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://i.ibb.co/KcyTMHzK/monthly-reward-removebg-preview.png";
                        }}
                      />
                      <div className="absolute  w-full  flex items-center justify-between  bg-black bg-opacity-30">
                        <p className="flex items-center text-sm font-semibold p-1  rounded-full backdrop-blur-sm">
                          <img
                            src={Wallet}
                            alt="gold"
                            className="h-4 w-4 mr-1"
                          />
                          {(userInfo?.vip_level &&
                            vipData[userInfo.vip_level - 1]?.monthstime) ||
                            0}{" "}
                          {/* Dynamic value */}
                        </p>
                        <p className="flex items-center text-sm font-semibold p-1  rounded-full backdrop-blur-sm">
                          <img
                            src={Rewards}
                            alt="love"
                            className="h-4 w-4 mr-1"
                          />
                          0 {/* This might need to be dynamic */}
                        </p>
                      </div>
                    </div>
                    <div className="p-2 flex-grow flex flex-col justify-between">
                      <div>
                        <h2 className="text-lg font-semibold mb-1 whitespace-nowrap">
                          Monthly Reward
                        </h2>
                        <p className="text-xs text-gray-400 mb-4 overflow-hidden text-ellipsis line-clamp-2">
                          Each account can only receive 1 time per month
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    className="w-full bg-gray-600 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-full transition cursor-not-allowed mt-1"
                    disabled // This should be dynamic based on whether it's claimed
                  >
                    Received
                  </button>
                </div>

                {/* Rebate rate */}
                <div className="flex flex-col gap-1 w-full">
                  <div className="bg-[#28323E] rounded-lg overflow-hidden w-full shadow-lg flex flex-col h-full">
                    <div className="relative h-[120px] bg-gradient-to-r from-[#FAE59F] to-[#C4933F] flex-shrink-0 flex items-end justify-center">
                      {/* Adjusted image size and position */}
                      <img
                        src="https://bdg70.com/assets/png/welfare5-8b250748.png"
                        alt="Rebate Rate"
                        className="h-36 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://i.ibb.co/ycGv5PSP/levelupreward-removebg-preview.png";
                        }}
                      />
                      <div className="absolute  w-full  flex items-center justify-between  bg-black bg-opacity-30">
                        <p className="flex items-center text-sm font-semibold p-1  rounded-full backdrop-blur-sm">
                          <img
                            src={Wallet}
                            alt="wallet"
                            className="h-4 w-4 mr-1"
                          />
                          {(userInfo?.vip_level &&
                            vipData[userInfo.vip_level - 1]?.rebet) ||
                            0}
                          % {/* Dynamic value */}
                        </p>
                      </div>
                    </div>
                    <div className="p-2 flex-grow flex flex-col justify-between">
                      <div>
                        <h2 className="text-lg font-semibold mb-1 whitespace-nowrap">
                          Rebate Rate
                        </h2>
                        <p className="text-xs text-gray-400 mb-4 overflow-hidden whitespace-nowrap text-ellipsis line-clamp-2">
                          Increase income of rebate
                        </p>
                      </div>
                      <button className="w-full text-xs whitespace-nowrap text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-black font-medium py-2 px-2 rounded-full transition">
                        Check the Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5">
          <div className="flex items-center justify-between gap-2 relative">
            {/* History Button */}
            <button
              className={`relative flex justify-center items-center nav-bg w-full py-2 rounded-md ${
                activeRule === 1 ? "color-l" : "gray-50"
              }`}
              onClick={() => setActiveRule(1)}
            >
              History
              {activeRule === 1 && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60%] h-[2px] bg-[#21D9CC]"></div>
              )}
            </button>

            {/* Rules Button */}
            <button
              className={`relative flex justify-center items-center nav-bg w-full py-2 rounded-md ${
                activeRule === 2 ? "color-l" : "gray-50"
              }`}
              onClick={() => setActiveRule(2)}
            >
              Rules
              {activeRule === 2 && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[60%] h-[2px] bg-[#21D9CC]"></div>
              )}
            </button>
          </div>

          {activeRule === 1 && (
            <div>
              {Array.isArray(vipLevelData) && vipLevelData.length > 0 ? (
                vipLevelData?.slice(0, 10)?.map((item, i) => (
                  <div className="  border-b mt-2 border-gray-800 p-2" key={i}>
                    {item?.details === "Bet" ? (
                      <>
                        <div className="flex flex-col items-start justify-between">
                          <h3 className="color-l">Experience Bonus</h3>
                          <p className="fs-sm gray-50">Betting Level</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="fs-sm gray-50">{item?.date}</span>
                          <p className="flex items-center text-green-500 p-[2px] w-auto justify-between px-2 fs-sm rounded-md text-gee">
                            {Math.floor(item?.amount)} EXP
                          </p>
                        </div>
                      </>
                    ) : item?.details === "0" ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-green-500">
                              Successfully received
                            </h3>
                            <p className="fs-sm gray-50">
                              Successfully received {item?.level}
                            </p>
                          </div>

                          <p className="flex items-center border border-[#ffd180] p-[2px] w-auto justify-between px-2 fs-sm rounded-md color-yellow-200">
                            <img src={Wallet} alt="" className="w-3 mr-1" />{" "}
                            {item?.amount}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="fs-sm gray-50">{item?.date}</span>
                          <div className="border border-[#21D9CC] rounded-md color-l flex items-center px-4 text-sm mt-1">
                            <RiVipDiamondFill className="color-l mr-1" />
                            <span>0</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p>Unknown details: {item?.details}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 mt-4">
                  No history data available.
                </p>
              )}
              <Link to="/vip/allhistory">
                <button className="blue-linear flex justify-center text-lg w-80 text-black m-auto font-semibold text-center rounded-full p-2 mt-5 tracking-widest">
                  View All
                </button>
              </Link>
            </div>
          )}

          {activeRule === 2 && (
            <div className="container-section mt-2">
              <h1 className="heading-h1 text-center color-blue">
                {" "}
                VIP privilenges
              </h1>
              <p className="text-base gray-50 text-center">
                VIP rule description
              </p>

              <div className="nav-bg mt-5 px-2 pb-5 rounded-md">
                <div className="bg-popup-nav w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto fs-sm">
                  Upgrade standard
                </div>

                <p className="fs-sm gray-text leading-7">
                  The IP member's experience points (valid bet amount) that meet
                  the requirements of the corresponding rank will be promoted to
                  the corresponding VIP level, the member's VIP data statistics
                  period starts from 00:00:00 days VIP system launched.VIP level
                  calculation is refreshed every 10 minutes! The corresponding
                  experience level is calculated according to valid odds 100:1 !
                </p>
              </div>
              <div className="nav-bg mt-5 px-2 pb-5 rounded-md">
                <div className="bg-popup-nav w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto fs-sm">
                  Upgrade order
                </div>
                <p className="fs-sm gray-text leading-7">
                  The VIP level that meets the corresponding requirements can be
                  promoted by one level every day, but the VIP level cannot be
                  promoted by leapfrogging.
                </p>
              </div>
              <div className="nav-bg mt-5 px-2 pb-5 rounded-md">
                <div className="bg-popup-nav w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto fs-sm">
                  Level maintenance
                </div>
                <p className="fs-sm gray-text leading-7">
                  VIP members need to complete the maintenance requirements of
                  the corresponding level within 30 days after the "VIP level
                  change"; if the promotion is completed during this period, the
                  maintenance requirements will be calculated according to the
                  current level.
                </p>
              </div>
              <div className="nav-bg mt-5 px-2 pb-5 rounded-md">
                <div className="bg-popup-nav w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto fs-sm">
                  Downgrade standard
                </div>
                <p className="fs-sm gray-text leading-7">
                  If a VIP member fails to complete the corresponding level
                  maintenance requirements within 30 days, the system will
                  automatically deduct the experience points corresponding to
                  the level. If the experience points are insufficient, the
                  level will be downgraded, and the corresponding discounts will
                  be adjusted to the downgraded level accordingly.
                </p>
              </div>
              <div className="nav-bg mt-5 px-2 pb-5 rounded-md">
                <div className="bg-popup-nav w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto fs-sm">
                  Upgrade Bonus
                </div>
                <p className="fs-sm gray-text leading-7">
                  The upgrade benefits can be claimed on the VIP page after the
                  member reaches the VIP membership level, and each VIP member
                  can only get the upgrade reward of each level once.
                </p>
              </div>
              <div className="nav-bg mt-5 px-2 pb-5 rounded-md">
                <div className="bg-popup-nav w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto fs-sm">
                  Monthly reward
                </div>
                <p className="fs-sm gray-text leading-7">
                  VIP members can earn the highest level of VIP rewards once a
                  month.Can only be received once a month. Prizes cannot be
                  accumulated. And any unclaimed rewards will be refreshed on
                  the next settlement day. When receiving the highest level of
                  monthly rewards this month Monthly Rewards earned in this
                  month will be deducted e.g. when VIP1 earns 500 and upgrades
                  to VIP2 to receive monthly rewards 500 will be deducted.
                </p>
              </div>
              <div className="nav-bg mt-5 px-2 pb-5 rounded-md">
                <div className="bg-popup-nav w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto fs-sm">
                  Safe
                </div>
                <p className="fs-sm gray-text leading-7">
                  VIP members who have reached the corresponding level will get
                  additional benefits on safe deposit based on the member's VIP
                  level.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Vip;
