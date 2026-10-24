import { Fragment, useEffect, useState } from "react";
import { FaSquare } from "react-icons/fa";
import { GiSwipeCard, GiWhiteBook } from "react-icons/gi";
import { IoMdWallet } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import UpiIcon from "../../assets/mp1.png";
import RefereshImg from "../../assets/refresh.png";
import EWalletIcon from "../../assets/upi1.png";
import CopyCopmponent from "../../components/CopyCopmponent";
import { userDetail } from "../../store/reducer/authReducer";
import {
  bannerGet,
  kwikpayRecharge,
  manualUPIRecharge,
} from "../../store/reducer/userReducer";

import { useDispatch, useSelector } from "react-redux";
import AlertCopmponent from "../../components/AlertComponent";
import CustomeNavbar from "../../components/CustomeNavbar";
import DepositHistoryLite from "./DepositHistoryLite";

export default function Recharge() {
  const { bannergetData } = useSelector((state) => state.user);
  const { userInfo, loader } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [amount, setAmount] = useState();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("KwikPay");
  const [activeTab2, setActiveTab2] = useState("KwikPay Gateway");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copyPopup, setCopyPopup] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [alertsuccess, setAlertsuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Manual UPI specific state
  const [utr, setUtr] = useState("");

  const tabs = [
    { label: "KwikPay", Icons: EWalletIcon, g: false },
    { label: "UPI Manual", Icons: UpiIcon, g: false },
  ];

  // ============================================
  // KwikPay Submit — creates payment link, redirects
  // ============================================
  const handleSubmitKwikPay = async () => {
    if (!amount || Number(amount) < 1) {
      setSuccessMessage("Minimum deposit is ₹1");
      setAlerts(true);
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    dispatch(kwikpayRecharge({ money: Number(amount) })).then((res) => {
      if (res.meta.requestStatus === "fulfilled" && res.payload?.payment_url) {
        setSuccessMessage(res.payload.message || "Redirecting to payment...");
        setAlertsuccess(true);

        // Redirect user to KwikPay payment page
        window.location.href = res.payload.payment_url;
      } else {
        setSuccessMessage(res.payload?.message || "Payment failed");
        setAlerts(true);
      }
      setTimeout(() => setSuccessMessage(""), 3000);
    });
  };

  // ============================================
  // UPI Manual Submit — sends UTR for admin approval
  // ============================================
  const handleSubmitManualUPI = async () => {
    if (!amount || Number(amount) < 1) {
      setSuccessMessage("Minimum deposit is ₹1");
      setAlerts(true);
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    if (!utr || utr.length !== 12) {
      setSuccessMessage("Please enter a valid 12-digit UTR");
      setAlerts(true);
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    dispatch(
      manualUPIRecharge({ money: Number(amount), utr: String(utr) }),
    ).then((res) => {
      if (res.meta.requestStatus === "fulfilled" && res.payload?.status) {
        setSuccessMessage(
          res.payload.message ||
            "Payment request submitted! Balance will update shortly.",
        );
        setAlertsuccess(true);
        setAmount("");
        setUtr("");
        setTimeout(() => {
          setAlertsuccess(false);
          setSuccessMessage("");
        }, 3000);
      } else {
        setSuccessMessage(res.payload?.message || "Request failed");
        setAlerts(true);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    });
  };

  // ============================================
  // Generic submit dispatcher
  // ============================================
  const handleSubmit = () => {
    if (activeTab === "KwikPay") {
      handleSubmitKwikPay();
    } else if (activeTab === "UPI Manual") {
      handleSubmitManualUPI();
    }
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

  // ============================================
  // Static channels — simplified for 2 tabs only
  // Minimum deposit now ₹1 instead of ₹100
  // ============================================
  const chennals = [
    {
      label: "KwikPay",
      chennalItem: [
        {
          label: "KwikPay Gateway",
          balance: "1 - 100K",
          depositAmount: [
            { am: 1 },
            { am: 10 },
            { am: 50 },
            { am: 100 },
            { am: 500 },
            { am: 1000 },
            { am: 5000 },
          ],
        },
      ],
    },
    {
      label: "UPI Manual",
      chennalItem: [
        {
          label: "Manual UPI Transfer",
          balance: "1 - 100K",
          depositAmount: [
            { am: 1 },
            { am: 10 },
            { am: 50 },
            { am: 100 },
            { am: 500 },
            { am: 1000 },
            { am: 5000 },
          ],
        },
      ],
    },
  ];

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

      <div className="container-section mt-5 text-white">
        {/* Balance card */}
        <div className="total-img rounded p-4">
          <div className="flex items-center">
            <p className="fs-sm text-white ml-7 mt-2">Balance</p>
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

        {/* Tab selector — only 2 tabs */}
        <div className="grid grid-cols-12 gap-2 mt-2">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              className={`col-span-6 py-5 nav-bg gray-text relative text-sm flex justify-center flex-col items-center rounded ${
                activeTab === tab.label
                  ? "blue-linear text-black"
                  : "nav-bg gray-text"
              }`}
              onClick={() => {
                setActiveTab(tab.label);
                setActiveIndex(0);
                setAmount("");
                setUtr("");
                const firstchennal = chennals.find(
                  (chennal) => chennal.label === tab.label,
                );
                if (firstchennal && firstchennal.chennalItem.length > 0) {
                  setActiveTab2(firstchennal.chennalItem[0].label);
                }
              }}
            >
              <img src={tab.Icons} alt="" className="w-10" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <div className="nav-bg p-2 py-3 pb-5 rounded-lg">
            <h2 className="text-lg mb-2 flex items-center text-whites">
              <GiSwipeCard className="color-blue border-b border-[#21D9CC] mr-2" />{" "}
              Select Method
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {chennals.map(
                (chennal, i) =>
                  activeTab === chennal.label && (
                    <Fragment key={i}>
                      {chennal.chennalItem.map((item, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded-md cursor-pointer ${
                            index === activeIndex
                              ? "blue-linear whites"
                              : "bg-popup-nav gray-text"
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

          {/* Deposit amount section */}
          <div className="nav-bg p-2 py-3 pb-5 mt-4 rounded-lg">
            <h2 className="text-lg mb-2 flex items-center text-whites">
              <IoMdWallet className="color-blue text-lg mr-2" /> Deposit amount
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
                              className={`col-span-4 p-1 rounded font-semibold ${
                                amount == data.am
                                  ? "blue-linear color-orange"
                                  : "border color-blue sky-border"
                              }`}
                              onClick={() => setAmount(data.am)}
                            >
                              <span
                                className={`mx-2 ${
                                  amount == data.am ? "text-white" : "gray-text"
                                }`}
                              >
                                ₹
                              </span>{" "}
                              {data.am >= 1000 ? `${data.am / 1000}k` : data.am}
                            </button>
                          ))}
                        </Fragment>
                      ),
                  )}
                </Fragment>
              ))}
            </div>

            <div className="bgs-body flex items-center mt-4 px-5 py-1 rounded-full">
              <span className="color-blue text-lg font-bold">₹</span>{" "}
              <span className="border-r border-[#bdbdbd] ml-2 w-2 h-4"></span>
              <input
                type="number"
                className="w-full bgs-body p-2 ps-6 flex items-center focus:outline-none placeholder:text-sm placeholder:text-[var(--text_color_L3)]"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* UTR input — shown only for UPI Manual */}
            {activeTab === "UPI Manual" && (
              <div className="bgs-body flex items-center mt-3 px-5 py-1 rounded-full">
                <span className="color-blue text-sm font-bold">UTR</span>{" "}
                <span className="border-r border-[#bdbdbd] ml-2 w-2 h-4"></span>
                <input
                  type="text"
                  className="w-full bgs-body p-2 ps-6 flex items-center focus:outline-none placeholder:text-sm placeholder:text-[var(--text_color_L3)]"
                  placeholder="Enter 12-digit UTR"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
                  maxLength={12}
                />
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="nav-bg mt-5 p-2 py-3">
          <h3 className="headinng-h3 flex text-whites text-lg mb-2">
            <GiWhiteBook className="color-blue mt-[2px] mr-1 text-lg" />
            Recharge instructions
          </h3>
          <ul className="border border-[#525167] p-3 rounded-lg">
            <li className="flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] color-blue mr-2 mt-[2px]" />
              </span>
              <p className="text-sm gray-text leading-[18px]">
                If the transfer time is up, please fill out the deposit from
                again.
              </p>
            </li>
            <li className="flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] color-blue mr-2 mt-[2px]" />
              </span>
              <p className="text-sm gray-text leading-[18px]">
                The transfer amount must match the order you created, otherwise
                the money cannot be credited successfully.
              </p>
            </li>
            <li className="flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] color-blue mr-2 mt-[2px]" />
              </span>
              <p className="text-sm gray-text leading-[18px]">
                If you transfer the wrong amount, our company will not be
                responsible for the lost amount!
              </p>
            </li>
            <li className="flex mt-2">
              <span>
                <FaSquare className="rotate-45 text-[7px] color-blue mr-2 mt-[2px]" />
              </span>
              <p className="text-sm gray-text leading-[18px]">
                Note: do not cancel the deposit order after the money has been
                transferred.
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* Sticky bottom deposit button */}
      <div className="fixed bottom-0 bg-[#1E2530] left-0 right-0 m-auto w-[24.7rem] items-center justify-center shadow-lg border-t border-gray-700 z-50 p-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex-1">
            <p className="text-xs text-gray-400">Recharge Method:</p>
            <h2 className="text-lg font-semibold text-white">
              {selectedchennalItem?.label || "Select Method"}
            </h2>
          </div>
          <button
            className={`font-bold py-3 px-6 rounded shadow-md hover:opacity-90 transition-opacity p-2 ${
              amount >= 1 ? "blue-linear text-black" : "bg-gray-500 text-black"
            }`}
            disabled={
              loader ||
              amount < 1 ||
              (activeTab === "UPI Manual" && utr.length !== 12)
            }
            onClick={handleSubmit}
          >
            {loader
              ? "Processing..."
              : `Deposit ₹${
                  amount >= 1000 ? `${amount / 1000}k` : amount || ""
                }`}
          </button>
        </div>
      </div>

      <div>
        <DepositHistoryLite />
      </div>

      <CopyCopmponent copyPopup={copyPopup} message="Refresh successfully" />

      <div className={`place-bet-popup ${alertsuccess ? "active" : ""}`}>
        <div className="text-sm">{successMessage}</div>
      </div>

      <AlertCopmponent alertPopup={alerts} message={successMessage} />
    </>
  );
}
