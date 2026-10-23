import { useEffect, useState } from "react";

import { MdVerifiedUser } from "react-icons/md";
import { TbLayoutDashboardFilled, TbTransactionRupee } from "react-icons/tb";

import { BiHeartCircle } from "react-icons/bi";
import { MdSportsBasketball, MdSportsSoccer } from "react-icons/md";
import { PiApplePodcastsLogo, PiTelevisionSimpleFill } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { rebateCreate, rebateget } from "../../store/reducer/activityReducer";
import { userDetail } from "../../store/reducer/authReducer";

import { AiOutlineSmallDash } from "react-icons/ai";
import { FaRegDotCircle } from "react-icons/fa";
import CustomeNavbar from "../../components/CustomeNavbar";
import FilterType from "../../components/FilterType";
import Loader from "../../components/Loader";

const Laundry = () => {
  const [amount, setAmount] = useState(Number);
  const { rebateData, successMessage } = useSelector((state) => state.activity);
  const { userInfo, loader } = useSelector((state) => state.auth);
  const [activeIndex, setActiveIndex] = useState(0);

  const dispatch = useDispatch();
  const [Alerts, setAlerts] = useState(false);

  //   8273142996

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

  const [isRequesting, setIsRequesting] = useState(false);

  const handleSubmit = () => {
    if (isRequesting) return; // Prevent multiple clicks while the request is in progress

    setIsRequesting(true);
    dispatch(rebateCreate(amount))
      .then(() => {
        return Promise.all([dispatch(rebateget()), dispatch(userDetail())]);
      })
      .then(() => {
        setAlerts(true);
        setTimeout(() => {
          setAlerts(false);
        }, 2000);
      })
      .finally(() => {
        setIsRequesting(false); // Reset request state
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
  const todayDate = new Date().toISOString().split("T")[0]; // Get current date in 'YYYY-MM-DD' format
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
    dispatch(rebateget());
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
        <div className="nav-bg rounded-xl p-2 pb-0 text-whites nav-bg">
          <h3 className="text-sm">All-Total betting rebate</h3>

          <button className="border px-2 mt-3 flex items-center rounded-md text-base  border-[var(--main-color)]  blue-color-300">
            <MdVerifiedUser className="color-blue" />
            <span className="fs-sm ms-1">Real-time count</span>
          </button>
          <div className="flex items-center mt-2">
            <TbTransactionRupee className="blue-color-300 text-2xl" />{" "}
            <span className="text-lg ms-1 font-bold">{userInfo?.rebate}</span>
          </div>

          <div className="bg-popup-nav mt-3 w-[80%] px-3 py-2 rounded-md mb-2 gray-50 border-rounded fs-sm ">
            <span>Upgrade VIP level to increase rebet rate</span>
          </div>

          <div className="flex item-center justify-between mb-3">
            <div className="bg-popup-nav  w-[49%] p-2 rounded-md">
              <p className="text-[12px] gray-50">Today rebate</p>
              <p className="text-base color-yellow-200 font-medium">
                {Number(todayCommission).toFixed(2)}
              </p>
            </div>

            <div className="bg-popup-nav w-[49%] p-2 rounded-md">
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
                  ? "blue-linear text-black"
                  : "bg-gray-500 text-white"
              }`}
              disabled={userInfo?.rebate > 0 ? false : true}
              onClick={handleSubmit}
            >
              One-Click Rebate
            </button>
          </div>
        </div>
        <div className="flex items-center mt-4 border-l-4 border-[#21D9CC] text-sm">
          {" "}
          <h1 className="heading-h3 font-semibold ml-1 text-whites">
            Rebate history
          </h1>
        </div>
        {Array.isArray(rebateData) &&
          rebateData?.map((data, i) => (
            <div className="nav-bg rounded-xl  mt-3 pb-4 pt-3" key={i}>
              <div className="flex justify-between text-white items-center px-3">
                <h3 className="heading-h3 font-semibold text-white">
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
              <p className="fs-sm px-3 text-white border-b border-color-slat leading-5">
                {data.today}
              </p>
              <ul className="px-2 mt-2">
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
                    <p className="text-white text-sm ">Betting rebate </p>
                  </div>
                  <span className=" text-sm text-white">{data.amount}</span>
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
                    <p className="text-white text-sm ">Rebate rate </p>
                  </div>
                  <span className=" text-sm  color-red-200">{data.rate}%</span>
                </li>
                <li className="flex  justify-between">
                  <div className="flex ">
                    <div className="flex  flex-col items-center mt-[3px] mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                    </div>
                    <p className="text-white text-sm ">Rebate amount</p>
                  </div>
                  <span className=" text-sm  color-yellow-200">
                    {data.commission}
                  </span>
                </li>
              </ul>
            </div>
          ))}

        {/* <TbMinusVertical className='color-blue text-2xl'/> */}
        <button className="border py-2 mt-3 blue-color-300  rounded-3xl text-base w-full border-[var(--main-color)] heading-h3 nav-bg">
          All history
        </button>
      </div>
      {/* alerts */}
      <div className={`place-bet-popup ${Alerts ? "active" : ""}`}>
        <div className="text-sm">{successMessage} </div>
      </div>
    </>
  );
};

export default Laundry;
