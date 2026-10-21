import { Fragment, useEffect, useState } from "react";
import { FaSquare } from "react-icons/fa";
import { GiSwipeCard, GiWhiteBook } from "react-icons/gi";
import { IoMdWallet } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import bonus from "../../assets/gift.png";
import UpiIcon from "../../assets/mp1.png";
import PaytmIcon from "../../assets/qr2.png";
import RefereshImg from "../../assets/refresh.png";
import EWalletIcon from "../../assets/upi1.png";
import UsdtIcon from "../../assets/usdt.png";
import USDt1Img from "../../assets/usdt1.png";
import CopyCopmponent from "../../components/CopyCopmponent";
import { userDetail } from "../../store/reducer/authReducer";
import {
  bannerGet,
  recharge,
  zilpayRecharge,
} from "../../store/reducer/userReducer";

import { useDispatch, useSelector } from "react-redux";
import AlertCopmponent from "../../components/AlertComponent";
import CustomeNavbar from "../../components/CustomeNavbar";
import DepositHistoryLite from "./DepositHistoryLite";

const AR = "https://i.ibb.co/DPSRWVbF/pay-Name-Icon.png";
export default function Recharge() {
  const { bannergetData } = useSelector((state) => state.user);
  const { userInfo, loader } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [amount, setAmount] = useState();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Online Pay");
  const [activeTab2, setActiveTab2] = useState("LuckyPay-APP");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copyPopup, setCopyPopup] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [alertsuccess, setAlertsuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const tabs = [
    { label: "Online Pay", Icons: EWalletIcon, g: false },
    { label: "NOW UPI", Icons: PaytmIcon, g: false },
    { label: "QR Pay", Icons: UpiIcon, g: false },
    { label: "USDT", Icons: UsdtIcon, g: true },
    { label: "ARPay", Icons: AR, g: false },
  ];

  const handleSubmit = async () => {
    const type = activeTab2;
    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("type", activeTab2);
    formData.append("detail", type);

    if (activeTab === "Online Pay") {
      if (bannergetData.chennal.status1 == 1) {
        dispatch(zilpayRecharge({ amount, type })).then((res) => {
          setSuccessMessage(res.payload.message);
          if (res.payload.status) {
            setAlertsuccess(true);
            // Redirect to the URL provided in the response
            window.location.href = res.payload.data.url;
          } else {
            setAlerts(true);
          }
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        });
      } else {
        dispatch(recharge(formData)).then((res) => {
          setSuccessMessage(res.payload.message);
          if (res.payload.status) {
            setAlertsuccess(true);
            navigate("/wallet/Recharge/pay3");
          } else {
            setAlerts(true);
          }
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        });
      }
    } else if (activeTab === "NOW UPI") {
      if (bannergetData.chennal.status2 == 1) {
        dispatch(zilpayRecharge({ amount, type })).then((res) => {
          setSuccessMessage(res.payload.message);
          if (res.payload.status) {
            setAlertsuccess(true);
            // Redirect to the URL provided in the response
            window.location.href = res.payload.data.url;
          } else {
            setAlerts(true);
          }
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        });
      } else {
        dispatch(recharge(formData)).then((res) => {
          setSuccessMessage(res.payload.message);
          if (res.payload.status) {
            setAlertsuccess(true);
            navigate("/wallet/Recharge/pay3");
          } else {
            setAlerts(true);
          }
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        });
      }
    } else {
      if (bannergetData.chennal.status3 == 1) {
        dispatch(zilpayRecharge({ amount, type })).then((res) => {
          setSuccessMessage(res.payload.message);
          if (res.payload.status) {
            setAlertsuccess(true);
            // Redirect to the URL provided in the response
            window.location.href = res.payload.data.url;
          } else {
            setAlerts(true);
          }
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        });
      } else {
        dispatch(recharge(formData)).then((res) => {
          setSuccessMessage(res.payload.message);
          if (res.payload.status) {
            setAlertsuccess(true);
            navigate("/wallet/Recharge/pay3");
          } else {
            setAlerts(true);
          }
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        });
      }
    }
  };

  const handleSubmitUSDT = async () => {
    const type = "USDT";
    const formData = new FormData();
    formData.append("amount", amount * 93);
    formData.append("type", type);
    dispatch(recharge(formData)).then((res) => {
      setSuccessMessage(res.payload.message);
      if (res.payload.status) {
        setAlertsuccess(true);
        navigate("/wallet/Recharge/usdt");
      } else {
        setAlerts(true);
      }
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    });
  };

  const handleRefesh = () => {
    setCopyPopup(true);
    dispatch(userDetail());
    setTimeout(() => {
      setCopyPopup(false);
    }, 1500);
  };
  useEffect(() => {
    dispatch(userDetail());
    dispatch(bannerGet());
    setTimeout(() => {
      setAlerts(false);
      setAlertsuccess(false);
    }, 2000);
    window.scrollTo(0, 0);
  }, [dispatch, userInfo?.length, successMessage, alerts, alertsuccess]);

  // Inside your Recharge component, before the return statement:

  const selectedchennalGroup = chennals.find(
    (chennal) => chennal.label === activeTab,
  );

  const selectedchennalItem = selectedchennalGroup?.chennalItem.find(
    (item) => item.label === activeTab2,
  );

  return (
    <>
      <CustomeNavbar
        name="Deposit"
        details="Deposit history"
        link="/wallet/RechargeHistory"
      />

      <div className="container-section mt-5  text-white ">
        <div className="total-img rounded p-4">
          <div className="flex items-center">
            {/* <img src="https://i.ibb.co/tMyLSYzh/background1.png" alt="" className="w-4 mr-2 mb-[2px]" /> */}
            <p className="fs-sm text-white ml-7 mt-2 ">Balance</p>
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

        <div className="grid grid-cols-12 gap-2 mt-2">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              className={`col-span-3 py-5 nav-bg gray-text relative text-sm flex justify-center flex-col items-center rounded ${
                activeTab === tab.label
                  ? "blue-linear text-black"
                  : "nav-bg gray-text"
              }`}
              onClick={() => {
                setActiveTab(tab.label); // Update the active tab
                setActiveIndex(0); // Reset index to 0
                const firstchennal = chennals.find(
                  (chennal) => chennal.label === tab.label,
                ); // Find the matching chennal
                if (firstchennal && firstchennal.chennalItem.length > 0) {
                  setActiveTab2(firstchennal.chennalItem[0].label); // Update setActiveTab2 to the first item's label
                }
              }}
            >
              <img src={tab.Icons} alt="" className="w-10" />
              <span> {tab.label}</span>
              {tab.g && (
                <span
                  className="absolute top-0 w-[37px] h-[35px]  right-0 bg-cover bg-center text-white text-[11px] pt-[10px]  "
                  style={{ backgroundImage: `url(${bonus})` }}
                >
                  2%
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <>
            {/* {activeTab === "ARPay" && (<Marquee className="text-white">Comming soon <Marquee className="text-red-400">Comming soon</Marquee></Marquee>)} */}
            {activeTab === "ARPay" && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 ">
                <div className=" text-center p-6 blue-linear rounded-xl shadow-xl w-[90%] max-w-sm ">
                  <h2 className="text-2xl font-bold text-blue-900 mb-2">
                    🚧 Coming Soon!
                  </h2>
                  <p className="text-gray-700">
                    This feature is under development. Stay tuned!
                  </p>
                  <button
                    onClick={() => setActiveTab("")} // This is the key to closing it
                    className="mt-4 px-4 py-2 bg-[#171B34] text-white rounded-full hover:bg-blue-900"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}

            <div className="nav-bg  p-2 py-3 pb-5 rounded-lg">
              <h2 className="text-lg mb-2 flex items-center text-whites">
                <GiSwipeCard className="color-blue border-b border-[#21D9CC] mr-2" />{" "}
                Select chennal
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {chennals.map(
                  (chennal, i) =>
                    activeTab === chennal.label && (
                      <Fragment key={i}>
                        {chennal.chennalItem.map((item, index) => (
                          <div
                            key={index}
                            className={` p-2 rounded-md cursor-pointer ${
                              index === activeIndex
                                ? "blue-linear whites"
                                : "bg-popup-nav gray-text"
                            } `}
                            onClick={() => {
                              setActiveTab2(item.label);
                              setActiveIndex(index);
                            }}
                          >
                            <p className={` text-base  `}>{item.label}</p>
                            <p className={`text-base  `}>
                              Balance: {item.balance}
                            </p>
                          </div>
                        ))}
                      </Fragment>
                    ),
                )}
              </div>
            </div>

            {activeTab === "USDT" ? (
              <div className="nav-bg p-2 py-3 pb-5 mt-4 rounded-lg">
                <h2 className="text-lg mb-2 flex items-center gray-50">
                  <IoMdWallet className="color-blue text-lg mr-2" /> Select
                  amount of USDT
                </h2>
                <div className="grid grid-cols-12 gap-2">
                  {chennals.map((chennal, i) => (
                    <Fragment key={i}>
                      {chennal.chennalItem.map(
                        (item, index) =>
                          activeTab2 === item.label && (
                            <Fragment key={index}>
                              {item.depositAmount.map((data, index2) => (
                                <button
                                  key={index2}
                                  className={`flex items-center justify-center col-span-4 p-1 rounded font-semibold  ${
                                    amount == data.am
                                      ? "blue-linear color-orange"
                                      : "border color-blue sky-border"
                                  }`}
                                  onClick={() => setAmount(data.am)}
                                >
                                  <img
                                    src={USDt1Img}
                                    alt=""
                                    className="w-5 mr-2"
                                  />{" "}
                                  {data.am >= 1000
                                    ? `${data.am / 1000}k`
                                    : data.am}
                                </button>
                              ))}
                            </Fragment>
                          ),
                      )}
                    </Fragment>
                  ))}
                </div>

                <div className="bgs-body flex items-center px-5 py-1 rounded-lg mt-4">
                  <img src={USDt1Img} alt="" className="w-5" />

                  <input
                    type="number"
                    className="w-full  bgs-body  p-2  ps-6 flex items-center  focus:outline-none color-blue placeholder:text-sm placeholder:text-gray-text"
                    placeholder="Please enter deposit amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="bgs-body flex items-center px-5 py-1 rounded-lg mt-3">
                  <span className="color-blue text-lg font-bold">₹</span>
                  <input
                    type="number"
                    className="w-full  bgs-body  p-2  ps-6 flex items-center  focus:outline-none color-blue placeholder:text-sm placeholder:text-gray-text"
                    placeholder="Please enter USDT amount"
                    value={Number(Number(amount) * 93).toFixed(2)}
                    onChange={(e) => setAmount(e.target)}
                  />
                </div>

                <button
                  className={`  w-full rounded-full p-2 mt-4  ${
                    amount > 9
                      ? "blue-linear color-orange"
                      : "bg-gray-400 gray-50"
                  }`}
                  disabled={loader ? true : false}
                  onClick={handleSubmitUSDT}
                >
                  Deposit
                </button>
              </div>
            ) : (
              activeTab !== "ARPay" && (
                <div className="nav-bg p-2 py-3 pb-5 mt-4 rounded-lg">
                  <h2 className="text-lg mb-2 flex items-center text-whites">
                    <IoMdWallet className="color-blue text-lg mr-2" /> Deposit
                    amount
                  </h2>
                  <div className="grid grid-cols-12 gap-2">
                    {chennals.map((chennal, i) => (
                      <Fragment key={i}>
                        {chennal.chennalItem.map(
                          (item, index) =>
                            activeTab2 === item.label && (
                              <Fragment key={index}>
                                {item.depositAmount.map((data, index2) => (
                                  <button
                                    key={index2}
                                    className={` col-span-4 p-1 rounded font-semibold  ${
                                      amount == data.am
                                        ? "blue-linear color-orange"
                                        : "border color-blue sky-border"
                                    }`}
                                    onClick={() => setAmount(data.am)}
                                  >
                                    <span
                                      className={` mx-2 ${
                                        amount == data.am
                                          ? "text-white"
                                          : "gray-text"
                                      } `}
                                    >
                                      ₹
                                    </span>{" "}
                                    {data.am >= 1000
                                      ? `${data.am / 1000}k`
                                      : data.am}
                                  </button>
                                ))}
                              </Fragment>
                            ),
                        )}
                      </Fragment>
                    ))}
                  </div>

                  <div className="bgs-body flex items-center mt-4 px-5 py-1 rounded-full">
                    <span className="color-blue text-lg font-bold ">₹</span>{" "}
                    <span className="border-r border-[#bdbdbd] ml-2 w-2 h-4"></span>
                    <input
                      type="number"
                      className="w-full  bgs-body p-2  ps-6 flex items-center  focus:outline-none placeholder:text-sm placeholder:text-[var(--text_color_L3)]"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
              )
            )}
          </>
        </div>

        <div className="nav-bg mt-5 p-2 py-3">
          <h3 className="headinng-h3 flex text-whites text-lg mb-2">
            <GiWhiteBook className="color-blue mt-[2px] mr-1 text-lg" />
            Recharge instructions
          </h3>
          <ul className="border border-[#525167] p-3 rounded-lg">
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] color-blue mr-2 mt-[2px]" />
              </span>
              <p className="text-sm gray-text leading-[18px] ">
                If the transfer time is up, please fill out the deposit from
                again.
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] color-blue mr-2 mt-[2px]" />
              </span>
              <p className="text-sm gray-text leading-[18px] ">
                The transfer amount must match the order you created, otherwise
                the money cannot be credited successfully.
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] color-blue mr-2 mt-[2px]" />
              </span>
              <p className="text-sm gray-text leading-[18px] ">
                If you transfer the wrong amount, our company will not be
                responsible for the lost amount!
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] color-blue mr-2 mt-[2px]" />
              </span>
              <p className="text-sm gray-text leading-[18px] ">
                Note: do not cancel the depsot order after the money has bess
                transferred.
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div className="fixed bottom-0  bg-[#1E2530] left-0 right-0 m-auto w-[24.7rem] items-center justify-center shadow-lg border-t border-gray-700 z-50 p-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex-1">
            <p className="text-xs text-gray-400">Recharge Method:</p>
            <h2 className="text-lg font-semibold text-white">
              {selectedchennalItem?.label || "Select Method"}
            </h2>
          </div>
          <button
            className={`font-bold py-3 px-6 rounded shadow-md hover:opacity-90 transition-opacity p-2 ${
              (activeTab === "USDT" ? amount > 9 : amount > 299)
                ? "blue-linear text-black"
                : "bg-gray-500 text-black"
            }`}
            disabled={activeTab === "USDT" ? amount < 10 : amount < 300}
            onClick={activeTab === "USDT" ? handleSubmitUSDT : handleSubmit}
          >
            Deposit ₹
            {activeTab === "USDT"
              ? Number(amount * 93).toFixed(2)
              : amount >= 1000
                ? `${amount / 1000}k`
                : amount || ""}
          </button>
        </div>
      </div>

      <div>
        <DepositHistoryLite />
      </div>

      <CopyCopmponent copyPopup={copyPopup} message="Refesh successfully" />

      <div className={`place-bet-popup ${alertsuccess ? "active" : ""}`}>
        <div className="text-sm">{successMessage}</div>
      </div>

      <AlertCopmponent alertPopup={alerts} message={successMessage} />
    </>
  );
}

const chennals = [
  {
    label: "Online Pay",
    chennalItem: [
      {
        label: "LuckyPay-APP",
        balance: "300 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 400,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
          {
            am: 100000,
          },
        ],
      },
      {
        label: "RsPayINR",
        balance: "300 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 400,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },

          {
            am: 20000,
          },
          {
            am: 50000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
        ],
      },
      {
        label: "OoPay APP",
        balance: "300 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 400,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 10000,
          },
          {
            am: 20000,
          },
          {
            am: 50000,
          },
        ],
      },
      {
        label: "TBIndia-INR",
        balance: "300 - 10K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 2000,
          },
          {
            am: 5000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
        ],
      },
      {
        label: "FunPay - APP",
        balance: "300 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 400,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
          {
            am: 100000,
          },
        ],
      },
      {
        label: "Super-APPpay",
        balance: "300 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 400,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 5000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
        ],
      },
      {
        label: "HappyPayINR2app",
        balance: "300 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 2000,
          },
          {
            am: 5000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
        ],
      },
      {
        label: "HappyPayINR2-app",
        balance: "300 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 2000,
          },
          {
            am: 5000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
        ],
      },
      {
        label: "7days-APP",
        balance: "300 - 100K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 400,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
          {
            am: 100000,
          },
        ],
      },
    ],
  },
  {
    label: "NOW UPI",
    chennalItem: [
      {
        label: "FunPay-NOW UPI",
        balance: "300 - 100K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 400,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
          {
            am: 100000,
          },
        ],
      },
      {
        label: "LuckyINR-paytm",
        balance: "300 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 1000,
          },
          {
            am: 2000,
          },
          {
            am: 5000,
          },
          {
            am: 10000,
          },
          {
            am: 30000,
          },
          {
            am: 50000,
          },
        ],
      },
      {
        label: "Super-NOW UPI",
        balance: "300 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 400,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 5000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
        ],
      },
      {
        label: "7Days-NOW UPI",
        balance: "300 - 100K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
          {
            am: 100000,
          },
        ],
      },
    ],
  },
  {
    label: "QR Pay",
    chennalItem: [
      {
        label: "OoPay-upi",
        balance: "500 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 400,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
          {
            am: 100000,
          },
        ],
      },
      {
        label: "OSPayINR-upi",
        balance: "300 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 400,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
          {
            am: 100000,
          },
        ],
      },
      {
        label: "Funpay-UPI",
        balance: "300 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 400,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
          {
            am: 100000,
          },
        ],
      },
      {
        label: "HappyPayINR2-upi",
        balance: "300 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 400,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
          {
            am: 100000,
          },
        ],
      },
      {
        label: "7Days-QR Pay",
        balance: "300 - 50K",
        depositAmount: [
          {
            am: 300,
          },
          {
            am: 400,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
          {
            am: 100000,
          },
        ],
      },
    ],
  },
  {
    label: "USDT",
    chennalItem: [
      {
        label: "Upay USDT",
        balance: "10 - 100K",
        depositAmount: [
          {
            am: 10,
          },
          {
            am: 50,
          },
          {
            am: 1000,
          },
          {
            am: 10000,
          },
          {
            am: 50000,
          },
          {
            am: 100000,
          },
        ],
      },
    ],
  },
];
