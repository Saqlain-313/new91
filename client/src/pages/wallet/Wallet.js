import { useEffect, useState } from "react";
import { GiEightBall } from "react-icons/gi";
import { IoIosArrowBack } from "react-icons/io";
import { IoWallet } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import "./wallet.css";

import DepositHisImg from "../../assets/rechargeHistory.png";
import DepositImg from "../../assets/rechargeIcon.png";
import WithdrawImg from "../../assets/widthdrawBlue.png";
import WithdrawHisImg from "../../assets/withdrawHistory.png";

import Loader from "../../components/Loader";
import Layout from "../../layout/Layout";

import { useDispatch, useSelector } from "react-redux";
import { userDetail } from "../../store/reducer/authReducer";
import {
  checkBalance,
  transferBalance,
} from "../../store/reducer/spribeGameReducer";

const LotteryData = [
  {
    amount: "0.0",
    name: "Lottery",
    Icons: <GiEightBall />,
  },
  {
    amount: "0.00",
    name: "TB_Chess",
    Icons: <GiEightBall />,
  },
];

const Wallet = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { rechargeList2Data } = useSelector((state) => state.user);
  const { checkBalanceData, loader } = useSelector((state) => state.spribeGame);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State for the topup2 popup, now controlled by Popup2 component
  const [showTopup2, setShowTopup2] = useState(false);
  const [timer, setTimer] = useState(0); // State for the transfer button timer

  // Effect to scroll to top and fetch user details and balance on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(userDetail());
    let playerid = userInfo?.phone_user;
    if (playerid) {
      dispatch(checkBalance(playerid));
    }
  }, [dispatch, userInfo?.phone_user]);

  // Effect to show topup2 popup on initial page load based on localStorage
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

  // Effect to manage the countdown timer for the transfer button
  useEffect(() => {
    let interval;
    if (loader && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && loader) {
      // If timer hits 0 while loader is still true, it means the transfer operation is still in progress
      // The loader state should be handled by the transferBalance action when it completes.
      // No explicit action needed here other than letting the interval clear.
    }
    return () => clearInterval(interval);
  }, [loader, timer]);

  // Handler for transferring balance
  const handleTransfer = () => {
    setTimer(5); // Start the 5-second timer for "Recalling..."
    let playerid = userInfo?.phone_user;
    dispatch(transferBalance(playerid)).then(() => {
      // After transfer, refresh user details and balance
      dispatch(userDetail());
      dispatch(checkBalance(playerid));
      // Assuming loader is set to false by the Redux action upon completion/failure
    });
  };

  // Effect to scroll to top after balance data or user info updates
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [checkBalanceData, userInfo]);

  // Calculate wallet percentages
  const mainWalletBalance = Number(userInfo?.money_user) || 0;
  const thirdPartyWalletBalance = parseFloat(checkBalanceData?.Balance) || 0;
  const totalBalance = mainWalletBalance + thirdPartyWalletBalance;

  const mainWalletPercentage =
    totalBalance === 0 ? 0 : (mainWalletBalance / totalBalance) * 100;
  const thirdPartyWalletPercentage =
    totalBalance === 0 ? 0 : (thirdPartyWalletBalance / totalBalance) * 100;

  return (
    <Layout>
      <div className="nav-bg p-2 sticky top-0 z-10">
        <div className="container-section flex items-center">
          <button>
            <Link to={"/main"}>
              <IoIosArrowBack className="text-xl text-white" />
            </Link>
          </button>
          <h1 className="heading-h1 text-white text-center flex justify-center items-center m-auto">
            Wallet
          </h1>
        </div>
      </div>

      {/* Conditional Loader */}
      {loader && <Loader />}

      <div className="nav-bg flex flex-col justify-center items-center py-4">
        <p>
          <IoWallet className="text-4xl" />
        </p>
        <h3 className="heading text-2xl font-medium">
          ₹{" "}
          {userInfo?.money_user
            ? Number(userInfo?.money_user).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "0.00"}
        </h3>
        <p className="fs-sm">Total balance</p>
      </div>
      <div className="nav-bg py-4 flex justify-around">
        <div className="text-center">
          <h4>{userInfo?.totalRecharge ? userInfo?.totalRecharge : 0}</h4>
          <p className="fs-sm">Total deposit amount</p>
        </div>
        <div className="text-center">
          <h4>{userInfo?.totalWithdraw ? userInfo?.totalWithdraw : 0}</h4>
          <p className="fs-sm">Total withdraw amount</p>
        </div>
      </div>

      <div className="container-section mt-3">
        <div className="nav-bg p-3 rounded-lg">
          <div className="flex justify-between px-8 pt-4">
            {/* Main Wallet Display */}
            <div className="relative inline-block">
              <div
                className="w-[100px] h-[100px] rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(var(--bgblue) ${mainWalletPercentage}%, grey ${mainWalletPercentage}%)`,
                }}
              >
                <div className="w-[80px] h-[80px] nav-bg text-white rounded-full flex flex-col items-center justify-center">
                  <span className="text-sm gray-text font-semibold">
                    {Math.round(mainWalletPercentage)}%
                  </span>
                </div>
              </div>
              <p className="text-center text-sm gray-text mt-2">
                ₹{" "}
                {mainWalletBalance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-center fs-sm gray-text">Main Wallet</p>
            </div>

            {/* Fixed 3rd Party Wallet Display */}
            <div className="relative inline-block">
              <div
                className="w-[100px] h-[100px] rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(#3b82f6 ${thirdPartyWalletPercentage}%, grey ${thirdPartyWalletPercentage}%)`,
                }}
              >
                <div className="w-[80px] h-[80px] nav-bg text-white rounded-full flex flex-col items-center justify-center">
                  <span className="text-sm gray-text font-semibold">
                    {Math.round(thirdPartyWalletPercentage)}%
                  </span>
                </div>
              </div>
              <p className="text-center text-sm gray-text mt-2">
                ₹{" "}
                {thirdPartyWalletBalance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-center fs-sm gray-text">3rd Party Wallet</p>
            </div>
          </div>

          <button
            className="blue-linear text-black w-full p-1 text-lg font-bold my-2 rounded-full mt-3"
            onClick={handleTransfer}
            disabled={loader}
          >
            {loader && timer > 0
              ? `Recalling ${timer} ...`
              : "Main wallet transfer"}
          </button>

          <div className="flex justify-between mt-4 mx-2">
            <div onClick={() => navigate("/wallet/Recharge")}>
              <img src={DepositImg} alt="Deposit" className="w-12" />
              <p className="text-sm gray-text font-light text-center mt-2">
                Deposit
              </p>
            </div>
            <div onClick={() => navigate("/wallet/Withdraw")}>
              <img src={WithdrawImg} alt="Withdraw" className="w-12" />
              <p className="text-sm gray-text font-light text-center mt-2">
                Withdraw
              </p>
            </div>
            <div onClick={() => navigate("/wallet/RechargeHistory")}>
              <img src={DepositHisImg} alt="Deposit History" className="w-12" />
              <p className="text-sm gray-text font-light text-center mt-2">
                Deposit <br /> history
              </p>
            </div>
            <div
              onClick={() => navigate("/wallet/WithdrawalHistory")}
              className="flex flex-col items-center"
            >
              <img
                src={WithdrawHisImg}
                alt="Withdrawal History"
                className="w-12"
              />
              <p className="text-sm gray-text font-light text-center mt-2">
                Withdrawal <br /> history
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-section mt-3">
        <div className="grid grid-cols-12 gap-2 ">
          {LotteryData.map((item, i) => (
            <div
              key={i}
              className={`col-span-4 rounded-md relative nav-bg flex flex-col justify-center items-center py-5 ${
                i === 0 ? "blue-linear text-black" : "gray-50"
              }`}
            >
              <h5 className="heading-h5 fs-sm mb-3">
                {i === 0
                  ? `₹${Number(userInfo?.money_user)?.toFixed(2)}`
                  : i === 1
                    ? `₹${parseFloat(checkBalanceData?.Balance) || 0}`
                    : item.amount}
              </h5>
              <p className={`fs-sm ${i === 0 ? "text-black" : "gray-text"}`}>
                {item.name}
              </p>
              <span
                className="absolute wallet-svg top-4 text-5xl"
                style={{ color: "#d9d9d91a" }}
              >
                {item.Icons}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Topup2 Popup Section - Now a separate component */}
      {/* <Popup2
        showPopup={showTopup2}
        onClose={() => setShowTopup2(false)}
      /> */}
    </Layout>
  );
};

export default Wallet;
