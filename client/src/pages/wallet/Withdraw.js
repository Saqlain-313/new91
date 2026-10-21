import { useEffect, useState } from "react";
import { BsPlusSquareDotted, BsShieldFillCheck } from "react-icons/bs";
import { FaSquare } from "react-icons/fa";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CardImg from "../../assets/card.png";
import RefereshImg from "../../assets/refresh.png";
import USDtImg from "../../assets/usdt.png";
import USDt1Img from "../../assets/usdt1.png";
import CopyCopmponent from "../../components/CopyCopmponent";
import { withdrawalHistory } from "../../store/reducer/userReducer";

import Marquee from "react-fast-marquee";
import { IoMdClose } from "react-icons/io";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import { TbLockFilled } from "react-icons/tb";
import CustomeNavbar from "../../components/CustomeNavbar";
import ServiceRotate from "../../components/ServiceRotate";
import { userDetail } from "../../store/reducer/authReducer";
import { getBank, withdrawal } from "../../store/reducer/userReducer";
import WithdrawHistoryLite from "./WithdrawHistoryLite";
const AR = "https://i.ibb.co/DPSRWVbF/pay-Name-Icon.png";

const Withdraw = () => {
  const { userInfo, loader } = useSelector((state) => state.auth);
  const { addBankData } = useSelector((state) => state.user);
  const { withdrawHistoryData } = useSelector((state) => state.user);

  console.log("withdrawHistoryData", withdrawHistoryData);

  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("BANK CARD");
  const [amount, setAmount] = useState();
  const [copyPopup, setCopyPopup] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [betAlert, setBetAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [remainingWithdrawals, setRemainingWithdrawals] = useState(null);
  const [password, setPassword] = useState("");
  const [insufficientTurnover, setInsufficientTurnover] = useState(false);
  const dispatch = useDispatch();
  const tabs = [
    { label: "BANK CARD", Img: CardImg },
    { label: "USDT", Img: USDtImg },
  ];

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (Array.isArray(withdrawHistoryData)) {
      const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

      const successfulToday = withdrawHistoryData.filter((item) => {
        const itemDate = new Date(item.today).toISOString().split("T")[0];
        return itemDate === today;
      });
      // console.log("first",successfulToday)
      const remaining = 3 - successfulToday.length;
      setRemainingWithdrawals(remaining);
    }
  }, [withdrawHistoryData]);

  const handleRefesh = () => {
    setCopyPopup(true);
    dispatch(userDetail());
    setTimeout(() => {
      setCopyPopup(false);
    }, 1500);
  };

  const withdrawSubmit = () => {
    // Check if bet amount is zero
    // if (Number(userInfo?.recharge) > 0) {
    //   setInsufficientTurnover(true);
    //   setTimeout(() => setInsufficientTurnover(false), 3000);
    //   return;
    // }

    dispatch(
      withdrawal({ money: amount, password: password, type: activeTab }),
    ).then((res) => {
      setSuccessMessage(res.payload.message);
      setBetAlert(true);
      if (res.payload.status) {
        setOpenPopup(false);
        setShowPopup(true);
        // Add navigation to withdrawal history after successful withdrawal
        setTimeout(() => {
          navigate("/wallet/WithdrawalHistory");
        }, 2000);
      }
    });
    dispatch(userDetail());
    setTimeout(() => {
      setBetAlert(false);
    }, 2000);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  useEffect(() => {
    dispatch(getBank());
    dispatch(userDetail());
    dispatch(withdrawalHistory());
    window.scrollTo(0, 0);
  }, [dispatch]);

  useEffect(() => {}, [addBankData]);

  function accountNumber(phoneNumber) {
    const prefix = phoneNumber.slice(0, 6); // '987'
    const suffix = phoneNumber.slice(-3); // '211'
    return `${prefix}****${suffix}`;
  }

  function formateUSDT(phoneNumber) {
    const prefix = phoneNumber.slice(0, 6); // '987'
    const suffix = phoneNumber.slice(-5); // '211'
    return `****${suffix}`;
  }

  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    if (activeTab === "ARPay") {
      setShowComingSoon(true);
    } else {
      setShowComingSoon(false);
    }
  }, [activeTab]);

  const handleClose = () => {
    setShowPopup(false);
    navigate("/wallet/WithdrawalHistory");
  };

  return (
    <>
      <CustomeNavbar
        name="Withdraw"
        details="Withdraw history"
        link="/wallet/WithdrawalHistory"
      />
      <ServiceRotate />
      <div className="container-section rounded mt-3">
        <div className="total-img rounded p-4">
          <div className="flex items-center">
            {/* <img src="https://i.ibb.co/tMyLSYzh/background1.png" alt="" className="w-4 mr-2 mb-[2px]" /> */}
            <p className="fs-sm mt-2 ml-7">Available balance</p>
          </div>
          <div className="flex items-center ms-2 mt-4 ">
            <h3 className="heaing-h3 text-xl font-bold">
              ₹{" "}
              {userInfo?.money_user
                ? Number(userInfo?.money_user).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0.00"}
            </h3>
            <img
              src={RefereshImg}
              alt=""
              className="w-5 ms-2 mb-[2px]"
              onClick={handleRefesh}
            />
          </div>
        </div>
        <div
          onClick={() => setActiveTab("ARPay")}
          className={`px-4 py-2 rounded w-full flex items-center mb-3  ${
            activeTab === "ARPay"
              ? "blue-linear  text-black"
              : "nav-bg text-whites "
          }`}
        >
          <img src={AR} alt="" className="w-12 mr-3" />
          <div>
            <h2>ARPay </h2>
            <p className="fs-sm leading-5">
              Supports UPI for fast payment, and bunuses for withdrawals{" "}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              className={`px-4 py-2 rounded w-28 flex flex-col justify-center items-center ${
                activeTab === tab.label
                  ? "blue-linear  text-black"
                  : "nav-bg text-whites"
              }`}
              onClick={() => setActiveTab(tab.label)}
            >
              <img src={tab.Img} alt="" className="w-10 mb-1" />
              <span
                className={activeTab === tab.label ? "text-sm" : " text-sm"}
              >
                {" "}
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "ARPay" && (
          <Marquee className="text-white">
            Comming soon{" "}
            <Marquee className="text-red-400">Comming soon</Marquee>
          </Marquee>
        )}
        {showComingSoon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="relative blue-linear rounded-2xl p-6 w-[90%] max-w-sm shadow-lg text-center ">
              {/* Cut icon top right */}
              <button
                onClick={() => setShowComingSoon(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              >
                <IoMdClose size={24} />
              </button>

              <h2 className="text-xl font-bold text-[#FF3366] mb-2">
                🚧 Coming Soon 🚧
              </h2>
              <p className="text-sm text-gray-700 mb-3">
                The ARPay feature is under development. Stay tuned!
              </p>

              {/* Marquee for animation */}
              <div className=" rounded-md overflow-hidden mb-4">
                <Marquee
                  speed={50}
                  gradient={false}
                  className="text-pink-600 font-semibold text-sm py-1"
                >
                  💡 ARPay is launching soon! 💡 Get ready for an awesome
                  experience!
                </Marquee>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => setShowComingSoon(false)}
                className="px-4 py-1 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-md hover:from-pink-600 hover:to-red-600"
              >
                Conform
              </button>
            </div>
          </div>
        )}

        <div className="mt-4">
          {activeTab === "BANK CARD" && (
            <>
              {addBankData?.stk?.length >= 3 ? (
                <Link to="/wallet/Withdraw/bankaccount">
                  <div className="nav-bg p-4 rounded-md text-center flex items-center">
                    <div className="flex items-center flex-col mr-3  w-[30%]">
                      <svg data-v-80a607a5 className="svg-icon icon-1">
                        <use xlinkHref="#icon-1" />
                      </svg>
                      <p className="text-sm text-whites mt-2 flex">
                        {addBankData?.name_bank.substring(0, 10)}...
                      </p>
                    </div>

                    <div className="border-l flex justify-between  items-center pl-5 w-[70%]">
                      <p className="text-sm text-whites mt-1">
                        {accountNumber(addBankData?.stk)}
                      </p>

                      <div>
                        <MdOutlineArrowForwardIos className="text-xl text-whites" />
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div
                  className="nav-bg p-4 rounded-md text-center"
                  onClick={() => navigate("/wallet/Withdraw/AddBankCard")}
                >
                  <p className="text-center flex justify-center text-4xl text-whites">
                    {" "}
                    <BsPlusSquareDotted />
                  </p>
                  <p className="text-sm gray-text mt-5">
                    Add a bank account number
                  </p>
                </div>
              )}
              {addBankData?.stk?.length >= 3 ? (
                ""
              ) : (
                <p className="color-red-200 fs-sm text-center my-2">
                  Need to add beneficiary information to be able to withdraw
                  money
                </p>
              )}
              <div className="nav-bg mt-2 p-3 rounded-t-md pb-10">
                <div className="bgs-body flex items-center px-5 py-1 rounded-full">
                  <span className="color-blue text-lg font-bold">₹</span>
                  {console.log("ddd", amount)}
                  <form autoComplete="off">
                    <input
                      type="number"
                      name="amount_no_autofill_123" // Random name prevents browser detection
                      autoComplete="off" // Turns off autocomplete
                      inputMode="numeric" // Numeric keyboard on mobile
                      autoCorrect="off"
                      spellCheck="false"
                      className="w-full bgs-body p-2 ps-6 flex items-center focus:outline-none color-blue placeholder:text-sm placeholder:text-[var(--bgblue)]"
                      placeholder="Please enter the amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      onFocus={(e) => {
                        const val = e.target.value;
                        e.target.value = "";
                        e.target.value = val;
                      }}
                    />
                  </form>
                </div>
                {insufficientTurnover && (
                  <p className="color-red-200 text-start mt-2 fs-sm">
                    Insufficient turnover
                  </p>
                )}
                <div className="flex justify-between mt-4">
                  <p className="fs-sm text-whites">
                    Withdrawable balance{" "}
                    <span className="color-yellow-200">
                      ₹
                      {Number(userInfo?.recharge) > 0
                        ? "0.00"
                        : (
                            Number(userInfo?.money_user) -
                            Number(userInfo?.recharge)
                          ).toFixed(2)}
                    </span>
                  </p>
                  <button
                    className="border rounded-md border-[var(--bgblue)] color-blue px-5 py-[2px] fs-sm"
                    onClick={() =>
                      setAmount(
                        Math.round(
                          Number(userInfo?.money_user) -
                            Number(userInfo?.recharge),
                        ),
                      )
                    }
                  >
                    All
                  </button>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="fs-sm text-whites">
                    Withdrawable amount received{" "}
                  </p>
                  <span className="color-yellow-200 text-base font-bold">
                    ₹
                    {Number(amount).toFixed(2) == "NaN"
                      ? "0.00"
                      : Number(amount).toFixed(2)}
                  </span>
                </div>
                <button
                  className="blue-linear  w-full rounded-full p-2 mt-4 text-black"
                  onClick={() => setOpenPopup(true)}
                >
                  Withdraw
                </button>
              </div>
            </>
          )}

          {activeTab === "USDT" && (
            <>
              {addBankData?.sdt?.length >= 3 ? (
                <div className="nav-bg p-2 rounded-md text-center flex items-center">
                  <div className="flex items-center flex-col mr-3  w-[30%]">
                    <div className="flex ">
                      <img src={USDt1Img} alt="" className="w-6 mr-2" />
                      <p>TRC</p>
                    </div>
                    <p className="text-sm text-whites flex">
                      {formateUSDT(addBankData?.sdt)}
                    </p>

                    <p className="text-sm text-whites flex">
                      {addBankData?.remarkType?.substring(0, 10)}...
                    </p>
                  </div>

                  <div className="flex justify-end  items-center pl-5 w-[70%]">
                    <MdOutlineArrowForwardIos className="text-xl text-whites" />
                    <div></div>
                  </div>
                </div>
              ) : (
                <div
                  className="nav-bg p-4 rounded-md text-center"
                  onClick={() => navigate("/wallet/Withdraw/AddUSDT")}
                >
                  <p className="text-center flex justify-center text-4xl text-whites">
                    {" "}
                    <BsPlusSquareDotted />
                  </p>
                  <p className="text-sm gray-text mt-5">Add address</p>
                </div>
              )}

              <div className="nav-bg mt-2 p-3 rounded-md pb-10">
                <div className="flex items-center mb-2">
                  <img src={USDt1Img} alt="" className="w-6 mr-2" />{" "}
                  <h3 className="heading-h3 gray-50">Select amount of USDT</h3>
                </div>
                <div className="bgs-body flex items-center px-5 py-1 rounded-lg">
                  <span className="color-blue text-lg font-bold">₹</span>
                  <input
                    type="number"
                    className="w-full  bgs-body  p-2  ps-6 flex items-center  focus:outline-none color-blue placeholder:text-sm placeholder:text-[var(--bgblue)]"
                    placeholder="Please enter withdrawal amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="bgs-body flex items-center px-5 py-1 rounded-lg mt-3">
                  <img src={USDt1Img} alt="" className="w-5" />
                  <input
                    type="number"
                    className="w-full  bgs-body  p-2  ps-6 flex items-center  focus:outline-none color-blue placeholder:text-sm placeholder:text-[var(--bgblue)]"
                    placeholder="Please enter USDT amount"
                    value={Number(Number(amount) / 94).toFixed(2)}
                    onChange={(e) => setAmount(e.target)}
                  />
                </div>
                {insufficientTurnover && (
                  <p className="color-red-200 text-start mt-2 fs-sm">
                    Insufficient turnover
                  </p>
                )}

                <div className="flex justify-between mt-2">
                  <p className="fs-sm text-whites color-blue">
                    Withdrawable balance{" "}
                    <span className="color-yellow-200">
                      ₹
                      {Number(userInfo?.recharge) > 0
                        ? "0.00"
                        : (
                            Number(userInfo?.money_user) -
                            Number(userInfo?.recharge)
                          ).toFixed(2)}
                    </span>
                  </p>
                  <button
                    className="border rounded-md border-[var(--bgblue)] color-blue px-5 py-[2px] fs-sm"
                    onClick={() =>
                      setAmount(
                        Math.round(
                          Number(userInfo?.money_user) -
                            Number(userInfo?.recharge),
                        ),
                      )
                    }
                  >
                    All
                  </button>
                </div>

                <button
                  className="blue-linear  w-full rounded-full p-2 mt-4 text-black"
                  onClick={() => {
                    if (Number(userInfo?.recharge) > 0) {
                      setInsufficientTurnover(true);
                    } else {
                      setOpenPopup(true);
                    }
                  }}
                >
                  Withdraw
                </button>
              </div>
            </>
          )}
        </div>

        <div className="nav-bg  px-2 pb-5 rounded-b-md">
          <ul className="border border-gray-600 p-2 rounded-md">
            <li className=" flex">
              <FaSquare className="rotate-45 text-[7px] color-blue mr-2 mt-[2px]" />
              <p className="fs-sm text-whites  leading-[18px]">
                Need to bet{" "}
                <span className="color-red-200">
                  ₹{Number(userInfo?.recharge).toFixed(2)}
                </span>{" "}
                to be able to withdraw
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] color-blue mr-2 mt-[2px]" />
              </span>
              <p className="fs-sm text-whites leading-[18px] ">
                With time{" "}
                <span className="color-red-200">00:00-23:59</span>{" "}
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] color-blue mr-2 mt-[2px]" />
              </span>

              <p className="fs-sm text-whites leading-[18px]">
                Inday Remaining Withdrawal Times{" "}
                <span className="color-red-200">
                  {remainingWithdrawals !== null
                    ? remainingWithdrawals
                    : "Loading..."}
                </span>
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px]  color-blue mr-2 mt-[2px]" />
              </span>
              <p className="fs-sm text-whites leading-[18px] ">
                Withdrawal amount range{" "}
                <span className="color-red-200">
                  {" "}
                  {activeTab === "USDT"
                    ? "₹1000.00-₹1,000,000.00"
                    : "₹110.00-₹150,000.00"}
                </span>{" "}
              </p>
            </li>
            <li className="flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px]  color-blue mr-2 mt-[2px]" />
              </span>
              <p className="fs-sm text-whites leading-[18px] ">
                {" "}
                Please confirm your beneficial account information before
                withdrawing. If your information is incorrect, our company will
                not be liable for the amount of loss
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px]  color-blue mr-2 mt-[2px]" />
              </span>
              <p className="fs-sm text-whites leading-[18px] ">
                {" "}
                If your beneficial information is incorrect, please contact
                customer service
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div>
        <WithdrawHistoryLite />
      </div>

      <div className={openPopup ? "overlay-section block" : "hidden"}></div>
      <div className={showPopup ? "overlay-section block" : "hidden"}></div>

      <div
        className={`nav-bg z-[12] items-center transition ease-in-out delay-150 justify-center fixed bottom-0 rounded-t-md filter-section w-[25rem] ${
          openPopup ? "flex" : "hidden"
        }`}
      >
        <div className="rounded-t-lg overflow-hidden w-full">
          <div className="container-section mb-5 mt-4 px-2">
            <div className="flex items-center justify-between border-b border-gray-600 pb-3">
              <h3 className="heading-h3 flex items-center font-sans ms-1 gray-5">
                <BsShieldFillCheck className="color-blue-500 text-xl mr-2" />
                Security verification
              </h3>
              <RxCross1
                className="cursor-pointer text-xl"
                onClick={() => setOpenPopup(false)}
              />
            </div>

            <div className="mt-4 rounded-full">
              <div className="flex items-center">
                <span>
                  <TbLockFilled className="color-blue-500 text-2xl" />
                </span>
                <label htmlFor="" className="font-sans ms-1 gray-50 mb-2">
                  Password
                </label>
              </div>
              <div className="mt-3 flex justify-between relative mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  className="w-full bg-popup-nav border border-slate-900 rounded-lg p-2 py-3 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none placeholder:text-sm placeholder:text-slate-500"
                  placeholder=" Password"
                />
                <span
                  onClick={toggleShowPassword}
                  className="absolute right-4 text-lg top-4 gray-50 cursor-pointer"
                >
                  {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </span>
              </div>
            </div>

            <p className="text-sm color-red-200 py-2">
              Please secure your balance, please enter your password
            </p>
            <div className="flex items-center justify-between">
              <Link to="/forgot" className="text-white text-base">
                Forget Password?
              </Link>
              <Link to={userInfo?.telegram} className="gray-50 text-sm">
                Customer care service
              </Link>
            </div>
          </div>

          {/* Buttons */}

          <div className="flex ">
            <button
              className=" w-[50%]  border-2 border-[#22D0D2] p-2 "
              onClick={() => setOpenPopup(false)}
            >
              Return
            </button>
            <button
              className={` w-[50%] p-2 text-black
             blue-linear
              `}
              disabled={loader ? true : false}
              onClick={() => {
                withdrawSubmit(); // your function
                setOpenPopup(false); // auto close popup
              }}
            >
              Confirm Withdrawal
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex z-20 items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 px-8 rounded-lg text-center relative">
            <img
              src="https://i.ibb.co/4RsybQgG/popup-img-01.png"
              alt=""
              className="w-32 flex justify-center items-center m-auto absolute -top-6 left-0 right-0"
            />
            <h2 className="text-white font-semibold text-xl mt-4 pt-10">
              Withdrawal request successful
            </h2>
            <p className="text-sm gray-50 pt-2">
              We will complete the withdrawal with 3 hours
            </p>
            <p className="text-sm gray-50">Please wait petiently...</p>
            <div className="mt-6 gap-3 flex flex-col">
              <button
                onClick={() => {
                  setShowPopup(false);
                  navigate("/wallet/WithdrawalHistory");
                }}
                className="px-4 py-2 blue-linear font-medium text-black rounded-full"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`place-bet-popup ${betAlert ? "active" : ""}`}>
        <div className="text-sm">{successMessage} </div>
      </div>
      <CopyCopmponent copyPopup={copyPopup} message="Refesh successfully" />
    </>
  );
};

export default Withdraw;
