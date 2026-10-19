import { Fragment, useEffect, useRef, useState } from "react";
import { FaSquare } from "react-icons/fa";
import { GiSwipeCard, GiWhiteBook } from "react-icons/gi";
import { IoMdWallet } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import Wallet from "../../assets/balance.png";
import bonus from "../../assets/gift.png";
import UpiIcon from "../../assets/mp1.png";
import PaytmIcon from "../../assets/qr2.png";
import RefereshImg from "../../assets/refresh.png";
import EWalletIcon from "../../assets/upi1.png";
import UPIQR from "../../assets/UpiQr.png";
import UsdtIcon from "../../assets/usdt.png";
import USDt1Img from "../../assets/usdt1.png";
import CopyCopmponent from "../../components/CopyCopmponent";
import { userDetail } from "../../store/reducer/authReducer";
import {
  bannerGet,
  recharge,
  recharge3,
  TrexoPayment,
  zilpayRecharge,
} from "../../store/reducer/userReducer";

import Marquee from "react-fast-marquee";
import { useDispatch, useSelector } from "react-redux";
import AlertCopmponent from "../../components/AlertComponent";
import CustomeNavbar from "../../components/CustomeNavbar";

const AR = "https://i.ibb.co/DPSRWVbF/pay-Name-Icon.png";

export default function Recharge() {
  const { bannergetData } = useSelector((state) => state.user);
  const { userInfo, loader } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [amount, setAmount] = useState();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("UPI-QR"); // Default UPI-QR
  const [activeTab2, setActiveTab2] = useState("UPI-QR"); // Changed from "TY-QRpay" to "UPI-QR"
  const [activeIndex, setActiveIndex] = useState(0);
  const [copyPopup, setCopyPopup] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [alertsuccess, setAlertsuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const hasAutoSubmitted = useRef(false);

  const tabs = [
    { label: "UPI-QR", Icons: UPIQR, g: false },
    { label: "UPI-QRpay", Icons: EWalletIcon, g: false },
    { label: "Wake UP-APP", Icons: PaytmIcon, g: false },
    { label: "UPI-PayTM", Icons: UpiIcon, g: false },
    { label: "USDT", Icons: UsdtIcon, g: true },
    { label: "ARPay", Icons: AR, g: false },
  ];

  // ✅ FIX: Sync activeIndex with activeTab2
  useEffect(() => {
    const currentChannel = channels.find(
      (channel) => channel.label === activeTab,
    );
    if (currentChannel) {
      const index = currentChannel.channelItem.findIndex(
        (item) => item.label === activeTab2,
      );
      if (index !== -1 && index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  }, [activeTab, activeTab2]);

  const handleSubmit = async () => {
    const type = activeTab2;
    const formData = new FormData();
    formData.append("amount", amount);
    formData.append("type", type);

    if (activeTab2 === "7Day-QRpay" || activeTab2 === "UPI-QR") {
      if (bannergetData?.chennal?.status1 == 1) {
        dispatch(TrexoPayment({ amount, type })).then((res) => {
          setSuccessMessage(res.payload.message);
          if (res.payload.status) {
            setAlertsuccess(true);
            window.location.href = res.payload.data.payment_url;
          } else {
            setAlerts(true);
          }
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        });
      } else {
        dispatch(zilpayRecharge({ amount, type })).then((res) => {
          setSuccessMessage(res.payload.message);
          if (res.payload.status) {
            setAlertsuccess(true);
            window.location.href = res.payload.data.url;
          } else {
            setAlerts(true);
          }
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        });
      }
    } else if (activeTab2 === "TY-QRpay") {
      if (bannergetData?.chennal?.status2 == 1) {
        dispatch(recharge3({ amount, type })).then((res) => {
          setSuccessMessage(res?.payload?.message);

          if (res?.payload?.status) {
            setAlertsuccess(true);
            window.open(res?.payload?.data?.payData, "_blank");
          } else {
            setAlerts(true);
          }

          setTimeout(() => setSuccessMessage(""), 2000);
        });
      } else {
        dispatch(zilpayRecharge({ amount, type })).then((res) => {
          setSuccessMessage(res.payload.message);
          if (res.payload.status) {
            setAlertsuccess(true);
            window.location.href = res.payload.data.url;
          } else {
            setAlerts(true);
          }
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        });
      }
    } else if (activeTab2 === "7Day-UPI" || activeTab2 === "51-APPpay") {
      if (bannergetData?.chennal?.status3 == 1) {
        dispatch(TrexoPayment({ amount, type })).then((res) => {
          setSuccessMessage(res.payload.message);
          if (res.payload.status) {
            setAlertsuccess(true);
            window.location.href = res.payload.data.payment_url;
          } else {
            setAlerts(true);
          }
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        });
      } else {
        dispatch(zilpayRecharge({ amount, type })).then((res) => {
          setSuccessMessage(res.payload.message);
          if (res.payload.status) {
            setAlertsuccess(true);
            window.location.href = res.payload.data.url;
          } else {
            setAlerts(true);
          }
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        });
      }
    } else {
      dispatch(zilpayRecharge({ amount, type })).then((res) => {
        setSuccessMessage(res.payload.message);
        if (res.payload.status) {
          setAlertsuccess(true);
          window.location.href = res.payload.data.url;
        } else {
          setAlerts(true);
        }
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      });
    }
  };

  // const handleSubmit = async () => {
  //   const type = activeTab2;

  //   if (bannergetData?.chennal?.status1 == 1) {
  //     dispatch(TrexoPayment({ amount, type })).then((res) => {
  //       console.log("res", res.payload);

  //       setSuccessMessage(res?.payload?.message);

  //       if (res?.payload?.status) {
  //         setAlertsuccess(true);
  //         window.location.href = res?.payload?.data?.payment_url;
  //       } else {
  //         setAlerts(true);
  //       }

  //       setTimeout(() => {
  //         setSuccessMessage("");
  //       }, 3000);
  //     });
  //   } else {
  //     dispatch(zilpayRecharge({ amount, type })).then((res) => {
  //       console.log("res", res.payload);

  //       setSuccessMessage(res?.payload?.message);

  //       if (res?.payload?.status) {
  //         setAlertsuccess(true);
  //         window.location.href = res?.payload?.data?.url;
  //       } else {
  //         setAlerts(true);
  //       }

  //       setTimeout(() => {
  //         setSuccessMessage("");
  //       }, 3000);
  //     });
  //   }
  // };

  const handleSubmitUSDT = async () => {
    const type = "USDT";
    const formData = new FormData();
    formData.append("amount", amount * 93);
    formData.append("type", type);

    dispatch(recharge(formData)).then((res) => {
      setSuccessMessage(res.payload.message);
      if (res.payload.status) {
        setAlertsuccess(true);
        if (activeTab2 === "Upay-USDT") {
          navigate("/wallet/Recharge/usdt");
        } else {
          navigate("/wallet/Recharge/usdt2");
        }
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

  const location = useLocation();

  // Set initial state from location
  useEffect(() => {
    if (location.state?.autoPay) {
      setAmount(location.state.amount);
      setActiveTab2(location.state.type);
      // Also set activeTab to match the type if needed
      const parentTab = tabs.find((tab) =>
        channels
          .find((channel) => channel.label === tab.label)
          ?.channelItem.some((item) => item.label === location.state.type),
      );
      if (parentTab) {
        setActiveTab(parentTab.label);
      }
    }
  }, []);

  // FIXED: Auto-submit only once, not on back navigation
  useEffect(() => {
    if (
      location.state?.autoPay &&
      amount &&
      activeTab2 &&
      !hasAutoSubmitted.current
    ) {
      hasAutoSubmitted.current = true;
      handleSubmit();

      // Clear the state to prevent re-triggering on back button
      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [amount, activeTab2]);

  // Reset autoSubmit ref when user manually changes tab or amount
  useEffect(() => {
    // Reset the flag when user manually interacts
    if (!location.state?.autoPay) {
      hasAutoSubmitted.current = false;
    }
  }, [activeTab, activeTab2, amount]);

  // Inside your Recharge component, before the return statement:
  const selectedchennalGroup = channels.find(
    (chennal) => chennal.label === activeTab,
  );

  const selectedchennalItem = selectedchennalGroup?.channelItem.find(
    (item) => item.label === activeTab2,
  );

  return (
    <>
      <CustomeNavbar
        name="Deposit"
        details="Deposit history"
        link="/wallet/RechargeHistory"
      />

      <div className="container-section mt-1 color-orange ">
        <div className="total-img p-4">
          <div className="flex items-center">
            <img src={Wallet} alt="" className="w-4 mr-2 mb-[2px]" />
            <p className="fs-sm">Balance</p>
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

        <div className="grid grid-cols-12 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              className={`col-span-3 py-3 relative text-sm flex justify-center flex-col items-center rounded ${
                activeTab === tab.label
                  ? "bg-[#FA6F6B] text-white"
                  : "bg-light gray-100"
              }`}
              onClick={() => {
                setActiveTab(tab.label);
                setActiveIndex(0);

                const firstChannel = channels.find(
                  (channel) => channel.label === tab.label,
                );

                if (firstChannel && firstChannel.channelItem.length > 0) {
                  setActiveTab2(firstChannel.channelItem[0].label);
                }
              }}
            >
              <img src={tab.Icons} alt="" className="w-10" />
              <span>{tab.label}</span>

              {tab.g && (
                <span
                  className="absolute top-0 w-[37px] h-[35px] right-0 bg-cover bg-center text-white text-[11px] pt-[10px]"
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
            {activeTab === "ARPay" && (
              <Marquee className="text-black">
                Comming soon{" "}
                <Marquee className="text-red-400">Comming soon</Marquee>
              </Marquee>
            )}
            <div className="bg-light  p-2 py-3 pb-5 rounded-lg">
              <h2 className="text-lg mb-2 flex items-center text-whites">
                <GiSwipeCard className="text-blue border-b border-[#e9be89] mr-2" />{" "}
                Select channel
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {channels.map(
                  (channel, i) =>
                    activeTab === channel.label && (
                      <Fragment key={i}>
                        {channel.channelItem.map((item, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded-md cursor-pointer ${
                              index === activeIndex
                                ? "bg-[#FA6F6B] text-white"
                                : "bg-blues gray-100"
                            }`}
                            onClick={() => {
                              setActiveTab2(item.label);
                              setActiveIndex(index);
                            }}
                          >
                            <p className="text-base">{item.label}</p>
                            <p className="text-base">Balance: {item.balance}</p>
                          </div>
                        ))}
                      </Fragment>
                    ),
                )}
              </div>
            </div>

            {activeTab === "USDT" ? (
              <div className="bg-light p-2 py-3 pb-5 mt-4 rounded-lg">
                <h2 className="text-lg mb-2 flex items-center gray-100">
                  <IoMdWallet className="text-blue text-lg mr-2" /> Select
                  amount of USDT
                </h2>
                <div className="grid grid-cols-12 gap-2">
                  {channels.map((channel, i) => (
                    <Fragment key={i}>
                      {channel.channelItem.map(
                        (item, index) =>
                          activeTab2 === item.label && (
                            <Fragment key={index}>
                              {item.depositAmount.map((data, index2) => (
                                <button
                                  key={index2}
                                  className={`flex items-center justify-center col-span-4 p-1 rounded font-semibold  ${
                                    amount == data.am
                                      ? "blue-linear text-white"
                                      : "border text-blue sky-border"
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
                    className="w-full  bgs-body  p-2  ps-6 flex items-center  focus:outline-none text-blue placeholder:text-sm placeholder:text-gray-text"
                    placeholder="Please enter deposit amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="bgs-body flex items-center px-5 py-1 rounded-lg mt-3">
                  <span className="text-blue text-lg font-bold">₹</span>
                  <input
                    type="number"
                    className="w-full  bgs-body  p-2  ps-6 flex items-center  focus:outline-none text-blue placeholder:text-sm placeholder:text-gray-text"
                    placeholder="Please enter USDT amount"
                    value={Number(Number(amount) * 93).toFixed(2)}
                    onChange={(e) => setAmount(e.target)}
                  />
                </div>

                <button
                  className={`  w-full rounded-full p-2 mt-4  ${
                    amount > 9
                      ? "blue-linear text-white"
                      : "bg-[#FA6F6B] text-whites"
                  }`}
                  disabled={loader ? true : false}
                  onClick={handleSubmitUSDT}
                >
                  Deposit
                </button>
              </div>
            ) : (
              activeTab !== "ARPay" && (
                <div className="bg-light p-2 py-3 pb-5 mt-4 rounded-lg">
                  <h2 className="text-lg mb-2 flex items-center text-whites">
                    <IoMdWallet className="text-[#FB5959] size-6 text-lg mr-2" />{" "}
                    Deposit amount
                  </h2>
                  <div className="grid grid-cols-12 gap-2">
                    {channels.map((channel, i) => (
                      <Fragment key={i}>
                        {channel.channelItem.map(
                          (item, index) =>
                            activeTab2 === item.label && (
                              <Fragment key={index}>
                                {item.depositAmount.map((data, index2) => (
                                  <button
                                    key={index2}
                                    className={` col-span-4 p-1 rounded font-semibold  ${
                                      amount == data.am
                                        ? "blue-linear text-white"
                                        : "border text-blue sky-border"
                                    }`}
                                    onClick={() => setAmount(data.am)}
                                  >
                                    <span
                                      className={` mx-2 ${
                                        amount == data.am ? "text-white" : ""
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
                    <span className="text-blue text-lg font-bold ">₹</span>{" "}
                    <span className="border-r border-[#bdbdbd] ml-2 w-2 h-4"></span>
                    <input
                      type="number"
                      className="w-full  bgs-body p-2  ps-6 flex items-center  focus:outline-none placeholder:text-sm placeholder:text-[var(--text_color_L3)]"
                      placeholder="Please enter the amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <button
                    className={`  w-full rounded-full p-2 mt-4  ${
                      amount > 99
                        ? "blue-linear text-white"
                        : "bg-[#FB5959] color-orange"
                    }`}
                    disabled={loader ? true : false}
                    onClick={handleSubmit}
                  >
                    Deposit
                  </button>
                </div>
              )
            )}
          </>
        </div>

        <div className="bg-light mt-5 p-2 py-3">
          <h3 className="headinng-h3 flex text-whites text-lg mb-2">
            <GiWhiteBook className="text-blue mt-[2px] mr-1 text-lg" />
            Recharge instructions
          </h3>
          <ul className="border border-[#E1E1E1] p-3 rounded-lg">
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] text-blue mr-2 mt-[2px]" />
              </span>
              <p className="text-sm gray-100 leading-[18px] ">
                If the transfer time is up, please fill out the deposit from
                again.
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] text-blue mr-2 mt-[2px]" />
              </span>
              <p className="text-sm gray-100 leading-[18px] ">
                The transfer amount must match the order you created, otherwise
                the money cannot be credited successfully.
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] text-blue mr-2 mt-[2px]" />
              </span>
              <p className="text-sm gray-100 leading-[18px] ">
                If you transfer the wrong amount, our company will not be
                responsible for the lost amount!
              </p>
            </li>
            <li className=" flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] text-blue mr-2 mt-[2px]" />
              </span>
              <p className="text-sm gray-100 leading-[18px] ">
                Note: do not cancel the depsot order after the money has bess
                transferred.
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* New Deposit Button */}
      <div className="fixed bottom-0  bg-body left-0 right-0 m-auto filter-section w-[25rem]  items-center justify-center shadow-lg border-t border-gray-300 z-50 p-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex-1">
            <p className="text-xs text-gray-600">Recharge Method:</p>
            <h2 className="text-lg font-semibold text-black">
              {selectedchennalItem?.label || "Select Method"}
            </h2>
          </div>
          <button
            className={`font-bold py-3 px-6 rounded shadow-md hover:opacity-90 transition-opacity p-2 ${
              (activeTab === "USDT" && amount > 9) ||
              (activeTab !== "USDT" && amount > 99)
                ? "blue-linear text-white"
                : "bg-[#d1d5dd] gray-100"
            }`}
            disabled={activeTab === "USDT" ? amount < 10 : amount < 100}
            onClick={activeTab === "USDT" ? handleSubmitUSDT : handleSubmit}
          >
            Deposit ₹
            {activeTab === "USDT"
              ? amount
                ? Number(amount * 93).toFixed(2)
                : "" // amount na ho to blank
              : amount >= 1000
                ? `${amount / 1000}k`
                : amount || ""}
          </button>
        </div>
      </div>

      <CopyCopmponent copyPopup={copyPopup} message="Refesh successfully" />

      <div className={`place-bet-popup ${alertsuccess ? "active" : ""}`}>
        <div className="text-sm">{successMessage}</div>
      </div>

      <AlertCopmponent alertPopup={alerts} message={successMessage} />
    </>
  );
}

const channels = [
  {
    label: "UPI-QR",
    channelItem: [
      {
        label: "UPI-QR",
        balance: "100 - 50K",
        depositAmount: [
          {
            am: 100,
          },
          {
            am: 200,
          },
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
            am: 600,
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
        ],
      },
      {
        label: "TY-QRpay",
        balance: "100 - 10K",
        depositAmount: [
          {
            am: 200,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 3000,
          },
          {
            am: 5000,
          },
          {
            am: 10000,
          },
        ],
      },
      {
        label: "7Day-QRpay",
        balance: "500 - 50K",
        depositAmount: [
          // {
          //   am: 500,
          // },
          // {
          //   am: 1000,
          // },
          // {
          //   am: 10000,
          // },
          // {
          //   am: 50000,
          // },
        ],
      },
      {
        label: "Easy-QRpay",
        balance: "200 - 50K",
        depositAmount: [
          // {
          //   am: 200,
          // },
          // {
          //   am: 300,
          // },
          // {
          //   am: 500,
          // },
          // {
          //   am: 1000,
          // },
          // {
          //   am: 10000,
          // },
          // {
          //   am: 50000,
          // },
        ],
      },
    ],
  },
  {
    label: "UPI-QRpay",
    channelItem: [
      {
        label: "FlyPay-QRpay",
        balance: "100 - 50K",
        depositAmount: [
          {
            am: 100,
          },
          {
            am: 500,
          },
          {
            am: 1000,
          },
          {
            am: 3000,
          },
          {
            am: 5000,
          },
          {
            am: 10000,
          },
        ],
      },
      // {
      //   label: "TY-QRpay",
      //   balance: "100 - 10K",
      //   depositAmount: [
      //     {
      //       am: 100,
      //     },
      //     {
      //       am: 500,
      //     },
      //     {
      //       am: 1000,
      //     },
      //     {
      //       am: 3000,
      //     },
      //     {
      //       am: 5000,
      //     },
      //     {
      //       am: 10000,
      //     },
      //   ],
      // },
      {
        label: "7Day-QRpay",
        balance: "500 - 50K",
        depositAmount: [
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
        ],
      },
      {
        label: "Easy-QRpay",
        balance: "200 - 50K",
        depositAmount: [
          {
            am: 200,
          },
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
        ],
      },
      // {
      //   label: "Magic-QRpay",
      //   balance: "200 - 50K",
      //   depositAmount: [
      //     {
      //       am: 200,
      //     },
      //     {
      //       am: 300,
      //     },
      //     {
      //       am: 500,
      //     },
      //     {
      //       am: 1000,
      //     },
      //     {
      //       am: 10000,
      //     },
      //     {
      //       am: 50000,
      //     },
      //   ],
      // },
      // {
      //   label: "UM-QRpay",
      //   balance: "200 - 50K",
      //   depositAmount: [
      //     {
      //       am: 200,
      //     },
      //     {
      //       am: 300,
      //     },
      //     {
      //       am: 500,
      //     },
      //     {
      //       am: 1000,
      //     },
      //     {
      //       am: 10000,
      //     },
      //     {
      //       am: 50000,
      //     },
      //   ],
      // },
      // {
      //   label: "51-QRpay",
      //   balance: "200 - 50K",
      //   depositAmount: [
      //     {
      //       am: 200,
      //     },
      //     {
      //       am: 300,
      //     },
      //     {
      //       am: 500,
      //     },
      //     {
      //       am: 1000,
      //     },
      //     {
      //       am: 10000,
      //     },
      //     {
      //       am: 50000,
      //     },
      //   ],
      // },
      // {
      //   label: "YaYa-QRpay",
      //   balance: "200 - 50K",
      //   depositAmount: [
      //     {
      //       am: 200,
      //     },
      //     {
      //       am: 300,
      //     },
      //     {
      //       am: 500,
      //     },
      //     {
      //       am: 1000,
      //     },
      //     {
      //       am: 10000,
      //     },
      //     {
      //       am: 50000,
      //     },
      //   ],
      // },
      // {
      //   label: "CECO-QRpay",
      //   balance: "200 - 50K",
      //   depositAmount: [
      //     {
      //       am: 200,
      //     },
      //     {
      //       am: 300,
      //     },
      //     {
      //       am: 500,
      //     },
      //     {
      //       am: 1000,
      //     },
      //     {
      //       am: 10000,
      //     },
      //     {
      //       am: 50000,
      //     },
      //   ],
      // },
      // {
      //   label: "FAST-QRpay",
      //   balance: "200 - 50K",
      //   depositAmount: [
      //     {
      //       am: 200,
      //     },
      //     {
      //       am: 300,
      //     },
      //     {
      //       am: 500,
      //     },
      //     {
      //       am: 1000,
      //     },
      //     {
      //       am: 10000,
      //     },
      //     {
      //       am: 50000,
      //     },
      //   ],
      // },
      // {
      //   label: "AG-QRpay",
      //   balance: "200 - 50K",
      //   depositAmount: [
      //     {
      //       am: 200,
      //     },
      //     {
      //       am: 300,
      //     },
      //     {
      //       am: 500,
      //     },
      //     {
      //       am: 1000,
      //     },
      //     {
      //       am: 10000,
      //     },
      //     {
      //       am: 50000,
      //     },
      //   ],
      // },
    ],
  },
  {
    label: "Wake UP-APP",
    channelItem: [
      {
        label: "7Day-UPI",
        balance: "200 - 50K",
        depositAmount: [
          {
            am: 200,
          },
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
        ],
      },
      {
        label: "UPI-APPpay",
        balance: "200 - 50K",
        depositAmount: [
          {
            am: 200,
          },
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
        label: "51-APPpay",
        balance: "500 - 50K",
        depositAmount: [
          {
            am: 200,
          },
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
        ],
      },
      {
        label: "YaYa-APPpay",
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
    ],
  },
  {
    label: "UPI-PayTM",
    channelItem: [
      {
        label: "7Day-PayTM",
        balance: "200 - 50K",
        depositAmount: [
          {
            am: 200,
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
        label: "UPI-PayTM",
        balance: "200 - 50K",
        depositAmount: [
          {
            am: 200,
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
    ],
  },
  {
    label: "USDT",
    channelItem: [
      {
        label: "Upay-USDT",
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
      {
        label: "Tron-USDT",
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
