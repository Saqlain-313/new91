import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { BsPlusSquareDotted } from "react-icons/bs";
import { FaSquare } from "react-icons/fa";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Wallet from "../../assets/balance.png";
import arImage from "../../assets/arimage.png";

import CardImg from "../../assets/card.png";
import RefereshImg from "../../assets/refresh.png";
import UpiImg from "../../assets/upiImg.png";
import USDtImg from "../../assets/usdt.png";
import USDt1Img from "../../assets/usdt1.png";
import CopyCopmponent from "../../components/CopyCopmponent";
import CustomeNavbar from "../../components/CustomeNavbar";
import { userDetail } from "../../store/reducer/authReducer";
import { getBank, withdrawal } from "../../store/reducer/userReducer";
import WithdrawHistoryLite from "./WithdrawHistoryLite";
const AR = "https://ibb.co/67tBK6pt";

const Withdraw = () => {
  const { userInfo, loader } = useSelector((state) => state.auth);
  const { addBankData } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("BANK CARD");
  const [amount, setAmount] = useState("");
  const [copyPopup, setCopyPopup] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [betAlert, setBetAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [password, setPassword] = useState("");
  const { withdrawHistoryData } = useSelector((state) => state.user);
  const [remainingWithdrawals, setRemainingWithdrawals] = useState(null);
  const dispatch = useDispatch();
  const tabs = [
    { label: "BANK CARD", Img: CardImg },
    { label: "USDT", Img: USDtImg },
    { label: "UPI", Img: UpiImg },
  ];

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRefesh = () => {
    setCopyPopup(true);
    dispatch(userDetail());
    setTimeout(() => {
      setCopyPopup(false);
    }, 1500);
  };

  const withdrawSubmit = () => {
    dispatch(
      withdrawal({ money: amount, password: password, type: activeTab }),
    ).then((res) => {
      setSuccessMessage(res.payload.message);
      setBetAlert(true);
      if (res.payload.status) {
        setOpenPopup(false);
        setShowPopup(true);
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

  // ✅ Handle Recharge - Navigate to deposit with 200 pre-filled
  const handleRecharge = () => {
    setOpenPopup(false);
    // Navigate to deposit page with amount 200
    navigate("/wallet/Recharge", { state: { amount: 200 } });
    // Ya agar query parameter use karna hai toh:
    // navigate("/wallet/Deposit?amount=200");
  };

  useEffect(() => {
    dispatch(getBank());
    dispatch(userDetail());
    window.scrollTo(0, 0);
  }, [dispatch]);

  useEffect(() => { }, [addBankData]);

  function accountNumber(phoneNumber) {
    const prefix = phoneNumber.slice(0, 6);
    const suffix = phoneNumber.slice(-3);
    return `${prefix}****${suffix}`;
  }

  function formateUSDT(phoneNumber) {
    const prefix = phoneNumber.slice(0, 6);
    const suffix = phoneNumber.slice(-5);
    return `****${suffix}`;
  }

  useEffect(() => {
    if (Array.isArray(withdrawHistoryData)) {
      const today = new Date().toISOString().split("T")[0];

      const successfulToday = withdrawHistoryData.filter((item) => {
        const itemDate = new Date(item.today).toISOString().split("T")[0];
        return itemDate === today && item.type === activeTab;
      });

      const remaining = 3 - successfulToday.length;
      setRemainingWithdrawals(remaining);
    }
  }, [withdrawHistoryData, activeTab]);

  return (
    <>
      <CustomeNavbar
        name="Withdraw"
        details="Withdraw history"
        link="/wallet/WithdrawalHistory"
      />
      <div className="container-section mt-3">
        <div className="total-img p-4">
          <div className="flex items-center">
            <img src={Wallet} alt="" className="w-4 mr-2 mb-[2px]" />
            <p className="fs-sm">Available balance</p>
          </div>
          <div className="flex items-center ms-2 mt-2">
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
          className={`px-4 py-2 rounded w-full flex items-center mb-3  ${activeTab === "ARPay"
              ? "blue-linear text-white"
              : " text-white"
            }`}
        >
          <img src={arImage} alt="" className="w-12 mr-3" />
          <div className="text-gray-500">
            <h2>ARPay </h2>
            <p className="fs-sm leading-5">
              Support UPI for Fast Payment
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              className={`px-4 py-2 rounded w-28 flex flex-col justify-center items-center ${activeTab === tab.label
                  ? "bg-[#FA6F6B] text-white"
                  : "bg-body gray-50"
                }`}
              onClick={() => setActiveTab(tab.label)}
            >
              <img src={tab.Img} alt="" className="w-10 mb-1" />

              <span className="text-sm">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "ARPay" && (
          <Marquee className="text-[#F5CC2C]">
            Comming soon{" "}
            <Marquee className="text-red-400">Comming soon</Marquee>
          </Marquee>
        )}
        <div className="mt-4">
          {activeTab === "BANK CARD" && (
            <>
              {addBankData?.stk?.length >= 3 ? (
                <Link to="/wallet/Withdraw/bankaccount">
                  <div className="bg-body p-4 rounded-md text-center flex items-center">
                    <div className="flex items-center flex-col mr-3  w-[30%]">
                      <svg data-v-80a607a5 className="svg-icon icon-1">
                        <use xlinkHref="#icon-1" />
                      </svg>
                      <p className="text-sm gray-50 mt-2 flex">
                        {addBankData?.name_bank.substring(0, 10)}...
                      </p>
                    </div>

                    <div className="border-l flex justify-between  items-center pl-5 w-[70%]">
                      <p className="text-sm gray-50 mt-1">
                        {accountNumber(addBankData?.stk)}
                      </p>

                      <div>
                        <MdOutlineArrowForwardIos className="text-xl gray-50" />
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div
                  className="bg-body p-4 rounded-md text-center"
                  onClick={() => navigate("/wallet/Withdraw/AddBankCard")}
                >
                  <p className="text-center flex justify-center text-4xl gray-50">
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
              <div className="bg-body mt-2 p-3 rounded-md pb-10">
                <div className="bgs-body flex items-center px-5 py-1 rounded-full">
                  <span className="text-[#FB5959] text-lg font-bold">₹</span>
                  <form autoComplete="off">
                    <input
                      type="number"
                      name="amount_no_autofill_123"
                      autoComplete="off"
                      inputMode="numeric"
                      autoCorrect="off"
                      spellCheck="false"
                      className="w-full bgs-body p-2 ps-6 flex items-center focus:outline-none color-blue placeholder:text-sm placeholder:text-[#FB5959]"
                      placeholder="Please enter the withdrawal amount"
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
                <div className="flex justify-between mt-2">
                  <p className="fs-sm gray-50">
                    Withdrawable balance{" "}
                    <span className="color-yellow-200">
                      ₹
                      {(
                        Number(userInfo?.money_user) -
                        Number(userInfo?.recharge)
                      ).toFixed(2)}
                    </span>
                  </p>
                  <button
                    className="border rounded-md border-[var(--main-color)] text-blue px-5 py-1 fs-sm pt-1"
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
                  <p className="fs-sm gray-50">Withdrawable amount received </p>
                  <span className="color-yellow-200 text-base font-bold">
                    ₹{Number(amount).toFixed(2)}{" "}
                  </span>
                </div>
                <button
                  className=" bg-gray-300 border border-gray-300  w-full rounded-full p-2 mt-4 text-whites"
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
                <div className="bg-body p-2 rounded-md text-center flex items-center">
                  <div className="flex items-center flex-col mr-3  w-[30%]">
                    <div className="flex ">
                      <img src={USDt1Img} alt="" className="w-6 mr-2" />
                      <p>TRC</p>
                    </div>
                    <p className="text-sm gray-50 flex">
                      {formateUSDT(addBankData?.sdt)}
                    </p>

                    <p className="text-sm gray-50 flex">
                      {addBankData?.remarkType?.substring(0, 10)}...
                    </p>
                  </div>

                  <div className="flex justify-end  items-center pl-5 w-[70%]">
                    <MdOutlineArrowForwardIos className="text-xl gray-50" />
                    <div></div>
                  </div>
                </div>
              ) : (
                <div
                  className="bg-body p-4 rounded-md text-center"
                  onClick={() => navigate("/wallet/Withdraw/AddUSDT")}
                >
                  <p className="text-center flex justify-center text-4xl gray-50">
                    {" "}
                    <BsPlusSquareDotted />
                  </p>
                  <p className="text-sm gray-text mt-5">Add address</p>
                </div>
              )}

              <div className="bg-body mt-2 p-3 rounded-md pb-10">
                <div className="flex items-center mb-2">
                  <img src={USDt1Img} alt="" className="w-6 mr-2" />{" "}
                  <h3 className="heading-h3 gray-50">Select amount of USDT</h3>
                </div>
                <div className="bgs-body flex items-center px-5 py-1 rounded-lg">
                  <span className="text-blue text-lg font-bold">₹</span>
                  <input
                    type="number"
                    className="w-full  bgs-body  p-2  ps-6 flex items-center  focus:outline-none text-blue placeholder:text-sm placeholder:text-[#F5CC2C]"
                    placeholder="Please enter withdrawal amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="bgs-body flex items-center px-5 py-1 rounded-lg mt-3">
                  <img src={USDt1Img} alt="" className="w-5" />
                  <input
                    type="number"
                    className="w-full  bgs-body  p-2  ps-6 flex items-center  focus:outline-none text-blue placeholder:text-sm placeholder:text-[#F5CC2C]"
                    placeholder="Please enter USDT amount"
                    value={Number(Number(amount) / 94).toFixed(2)}
                    onChange={(e) => setAmount(e.target)}
                  />
                </div>

                <div className="flex justify-between mt-2">
                  <p className="fs-sm gray-50 text-blue">
                    Withdrawable balance{" "}
                    <span className="color-yellow-200">
                      ₹
                      {(
                        Number(userInfo.money_user) - Number(userInfo?.recharge)
                      ).toFixed(2)}
                    </span>
                  </p>
                  <button
                    className="border rounded-md border-[var(--main-color)] text-blue px-4 py-2 fs-sm"
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
                  className="bg-gray-300  w-full rounded-full p-2 mt-4 text-whites"
                  onClick={() => setOpenPopup(true)}
                >
                  Withdraw
                </button>
              </div>
            </>
          )}
        </div>
        {activeTab === "UPI" && (
          <>
            {addBankData?.upi?.length >= 3 ? (
              <Link to={"/wallet/Withdraw/Upi"}>
                <div className="bg-body p-4 rounded-md text-center flex items-center">
                  <div className="flex flex-col mr-3 w-full">
                    <div className="flex items-center mb-2">
                      <img
                        src="https://i.ibb.co/fzBy6hcq/upi-3f9883de.webp"
                        alt="upi"
                        className="w-14"
                      />
                      <span className="ml-3 text-black font-medium">
                        Upi Recipient
                      </span>
                    </div>

                    <div className="flex text-sm text-gray-500">
                      <p className="truncate">{addBankData?.upiName}</p>
                      <p>{addBankData?.upi?.substring(0, 15)}...</p>
                    </div>
                  </div>

                  <div className="flex justify-end items-center pl-5 w-[70%]">
                    <MdOutlineArrowForwardIos className="text-xl gray-50" />
                  </div>
                </div>
              </Link>
            ) : (
              <div
                className="bg-body p-4 rounded-md text-center"
                onClick={() => navigate("/wallet/Withdraw/Upi?type=Add")}
              >
                <p className="text-center flex justify-center text-4xl gray-50">
                  <BsPlusSquareDotted />
                </p>
                <p className="text-sm gray-text mt-5">Add UPI</p>
              </div>
            )}

            <div className="bg-body mt-2 p-3 rounded-md pb-10">
              <div className="bgs-body flex items-center px-5 py-1 rounded-lg">
                <span className="text-blue text-lg font-bold">₹</span>
                <input
                  type="number"
                  className="w-full bgs-body p-2 ps-6 flex items-center focus:outline-none text-blue placeholder:text-sm placeholder:text-[#FA6F6B]"
                  placeholder="Please enter withdrawal amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="flex justify-between mt-2">
                <p className="fs-sm gray-50">
                  Withdrawable balance{" "}
                  <span className="color-yellow-200">
                    ₹
                    {(
                      Number(userInfo?.money_user) - Number(userInfo?.recharge)
                    ).toFixed(2)}
                  </span>
                </p>
                <button
                  className="border rounded-md border-[var(--main-color)] text-blue px-5 py-[2px] fs-sm"
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
                <p className="fs-sm gray-50">Withdrawable amount received </p>
                <span className="color-yellow-200 text-base font-bold">
                  ₹{Number(amount).toFixed(2)}
                </span>
              </div>

              <button
                className="bg-gray-300 w-full rounded-full p-2 mt-4 text-whites"
                onClick={() => setOpenPopup(true)}
              >
                Withdraw
              </button>
            </div>
          </>
        )}

        <div className="bg-body  px-2 pb-5 rounded-b-md">
          <ul>
            <li className=" flex">
              <FaSquare className="rotate-45 text-[7px] text-blue mr-2 mt-[2px]" />
              <p className="fs-sm gray-50  leading-[18px]">
                Need to bet{" "}
                <span className="color-red-200">
                  ₹{Number(userInfo?.recharge).toFixed(2)}
                </span>{" "}
                to be able to withdraw
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] text-blue mr-2 mt-[2px]" />
              </span>
              <p className="fs-sm gray-50 leading-[18px] ">
                With time{" "}
                <span className="color-red-200">00:00-23:59</span>{" "}
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] text-blue mr-2 mt-[2px]" />
              </span>
              <p className="fs-sm gray-50 leading-[18px]">
                Inday Remaining Withdrawal Times{" "}
                <span className="color-red-200">
                  {" "}
                  {remainingWithdrawals !== null
                    ? remainingWithdrawals
                    : "Loading..."}
                </span>{" "}
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px]  text-blue mr-2 mt-[2px]" />
              </span>
              <p className="fs-sm gray-50 leading-[18px] ">
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
                <FaSquare className="rotate-45 text-[7px]  text-blue mr-2 mt-[2px]" />
              </span>
              <p className="fs-sm gray-50 leading-[18px] ">
                {" "}
                Please confirm your beneficial account information before
                withdrawing. If your information is incorrect, our company will
                not be liable for the amount of loss
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px]  text-blue mr-2 mt-[2px]" />
              </span>
              <p className="fs-sm gray-50 leading-[18px] ">
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

      {/* ✅ Recharge Popup - Directly in page */}
      <div
        className={`fixed inset-0 z-[50] flex items-center justify-center ${openPopup ? "flex" : "hidden"
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setOpenPopup(false)}
        ></div>

        {/* Popup Card */}
        <div className="relative bg-white rounded-3xl w-[90%] max-w-[380px] p-6 shadow-2xl">
          {/* Close Button */}
          <button
            onClick={() => setOpenPopup(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>

          {/* Title */}
          <h3 className="text-center text-gray-700 text-lg font-semibold mt-2">
            Withdrawal is open
          </h3>

          {/* Subtitle */}
          <p className="text-center text-gray-500 text-sm mt-1">
            Required 200 to activate it
          </p>

          {/* Amount Display */}
          <div className="text-center mt-6">
            <span className="text-black text-3xl font-bold">₹</span>
            <span className="text-black text-3xl font-bold ml-1">200</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              className="flex-1 py-3 bg-gray-700/50 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
              onClick={() => setOpenPopup(false)}
            >
              Cancel
            </button>
            <button
              className="flex-1 py-3 bg-[#03e787] text-white rounded-xl font-medium transition-colors "
              onClick={handleRecharge}
            >
              Recharge
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex z-20 items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 px-8 rounded-lg text-center relative">
            <img
              src="https://i.ibb.co/4RsybQgG/popup-img-01.png"
              alt=""
              className="w-32 flex justify-center items-center m-auto absolute -top-6 left-0 right-0"
            />
            <h2 className="text-black font-semibold text-xl mt-4 pt-10">
              Withdrawal request successful
            </h2>
            <p className="text-sm gray-50 pt-2">
              We will complete the withdrawal with 3 hours
            </p>
            <p className="text-sm gray-50">Please wait petiently...</p>
            <div className="mt-6 gap-3 flex flex-col">
              <button
                onClick={() => {
                  navigate("/wallet/WithdrawalHistory");
                  setShowPopup(false);
                }}
                className="px-4 py-2 blue-linear font-medium color-orange rounded-full"
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
