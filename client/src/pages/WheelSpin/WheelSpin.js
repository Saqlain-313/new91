import React, { useEffect, useState } from "react";

import bg from "../../assets/Daman-Wheel-Spin-bg.png";
import { HiOutlineRefresh } from "react-icons/hi";
import bgspin from "../../assets/bg-spin-image.png";
import bgfrontspin from "../../assets/bg-spin-front-img.png";
import { HiDocumentChartBar } from "react-icons/hi2";
import { FaFileCircleQuestion } from "react-icons/fa6";
import { HiDocumentPlus } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { IoDocumentTextSharp } from "react-icons/io5";

import vectorimg from "../../assets/vector img.png";
import {
  getSpinWheelData,
  reddempinWheelSpin,
  climeSpinWheelData,
} from "../../store/reducer/activityReducer";

import { useDispatch, useSelector } from "react-redux";
import { spinhistory } from "../../store/reducer/gameReducer";
import CustomeNavbar from "../../components/CustomeNavbar";
import Phone from "../../assets/iphone.png";
import Rupee from "../../assets/rupee.png";
import Loader from "../../components/Loader";
const WheelSpin = () => {
  const { getSpinWheelDatas, redeemSpinData, climeSpinData, loader } =
    useSelector((state) => state.activity);
  const { spinhistoryData } = useSelector((state) => state.game);
  // //console.log("redeemSpinData", redeemSpinData);

  // //console.log("userInfo", userInfo);
  const dispatch = useDispatch();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [remainingSpins, setRemainingSpins] = useState(0);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [celebration, setCelebration] = useState(false);

  // Initialize prizes from the spin data
  const [prizes, setPrizes] = useState([]);

  const handleSpin = () => {
    if (redeemSpinData?.redeamspin === redeemSpinData?.totalspin) return;

    console.log(
      "redeemSpinData?.redeamspin === redeemSpinData?.totalspin",
      redeemSpinData?.redeamspin === redeemSpinData?.totalspin
    );

    // Dispatch API call to get spin data
    dispatch(climeSpinWheelData());
  };

  // Wait for `climeSpinData` to be updated before running the spin logic
  useEffect(() => {
    if (climeSpinData?.index !== undefined) {
      const getRotationForIndex = (index, totalSections) => {
        return -(index * 45 + 1800);
      };

      const totalSections = 8; // Adjust based on the number of prizes
      const index = climeSpinData?.index; // Target index where the wheel should stop
      const randomRotation = getRotationForIndex(index, totalSections);
      const prizeIndex = index;

      // Get the winning prize based on the prize index
      const winningPrize = prizes[prizeIndex];

      setSpinning(true);
      setRotation(rotation + randomRotation);
      setResult(winningPrize);
      setRemainingSpins((prev) => prev - 1); // Decrease the number of spins

      setTimeout(() => {
        setSpinning(false);
        setShowResultPopup(true);
        if (winningPrize !== "Try Again") {
          setCelebration(true);
          setTimeout(() => setCelebration(false), 3000); // Celebration effect for 3 seconds
        }
      }, 3000); // Duration of spin animation
    }
  }, [climeSpinData]); // Runs only when `climeSpinData` updates

  // Function to calculate brightness of a color
  const getBrightness = (color) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  // Function to determine text color based on background brightness
  const getTextColor = (backgroundColor) => {
    return getBrightness(backgroundColor) > 128 ? "text-whites" : "text-white";
  };

  useEffect(() => {
    dispatch(getSpinWheelData());
    dispatch(reddempinWheelSpin());
    dispatch(spinhistory());
  }, [dispatch]);

  useEffect(() => {
    if (getSpinWheelDatas && getSpinWheelDatas?.rows?.length > 0) {
      const spinData = getSpinWheelDatas?.rows[0];
      // //console.log("Spin Data:", spinData); // Log the spin data
      setRemainingSpins(parseInt(redeemSpinData?.redeamspin)); // Set remaining spins from the retrieved data

      // Set prizes from the spin data
      // const newPrizes = [
      //   {name:spinData.sec1,img:Rupee},
      //   {name:spinData.sec2,img:Rupee},
      //   {name:spinData.sec3,img:Rupee},
      //   {name:spinData.sec4,img:Rupee},
      //   {name:spinData.sec5,img:Rupee},
      //   {name:spinData.sec6,img:Rupee},
      //   {name:spinData.sec7,img:Rupee},
      //   {name:spinData.sec8,img:Phone},

      // ];
      const newPrizes = [
        spinData.sec1,
        spinData.sec2,
        spinData.sec3,
        spinData.sec4,
        spinData.sec5,
        spinData.sec6,
        spinData.sec7,
        spinData.sec8,
      ];
      setPrizes(newPrizes);
    } else {
      //console.log("No spin data available."); // Log if no data is available
      setRemainingSpins(0); // Default to 0 if no data is available
    }
  }, [getSpinWheelDatas]);

  return (
    <div className="min-h-screen">
      {loader && <Loader />}

      {/* Header */}
      <CustomeNavbar name="Wheel Spin" />

      {/* Background Image */}
      <div>
        <img src={bg} alt="Wheel Spin Background" className="w-full" />
      </div>

      {/* Info Section */}
      <div className=" p-4">
        <div className="bg-light p-4 rounded-xl shadow">
          {/* Total Recharge */}
          <div className="flex items-center justify-between bg-blues p-3 rounded-lg">
            <h3 className="text-sm font-semibold text-whites">
              Total Recharge
            </h3>
            <div className="flex items-center px-3 py-1 rounded-2xl blue-linear text-black">
              <button className="font-semibold">
                ₹{redeemSpinData?.totalrecharge}
              </button>
              <HiOutlineRefresh className="ml-2" />
            </div>
          </div>

          {/* Number of Spins */}
          <div className="flex items-center justify-between bg-blues p-3 rounded-lg mt-4">
            <h3 className="text-sm font-semibold text-whites">
              Number of Spins
            </h3>
            <div>
              <span className="font-semibold text-whites">
                {redeemSpinData?.redeamspin}
              </span>
              <span className="text-gray-400">
                /
                {redeemSpinData && redeemSpinData?.totalspin
                  ? redeemSpinData?.totalspin
                  : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Spin Game */}
        <div className="flex flex-col items-center justify-center bg-light py-6 relative rounded mt-5 pb-[3rem] ">
          {/* Wheel */}
          <div
            className="relative w-80 h-80 overflow-hidden transition-transform duration-[3s] ease-out rounded-full "
            style={{
              transform: `rotate(${rotation}deg)`,
              backgroundImage: `url(${bgspin})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {prizes.map((prize, index) => (
              <div
                key={index}
                className="absolute w-1/2 h-1/2"
                style={{
                  transformOrigin: "100% 100%",
                  transform: `rotate(${
                    (360 / prizes.length) * (index + 1)
                  }deg)`,
                }}
              >
                <span
                  className={`block text-center text-xs mt-16 font-bold transform origin-bottom ${getTextColor(
                    "#FF6B6B"
                  )}`} // Replace with actual background color
                  style={{
                    transform: `rotate(-${(360 / prizes.length) * index}deg)`,
                  }}
                >
                  {/* {prize}  */}
                </span>
              </div>
            ))}
          </div>

          {/* Spin Button */}
          <button
            className="absolute top-[34%] w-20 h-20 rounded-full bg-transparent border-none flex items-center justify-center"
            style={{
              backgroundImage: `url(${bgfrontspin})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={handleSpin}
            disabled={redeemSpinData?.redeamspin === redeemSpinData?.totalspin}
          ></button>

          {/* Celebration Effect */}
          {celebration && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl text-yellow-500 animate-bounce">🎉</div>
            </div>
          )}
        </div>

        {/* Result Popup */}
        {showResultPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-whites bg-opacity-70">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 rounded-lg shadow-lg max-w-sm w-full transform transition-all duration-300 scale-100 hover:scale-105">
              <h2 className="text-2xl font-bold text-white text-center">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-lg text-white text-center mt-2">
                You won:{" "}
                <span className="font-bold text-yellow-300">{result}</span>!
              </p>
              <button
                className="mt-4 w-full px-4 py-2 bg-white text-blue-500 rounded hover:bg-gray-200 transition"
                onClick={() => {
                  setShowResultPopup(false);
                  window.location.reload(); // Refresh the page
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Next Page Links */}
        <div className="text-[#FA6F6B] flex items-center justify-between gap-5 mt-10">
          <Link to="/EventDescription">
            <div className="flex flex-col items-center justify-center">
              <FaFileCircleQuestion className="text-[50px]" />
              <h3 className="whitespace-nowrap text-whites text-[10px] font-bold">
                Event Description
              </h3>
            </div>
          </Link>

          <Link to="/EventDetail">
            <div className="flex flex-col items-center justify-center">
              <HiDocumentChartBar className="text-[50px]" />
              <h3 className="whitespace-nowrap text-whites text-[10px] font-bold">
                Event Details
              </h3>
            </div>
          </Link>

          <Link to="/ActivityRules">
            <div className="flex flex-col items-center justify-center">
              <HiDocumentPlus className="text-[50px]" />
              <h3 className="whitespace-nowrap text-whites text-[10px] font-bold">
                Activity Rules
              </h3>
            </div>
          </Link>
        </div>

        {/* History */}
        <div>
          <div className="mt-7 flex items-center justify-start gap-2">
            <IoDocumentTextSharp className="text-[#FA6F6B] text-[30px]" />
            <h1 className="font-semibold text-[18px] text-whites">History</h1>
          </div>
          <div className="nav-bg rounded-t-lg mt-3 flex items-center justify-between px-6 py-3 text-white font-semibold">
            <div>Spin Time</div>
            <div>Reward Type</div>
            <div>Prize</div>
          </div>
          {spinhistory.length > 0 ? (
            spinhistoryData?.map((item, i) => (
              <div
                key={i}
                className="bg-[#fff] mt-1 flex items-center justify-between px-6 py-2 text-black text-sm"
              >
                <div>{item.time}</div>
                <div>{item.type}</div>
                <div>{item.amount}</div>
              </div>
            ))
          ) : (
            <div className="w-full h-[270px] bg-popup-nav rounded-b-lg">
              <img src={vectorimg} alt="no data found" className="pt-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WheelSpin;
