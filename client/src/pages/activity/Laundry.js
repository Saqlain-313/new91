import React, { useState, useEffect } from "react";

import { TbLayoutDashboardFilled, TbTransactionRupee } from "react-icons/tb";
import { MdVerifiedUser } from "react-icons/md";

import { MdSportsBasketball, MdSportsSoccer } from "react-icons/md";
import { PiApplePodcastsLogo, PiTelevisionSimpleFill } from "react-icons/pi";
import { BiHeartCircle } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { rebateCreate, rebateget } from "../../store/reducer/activityReducer";
import { userDetail } from "../../store/reducer/authReducer";

import { FaRegDotCircle } from "react-icons/fa";
import { AiOutlineSmallDash } from "react-icons/ai";
import FilterType from "../../components/FilterType";
import CustomeNavbar from "../../components/CustomeNavbar";
import Loader from "../../components/Loader";
import popupImg from "../../assets/tickpopup.png";

const Laundry = () => {
  const [amount, setAmount] = useState(Number);
  const { rebateData, successMessage } = useSelector((state) => state.activity);
  const { userInfo, loader } = useSelector((state) => state.auth);
  const [activeIndex, setActiveIndex] = useState(0);

  const dispatch = useDispatch();
  const [Alerts, setAlerts] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // 👈 popup state

  useEffect(() => {
    dispatch(rebateget());
  }, []);

  const items = [
    { name: "All", icon: <TbLayoutDashboardFilled /> },
    { name: "Lottery", icon: <MdSportsBasketball /> },
    { name: "Casino", icon: <PiTelevisionSimpleFill /> },
    {
      name: "Sports",
      icon: <MdSportsSoccer />,
    },
    { name: "Rummy", icon: <BiHeartCircle /> },
    { name: "Slots", icon: <PiApplePodcastsLogo /> },
  ];

  const handleSubmit = () => {
    if (isRequesting) return; // Prevent multiple clicks
    setIsRequesting(true);

    dispatch(rebateCreate(amount))
      .then(() => {
        return Promise.all([dispatch(rebateget()), dispatch(userDetail())]);
      })
      .then(() => {
        setShowPopup(true); // 👈 popup open
      })
      .finally(() => {
        setIsRequesting(false);
      });
  };

  // Function to get the sum of all commissions
  let totalCommission = 0;
  if (rebateData !== null || rebateData !== undefined) {
    totalCommission =
      Array.isArray(rebateData) &&
      rebateData?.reduce((acc, item) => {
        return acc + parseFloat(item.commission);
      }, 0);
  }

  // Function to get today's commission
  const todayDate = new Date().toISOString().split("T")[0];
  let todayCommission = 0;

  if (rebateData !== null || rebateData !== undefined) {
    todayCommission = Array.isArray(rebateData)
      ? rebateData
          .filter((item) => item?.today?.startsWith(todayDate))
          .reduce((acc, item) => acc + parseFloat(item.commission || 0), 0)
      : 0;
  }

  const handleClick = (index, item) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    setAmount(userInfo?.rebate);
  }, [amount]);

  return (
    <>
      {loader && <Loader />}

      <CustomeNavbar name="Rebate" />
      <FilterType
        items={items}
        activeIndex={activeIndex}
        onActiveChange={handleClick}
      />
      <div className="container-section mt-3">
        <div className="bg-body rounded-xl p-2 pb-0 text-whites">
          <h3 className="text-sm">All-Total betting rebate</h3>

          <button className="border px-2 py-1 mt-3 flex items-center rounded-md text-base  border-[var(--main-color)]  blue-color-300">
            <MdVerifiedUser className="blue-color-300" />
            <span className="fs-sm ms-2 mt-1">Real-time count</span>
          </button>
          <div className="flex items-center mt-2">
            <TbTransactionRupee className="blue-color-300 text-2xl" />{" "}
            <span className="text-lg ms-1 font-bold text-black">{userInfo?.rebate}</span>
          </div>

          <div className="bg-blues mt-3 w-[80%] px-3 py-2 rounded-md mb-2 gray-50 border-rounded fs-sm ">
            <span>Upgrade VIP level to increase rebet rate</span>
          </div>

          <div className="flex item-center justify-between mb-3">
            <div className="bg-blues  w-[49%] p-2 rounded-md">
              <p className="text-[12px] gray-50">Today rebate</p>
              <p className="text-base color-yellow-200 font-medium">
                {Number(todayCommission).toFixed(2)}
              </p>
            </div>

            <div className="bg-blues w-[49%] p-2 rounded-md">
              <p className="text-[12px] gray-50">Total rebate</p>
              <p className="text-base color-yellow-200 font-medium">
                {Number(totalCommission).toFixed(2)}
              </p>
            </div>
          </div>
          <p className="fs-sm gray-50">
            Automatic code washing at 01:00:00 every morning
          </p>

          <div className=" pb-4 pt-2">
            <button
              className={` py-2 rounded-3xl text-base w-full  heading-h3 ${
                userInfo?.rebate > 0
                  ? "blue-linear color-orange"
                  : "bg-gray-300 text-black"
              }`}
              disabled={userInfo?.rebate > 0 ? false : true}
              onClick={handleSubmit}
            >
              One-Click Rebate
            </button>
          </div>
        </div>
        <div className="flex items-center mt-4 border-l-4 border-[#d9ac4f] text-sm">
          {" "}
          <h1 className="heading-h3 font-semibold ml-1 text-whites">
            Rebate history
          </h1>
        </div>
        {Array.isArray(rebateData) &&
          rebateData?.map((data, i) => (
            <div className="bg-light rounded-xl  mt-3 pb-4 pt-3" key={i}>
              <div className="flex justify-between text-black items-center px-3">
                <h3 className="heading-h3 font-semibold text-whites">
                  {data.type}
                </h3>

                <p
                  className={`text-base   ${
                    data.status === 0
                      ? "color-yellow-200"
                      : data.status === 1
                      ? "color-green"
                      : "color-red-200"
                  }`}
                >
                  {data.status === 0
                    ? "Pending"
                    : data.status === 1
                    ? "Completed"
                    : "Failed"}
                </p>
              </div>
              <p className="fs-sm px-3 text-whites border-b border-color-slat leading-5">
                {data.today}
              </p>
              <ul className="px-2 mt-2">
                <li className="flex  justify-between">
                  <div className="flex ">
                    <div className="flex flex-col items-center mt-[3px] mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      {i < 5 ? (
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 blue-color-300 fs-sm" />
                      ) : (
                        ""
                      )}
                    </div>
                    <p className="text-whites text-sm ">Betting rebate </p>
                  </div>
                  <span className=" text-sm text-whites">{data.amount}</span>
                </li>
                <li className="flex  justify-between">
                  <div className="flex ">
                    <div className="flex  flex-col items-center mt-[3px] mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      {i < 5 ? (
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 blue-color-300 fs-sm" />
                      ) : (
                        ""
                      )}
                    </div>
                    <p className="text-whites text-sm ">Rebate rate </p>
                  </div>
                  <span className=" text-sm  color-red-200">{data.rate}%</span>
                </li>
                <li className="flex  justify-between">
                  <div className="flex ">
                    <div className="flex  flex-col items-center mt-[3px] mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                    </div>
                    <p className="text-whites text-sm ">Rebate amount</p>
                  </div>
                  <span className=" text-sm  color-yellow-200">
                    {data.commission}
                  </span>
                </li>
              </ul>
            </div>
          ))}

        <button className="border py-2 mt-3 blue-color-300 bg-light rounded-3xl text-base w-full border-[var(--main-color)] heading-h3">
          All history
        </button>
      </div>

      {/* alerts */}
      <div className={`place-bet-popup ${Alerts ? "active" : ""}`}>
        <div className="text-sm">{successMessage} </div>
      </div>

      {/* 👇 POPUP 👇 */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
          <div className="bg-[#2b2b2b] text-white rounded-xl p-6 w-[300px] text-center shadow-lg relative">
            <div className="flex justify-center mb-3 -mt-14">
              <div className="w-32 h-24">
                <img src={popupImg} alt="" />
              </div>
            </div>
            <h2 className="text-lg font-bold mb-1">All-Betting rebate</h2>
            <p className="text-xs mb-2 gray-50">One-Click Rebate successful</p>
            <p className="text-sm py-3">
              Rebate amount:{" "}
              <span className="text-yellow-400 font-semibold">
                {Number(amount).toFixed(2)}
              </span>
            </p>
            <button
              className="mt-4 w-full py-2 rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold"
              onClick={() => setShowPopup(false)} // confirm pe close
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Laundry;
