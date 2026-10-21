import { useEffect, useState } from "react";

import { AiFillExclamationCircle } from "react-icons/ai";
import { BiLogOutCircle } from "react-icons/bi";
import { IoIosArrowForward } from "react-icons/io";
import { PiCopySimpleLight } from "react-icons/pi";

import { Link, useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout";

import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import RefereshImg from "../../assets/refresh.png";
import AlertCopmponent from "../../components/AlertComponent";
import CopyCopmponent from "../../components/CopyCopmponent";
import Loader from "../../components/Loader";
import {
  notification,
  notificationgets,
  unseenmessage,
} from "../../store/reducer/activityReducer";
import { auth_reset, userDetail } from "../../store/reducer/authReducer";
import { AvatarData, VIPImg } from "./AvatarData";

const Main = () => {
  const { unseenmessageget, loader } = useSelector((state) => state.activity);
  const { userInfo } = useSelector((state) => state.auth);
  const { rechargeList2Data } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [refesh, setRefesh] = useState(false);
  const [copyPopup, setCopyPopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false); // Renamed for clarity
  const [alerts, setAlerts] = useState(false);

  // State for the topup2 popup, now passed to Popup2 component
  const [showTopup2, setShowTopup2] = useState(false);

  useEffect(() => {
    dispatch(notification());
    dispatch(notificationgets());
    dispatch(unseenmessage());
  }, [dispatch]);

  // Effect to determine if Popup2 should be initially shown
  useEffect(() => {
    const shouldShow = () => {
      const today = new Date().toDateString();
      const lastReminderDate = localStorage.getItem("topup2_lastReminderDate");
      const hideReminders =
        localStorage.getItem("topup2_hideReminders") === "true";
      return !(hideReminders && lastReminderDate === today);
    };

    if (shouldShow() && rechargeList2Data?.length === 0) {
      setShowTopup2(true);
    }
  }, []);

  console.log("rechargeList2Data", rechargeList2Data);

  const handleLogout = () => {
    Cookies.remove("auth");
    Cookies.remove("token");
    dispatch(userDetail());
    dispatch(auth_reset());
    setShowLogoutPopup(false);
    navigate("/login");
  };

  const copyToClipCode = () => {
    navigator.clipboard
      .writeText(userInfo?.id_user || "")
      .then(() => {
        setCopyPopup(true);
        setTimeout(() => {
          setCopyPopup(false);
        }, 1500);
      })
      .catch((err) => {
        console.error("Failed to copy the text: ", err);
      });
  };

  const handleRefesh = () => {
    dispatch(userDetail());
    setRefesh(true);
    setTimeout(() => {
      setRefesh(false);
    }, 1500);
  };

  function arFun() {
    setAlerts(true);
    setTimeout(() => {
      setAlerts(false);
    }, 1500);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      {loader && <Loader />}

      <div className="nav-bg py-7 pb-32 rounded-b-[60px] relative">
        <div className="absolute right-2 top-1 flex"></div>
        <div className="container-section">
          <div className="flex items-center">
            <img
              src={AvatarData[userInfo?.userPhoto]}
              alt=""
              loading="lazy"
              className="w-20 rounded-full h-20"
              onClick={() => navigate("/main/avatar")}
            />
            <div className="ms-2">
              <h3 className="heading-h3 flex items-center text-md">
                {userInfo?.name_user}{" "}
                <img
                  src={VIPImg[userInfo?.vip_level]}
                  alt=""
                  loading="lazy"
                  className="w-16"
                />
              </h3>
              <div className="bg-yellow text-[12px] justify-between items-center px-2 rounded-full inline-flex">
                <span>UID</span>
                <span className="px-3">|</span>
                <span>{userInfo?.id_user}</span>
                <span className="ps-2" onClick={copyToClipCode}>
                  <PiCopySimpleLight />
                </span>
              </div>
              <p className="fs-sm mt-1">
                Last login: {localStorage.getItem("currentDate")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-section relative mt-[-100px]">
        <div className="bg-popup-nav p-3 rounded-lg pb-3">
          <div>
            <p className="gray-text text-sm">Total balance</p>
            <div className="flex items-center ms-2 mt-2">
              <h4 className="heading-h3 text-lg text-whites font-bold">
                ₹
                {userInfo?.money_user
                  ? Number(userInfo?.money_user).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}
              </h4>
              <img
                src={RefereshImg}
                alt=""
                loading="lazy"
                onClick={handleRefesh}
                className="w-5 ms-2 mb-[2px] brightness-75"
              />
            </div>
          </div>
          <hr className="mt-2 border-[#454545]" />
          <div className="flex justify-between mt-4 mx-2">
            <div
              onClick={arFun}
              className=" cursor-pointer flex flex-col items-center justify-center"
            >
              <svg data-v-7d799898="" className="svg-icon icon-wallets size-8">
                <use href="#icon-wallets"></use>
              </svg>
              <p className="text-sm text-whites text-center mt-2">ARWallet</p>
            </div>
            <div
              onClick={() => navigate("/wallet/Recharge")}
              className=" cursor-pointer flex flex-col items-center justify-center"
            >
              <svg
                data-v-7d799898=""
                className="svg-icon icon-rechargeIcon size-8"
              >
                <use href="#icon-rechargeIcon"></use>
              </svg>
              <p className="text-sm text-whites text-center mt-2">Deposit</p>
            </div>
            <div
              onClick={() => navigate("/wallet/Withdraw")}
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <svg
                data-v-7d799898=""
                className="svg-icon icon-widthdrawBlue size-8"
              >
                <use href="#icon-widthdrawBlue"></use>
              </svg>
              <p className="text-sm text-whites text-center mt-2">Withdraw</p>
            </div>
            <div
              onClick={() => navigate("/vip")}
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <svg data-v-7d799898="" className="svg-icon icon-VipIcon size-8">
                <use href="#icon-VipIcon"></use>
              </svg>
              <p className="text-sm text-whites text-center mt-2">VIP</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-[10px] mt-3">
          <div
            className="col-span-6 nav-bg px-4 py-2 rounded-md flex items-center nav-bg"
            onClick={() => navigate("/main/BetRecors")}
          >
            <svg data-v-acd6d46f className="svg-icon2 icon-betHistory w-8 h-8">
              <use xlinkHref="#icon-betHistory" />
            </svg>
            <div className="ms-2">
              <h3 className="heading-h3 text-whites leading-4 text-sm">
                Game History
              </h3>
              <p className="text-[12px] gray-text leading-4">My game history</p>
            </div>
          </div>

          <div
            className="col-span-6 nav-bg px-3 py-3 rounded-md flex items-center nav-bg"
            onClick={() => navigate("/wallet/TransAction")}
          >
            <svg
              data-v-acd6d46f
              className="svg-icon2 icon-tradeHistory w-8 h-8"
            >
              <use xlinkHref="#icon-tradeHistory" />
            </svg>
            <div className="ms-2">
              <h3 className="heading-h3 text-whites leading-4 text-sm">
                Transaction
              </h3>
              <p className="text-[12px] gray-text leading-4">
                My transaction history
              </p>
            </div>
          </div>

          <div
            className="col-span-6 nav-bg px-3 py-1 rounded-md flex items-center nav-bg"
            onClick={() => navigate("/wallet/RechargeHistory")}
          >
            <svg
              data-v-acd6d46f
              className="svg-icon2 icon-rechargeHistory w-8 h-8"
            >
              <use xlinkHref="#icon-rechargeHistory" />
            </svg>
            <div className="ms-2 py-2">
              <h3 className="heading-h3 text-whites leading-4 text-sm">
                Deposit
              </h3>
              <p className="text-[12px] gray-text leading-4">
                My deposit history
              </p>
            </div>
          </div>

          <div
            className="col-span-6 nav-bg px-3 py-1 rounded-md flex items-center nav-bg"
            onClick={() => navigate("/wallet/WithdrawalHistory")}
          >
            <svg
              data-v-acd6d46f
              className="svg-icon2 icon-myWithdrawHistory w-8 h-8"
            >
              <use xlinkHref="#icon-myWithdrawHistory" />
            </svg>
            <div className="ms-2">
              <h3 className="heading-h3 text-whites leading-4">Withdraw</h3>
              <p className="text-[12px] gray-text leading-4">
                My withdraw history
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* game notification section */}
      <div className="container-section">
        <ul className="nav-bg mt-5 rounded-lg divide-y divide-[#525167] ...">
          <li
            className="flex justify-between items-center p-3 py-4"
            onClick={() => navigate("/home/Messages")}
          >
            <div className="flex items-center">
              <svg
                data-v-a30d19b1=""
                className="svg-icon icon-notification size-8"
              >
                <use href="#icon-notification"></use>
              </svg>
              <span className="text-sm text-whites font-medium ml-2">
                Notification
              </span>
            </div>
            <div className="flex items-center">
              {unseenmessageget > 0 && (
                <h5 className="mr-2 bg-red-600 rounded-full w-auto h-5 flex items-center text-center justify-center px-1">
                  {unseenmessageget || "0"}
                </h5>
              )}
              <IoIosArrowForward className="text-sm font-thin gray-text" />
            </div>
          </li>
          <li
            className="flex justify-between items-center p-3 py-4"
            onClick={() => navigate("/main/RedeemGift")}
          >
            <div className="flex items-center">
              <svg
                data-v-a30d19b1=""
                className="svg-icon icon-gifts size-8 bright"
              >
                <use href="#icon-gifts"></use>
              </svg>
              <span className="text-sm text-whites font-medium ml-2">
                Gifts
              </span>
            </div>
            <div>
              <IoIosArrowForward className="text-sm font-thin gray-text" />
            </div>
          </li>
          {/* <li
            className="flex justify-between items-center p-3 py-4"
            onClick={() => navigate("/main/GetBones")}
          >
            <div className="flex items-center">
              <svg data-v-a30d19b1="" className="svg-icon icon-gifts size-8 bright">
                <use href="#icon-gifts"></use>
              </svg>
              <span className="text-sm text-whites font-medium ml-2">Get Bones</span>
            </div>
            <div>
              <IoIosArrowForward className="text-sm font-thin gray-text" />
            </div>
          </li> */}
          <li
            className="flex justify-between items-center p-3 py-4"
            onClick={() => navigate("/main/GameStats")}
          >
            <div className="flex items-center">
              <svg
                data-v-a30d19b1=""
                className="svg-icon icon-statsIcon size-8 bright"
              >
                <use href="#icon-statsIcon"></use>
              </svg>
              <span className="text-sm text-whites font-medium ml-2">
                Games statistics
              </span>
            </div>
            <div>
              <IoIosArrowForward className="text-sm font-thin gray-text" />
            </div>
          </li>
          <li
            className="flex justify-between items-center p-3 py-4"
            // onClick={() => navigate("/main/Language")} // This line was commented out
          >
            <div className="flex items-center">
              <svg
                data-v-a30d19b1=""
                className="svg-icon icon-language size-8 bright"
              >
                <use href="#icon-language"></use>
              </svg>
              <span className="text-sm text-whites font-medium ml-2">
                Language
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-whites font-medium mr-1">
                English
              </span>
              <IoIosArrowForward className="text-sm font-thin gray-text" />
            </div>
          </li>
        </ul>
      </div>

      <div className="container-section mt-4">
        <div className="nav-bg p-3 rounded-lg pb-5">
          <h3 className="heading-h3 text-whites font-medium mb-2">
            Service center
          </h3>

          <div className="grid grid-cols-3 gap-y-4">
            <div
              className="flex flex-col items-center justify-center"
              onClick={() => navigate("/main/SettingCenter")}
            >
              <svg className="svg-icon icon-settingCenter size-7 text-[#008b59] bright">
                <use href="#icon-settingCenter" />
              </svg>
              <p className="gray-text fs-sm text-center">Setting</p>
            </div>

            <div
              className="flex flex-col items-center justify-center"
              onClick={() => navigate("/main/Feedback")}
            >
              <svg className="svg-icon icon-feedback size-7 text-[#008b59] bright">
                <use href="#icon-feedback" />
              </svg>
              <p className="gray-text fs-sm text-center">Feedback</p>
            </div>

            <div
              className="flex flex-col items-center justify-center"
              onClick={() => navigate("/main/Notification")}
            >
              <svg className="svg-icon icon-notificationCenter size-7 text-[#008b59] bright">
                <use href="#icon-notificationCenter" />
              </svg>
              <p className="gray-text fs-sm text-center">Notification</p>
            </div>

            <Link
              className="flex flex-col items-center justify-center"
              to={`https://h5.workorder.support.1xclube.com/?token=${Cookies.get(
                "auth",
              )}`}
            >
              <svg className="svg-icon icon-serverTicket size-7 text-[#008b59] bright">
                <use href="#icon-serverTicket" />
              </svg>
              <p className="gray-text fs-sm text-center leading-tight">
                24/7 Customer
                <br />
                service
              </p>
            </Link>

            <div
              className="flex flex-col items-center justify-center"
              onClick={() => navigate("/main/beginner")}
            >
              <svg className="svg-icon icon-guide size-7 text-[#008b59] bright">
                <use href="#icon-guide" />
              </svg>
              <p className="gray-text fs-sm text-center">Beginner's guide</p>
            </div>

            <div
              className="flex flex-col items-center justify-center"
              onClick={() => navigate("/main/About")}
            >
              <svg className="svg-icon icon-about size-7 text-[#008b59] bright">
                <use href="#icon-about" />
              </svg>
              <p className="gray-text fs-sm text-center">About us</p>
            </div>
          </div>

          <button
            className="border color-l flex justify-center items-center border-[var(--bg-color-l)] w-full rounded-full p-2 mt-6 text-lg"
            onClick={() => setShowLogoutPopup(true)}
          >
            <BiLogOutCircle className="rotate-90 font-thin mr-2 color-l text-2xl" />
            Log Out
          </button>
        </div>
      </div>

      <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />
      <CopyCopmponent copyPopup={refesh} message="Refesh successfully" />
      <AlertCopmponent alertPopup={alerts} message="Coming soon" />

      {/* Logout Confirmation Popup Section */}
      {showLogoutPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="nav-bg p-6 px-10 rounded-lg text-center nav-bg">
            <AiFillExclamationCircle
              className="mx-auto text-[#fb5b5b]"
              size={80}
            />
            <h2 className="text-whites font-semibold text-xl mt-4">
              Do you want to log out?
            </h2>
            <div className="mt-6 gap-3 flex flex-col">
              <button
                onClick={handleLogout}
                className="px-4 py-2 blue-linear font-medium text-black rounded-full"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="px-4 py-2 border border-[#21D9CC] font-medium color-l rounded-full nav-bg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topup2 Popup Section - Now a separate component */}
      {/* <Popup2 showPopup={showTopup2} onClose={() => setShowTopup2(false)} /> */}
    </Layout>
  );
};

export default Main;
