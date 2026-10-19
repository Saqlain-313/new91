import React, { useEffect } from "react";
import "./wallet.css";
import { Link, useNavigate } from "react-router-dom";
import { IoWallet } from "react-icons/io5";
import { FaRegCircle } from "react-icons/fa";
import DepositImg from "../../assets/rechargeIcon.png";
import WithdrawImg from "../../assets/widthdrawBlue.png";
import DepositHisImg from "../../assets/rechargeHistory.png";
import WithdrawHisImg from "../../assets/withdrawHistory.png";
import { GiEightBall } from "react-icons/gi";
import Layout from "../../layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowBack } from "react-icons/io";
import Loader from "../../components/Loader";

import { userDetail } from "../../store/reducer/authReducer";
import {
  checkBalance,
  transferBalance,
} from "../../store/reducer/spribeGameReducer";

const Wallet = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const { checkBalanceData, loader } = useSelector((state) => state.spribeGame);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);

    dispatch(userDetail());
    let playerid = userInfo?.phone_user;
    dispatch(checkBalance(playerid));
  }, []);

  const handleTransfer = () => {
    let playerid = userInfo?.phone_user;
    dispatch(transferBalance(playerid)).then((res) => {
      dispatch(userDetail());
      dispatch(checkBalance(playerid));
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [checkBalanceData, userInfo]);
  return (
    <Layout>
      <div className="nav-bg p-2 sticky top-0 z-10">
        <div className="container-section flex items-center">
          <h1 className="heading-h1 text-white text-center flex justify-center items-center m-auto">
            Wallet
          </h1>
        </div>
      </div>

      {loader && <Loader />}

      <div className="nav-bg flex flex-col justify-center items-center py-4">
        <p>
          <IoWallet className="text-4xl" />
        </p>
        <h3 className="heading text-2xl font-medium">
          ₹
          {userInfo?.money_user
            ? Number(userInfo?.money_user).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "0.00"}
        </h3>
        <p className="fs-sm">Total balance</p>
      </div>
      {/* <div className=' nav-bg py-4 flex justify-around'> 
          <div className='text-center'>
           <h4>{userInfo?.totalRecharge?userInfo?.totalRecharge:0}</h4> 
           <p className='fs-sm'>Total deposit amount</p>
          </div>
          <div className='text-center'>
           <h4>{userInfo?.totalWithdraw?userInfo?.totalWithdraw:0}</h4> 
           <p className='fs-sm'>Total withdraw amount</p>
          </div>
        </div> */}

      <div className="container-section mt-3.5">
        <div className="bg-body p-3 rounded-lg">
          <div className="flex  justify-between px-8 pt-4">
            <div className="relative inline-block">
              <FaRegCircle
                className={`${
                  userInfo?.money_user > 0
                    ? "text-[var(--main-color)] "
                    : "wallet-color"
                }  text-[100px]`}
              />
              <span
                className={`absolute gray-100 top-[30%]  ${
                  userInfo?.money_user > 0 ? "left-[30%]" : "left-[40%]"
                } `}
              >
                {userInfo?.money_user > 0 ? "100%" : "0%"}
              </span>
              <p className="text-center text-sm gray-100">
                ₹
                {userInfo?.money_user
                  ? Number(userInfo?.money_user).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}
              </p>
              <p className="text-center fs-sm gray-100">Main Wallet</p>
            </div>
            <div className="relative inline-block">
              <FaRegCircle
                className={`${
                  userInfo?.money_user > 0
                    ? "wallet-color"
                    : " text-[var(--main-color)]"
                }  text-[100px]`}
              />
              <span
                className={`absolute gray-100 top-[30%]  ${
                  userInfo?.money_user > 0 ? "left-[40%]" : "left-[30%]"
                } `}
              >
                {userInfo?.money_user > 0 ? "0%" : "100%"}
              </span>
              <p className="text-center text-sm gray-100">
                ₹{parseFloat(checkBalanceData?.Balance) || 0}
              </p>
              <p className="text-center fs-sm gray-100">3rd party Wallet</p>
            </div>
          </div>
          <button
            className="blue-linear text-white w-full p-1 text-lg font-bold my-3 rounded-full mt-4"
            onClick={handleTransfer}
            disabled={loader}
          >
            {loader ? "Please wait..." : "Main wallet transfer"}
          </button>

          <div className="flex justify-between mt-4 mx-2 mb-3">
            <div onClick={() => navigate("/wallet/Recharge")}>
              <img src={DepositImg} alt="" className="w-12" />
              <p className="fs-sm gray-100 font-light text-center mt-2.5">
                Deposit
              </p>
            </div>
            <div onClick={() => navigate("/wallet/Withdraw")}>
              <img src={WithdrawImg} alt="" className="w-12" />
              <p className="fs-sm gray-100 font-light text-center mt-2.5">
                Withdraw
              </p>
            </div>
            <div onClick={() => navigate("/wallet/RechargeHistory")}>
              <img src={DepositHisImg} alt="" className="w-12" />
              <p className="fs-sm gray-100 font-light text-center mt-2.5">
                Deposit <br /> history
              </p>
            </div>
            <div
              onClick={() => navigate("/wallet/WithdrawalHistory")}
              className="flex flex-col items-center"
            >
              <img src={WithdrawHisImg} alt="" className="w-12" />
              <p className="fs-sm gray-100 font-light text-center mt-2.5">
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
              className={`col-span-4 rounded-md relative bg-light flex flex-col justify-center items-center  py-6 ${
                i === 0 ? "blue-linear text-white" : "gray-50"
              }`}
            >
              <h5 className="heading-h5 fs-sm  mb-3">
                {i === 0
                  ? `₹${Number(userInfo?.money_user)?.toFixed(2)}`
                  : i === 1
                  ? `₹${parseFloat(checkBalanceData?.Balance) || 0}`
                  : item.amount}
              </h5>
              <p className={`fs-sm ${i === 0 ? "" : "gray-100"}`}>
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
    </Layout>
  );
};

export default Wallet;

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
  // {
  //   amount: "0.00",
  //   name: "Wickets9",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "CQ9",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "MG",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "JDM",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "DG",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "CMD",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "Saba",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "EVO_Video",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "JILI",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "Card365",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "VSCard",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "AG_Video",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "PG",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "TB",
  //   Icons: <GiEightBall />,
  // },
  // {
  //   amount: "0.00",
  //   name: "WM_Video",
  //   Icons: <GiEightBall />,
  // },
];
