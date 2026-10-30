import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaSquare } from "react-icons/fa";
import { GiSwipeCard, GiWhiteBook } from "react-icons/gi";
import { IoMdClose, IoMdWallet } from "react-icons/io";
import UpiIcon from "../../assets/mp1.png";
import RefereshImg from "../../assets/refresh.png";
import EWalletIcon from "../../assets/upi1.png";
import CopyCopmponent from "../../components/CopyCopmponent";
import { userDetail } from "../../store/reducer/authReducer";
import {
  bannerGet,
  checkDemoBalance,
  getManualUPIDetails,
  manualUPIRecharge,
  quropayRecharge,
  refillDemoBalance,
} from "../../store/reducer/userReducer";

import { useDispatch, useSelector } from "react-redux";
import AlertCopmponent from "../../components/AlertComponent";
import CustomeNavbar from "../../components/CustomeNavbar";

const MIN_AMOUNT = 1;
const UTR_LENGTH = 12;

const CHANNELS = [
  {
    label: "QuroPay",
    Icons: EWalletIcon,
    items: [
      {
        label: "QuroPay Gateway",
        balance: "1 - 100K",
        presetAmounts: [1, 10, 50, 100, 500, 1000, 5000],
      },
    ],
  },
  {
    label: "UPI Manual",
    Icons: UpiIcon,
    items: [
      {
        label: "Manual UPI Transfer",
        balance: "1 - 100K",
        presetAmounts: [1, 10, 50, 100, 500, 1000, 5000],
      },
    ],
  },
];

export default function Recharge() {
  const { manualUpiDetailsData, manualUpiDetailsLoading } = useSelector(
    (state) => state.user
  );
  const { userInfo, loader } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("QuroPay");
  const [activeItemLabel, setActiveItemLabel] = useState("QuroPay Gateway");
  const [copyPopup, setCopyPopup] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // QR popup (Manual UPI only)
  const [qrPopup, setQrPopup] = useState(false);
  const [qrAmount, setQrAmount] = useState(0);

  // Demo refill guard — prevents double-trigger in React StrictMode / re-renders
  const demoRefillTriedRef = useRef(false);

  const alertTimerRef = useRef(null);
  const copyTimerRef = useRef(null);

  // ============================================
  // Helpers
  // ============================================
  const showAlert = (message, isSuccess = false) => {
    setAlertMessage(message);
    if (isSuccess) {
      setAlertSuccess(true);
      setAlerts(false);
    } else {
      setAlerts(true);
      setAlertSuccess(false);
    }
    clearTimeout(alertTimerRef.current);
    alertTimerRef.current = setTimeout(() => {
      setAlerts(false);
      setAlertSuccess(false);
      setAlertMessage("");
    }, 3000);
  };

  const formatAmount = (val) => {
    const num = Number(val);
    if (!num) return "";
    return num >= 1000 ? `${num / 1000}k` : `${num}`;
  };

  const selectedChannel = useMemo(
    () => CHANNELS.find((c) => c.label === activeTab),
    [activeTab]
  );
  const selectedItem = useMemo(
    () =>
      selectedChannel?.items.find((i) => i.label === activeItemLabel) || null,
    [selectedChannel, activeItemLabel]
  );

  // ============================================
  // QuroPay submit — creates order, redirects
  // ============================================
  const handleSubmitQuroPay = async () => {
    const amt = Number(amount);
    if (!amt || amt < MIN_AMOUNT) {
      showAlert(`Minimum deposit is ₹${MIN_AMOUNT}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await dispatch(quropayRecharge({ money: amt }));
      if (res.meta.requestStatus === "fulfilled" && res.payload?.payment_url) {
        showAlert(res.payload.message || "Redirecting to payment...", true);
        window.location.href = res.payload.payment_url;
      } else {
        showAlert(res.payload?.message || "Payment failed");
      }
    } catch {
      showAlert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // Manual UPI submit (from QR popup)
  // ============================================
  const handleSubmitManualUPI = async () => {
    const amt = Number(qrAmount || amount);
    if (!amt || amt < MIN_AMOUNT) {
      showAlert(`Minimum deposit is ₹${MIN_AMOUNT}`);
      return;
    }
    if (!utr || utr.length !== UTR_LENGTH) {
      showAlert(`Please enter a valid ${UTR_LENGTH}-digit UTR`);
      return;
    }
    if (!manualUpiDetailsData?.upi_id) {
      showAlert("UPI details not loaded. Please retry.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await dispatch(
        manualUPIRecharge({ money: amt, utr: String(utr).trim() })
      );
      if (res.meta.requestStatus === "fulfilled" && res.payload?.status) {
        showAlert(
          res.payload.message ||
            "Payment request submitted! Balance will update shortly.",
          true
        );
        setAmount("");
        setUtr("");
        setQrPopup(false);
        setQrAmount(0);
      } else {
        showAlert(res.payload?.message || "Request failed");
      }
    } catch {
      showAlert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // Open QR popup for Manual UPI
  // ============================================
  const handleOpenQR = () => {
    if (!manualUpiDetailsData?.upi_id) {
      showAlert("UPI details not loaded. Please retry.");
      return;
    }
    const amt = Number(amount);
    if (!amt || amt < MIN_AMOUNT) {
      showAlert(`Enter an amount of at least ₹${MIN_AMOUNT}`);
      return;
    }
    setQrAmount(amt);
    setQrPopup(true);
  };

  // ============================================
  // Generic submit (sticky bar)
  // ============================================
  const handleSubmit = () => {
    if (submitting) return;
    if (activeTab === "QuroPay") {
      handleSubmitQuroPay();
    } else {
      handleOpenQR();
    }
  };

  // ============================================
  // Refresh balance
  // ============================================
  const handleRefresh = () => {
    setCopyPopup(true);
    dispatch(userDetail());
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyPopup(false), 1500);
  };

  // ============================================
  // Tab switch
  // ============================================
  const handleTabChange = (tabLabel) => {
    if (tabLabel === activeTab) return;
    setActiveTab(tabLabel);
    setAmount("");
    setUtr("");
    setQrPopup(false);
    setQrAmount(0);

    const first = CHANNELS.find((c) => c.label === tabLabel)?.items[0];
    setActiveItemLabel(first?.label || "");
  };

  // ============================================
  // Mount + cleanup
  // ============================================
  useEffect(() => {
    dispatch(userDetail());
    dispatch(bannerGet());
    window.scrollTo(0, 0);

    return () => {
      clearTimeout(alertTimerRef.current);
      clearTimeout(copyTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================
  // DEMO AUTO-REFILL
  //   Jab demo user ka balance < 2000 ho to backend se +10000
  //   add karwa ke userDetail() refresh kar deta hai.
  //   demoRefillTriedRef se ek hi baar chalega (StrictMode safe).
  // ============================================
  useEffect(() => {
    const isDemo = Number(userInfo?.isdemo) === 1;
    const balance = Number(userInfo?.money_user ?? userInfo?.money ?? 0);

    if (!isDemo) return;
    if (demoRefillTriedRef.current) return;
    // Agar balance already >= 2000 hai to kuch nahi karna
    if (balance >= 2000) return;

    demoRefillTriedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        // 1. Server-side check (double safety)
        const check = await dispatch(checkDemoBalance());
        if (cancelled) return;

        const needs =
          check.meta.requestStatus === "fulfilled" &&
          check.payload?.status &&
          check.payload?.needsRefill;

        if (!needs) return;

        // 2. Refill
        const refill = await dispatch(refillDemoBalance());
        if (cancelled) return;

        if (
          refill.meta.requestStatus === "fulfilled" &&
          refill.payload?.refilled
        ) {
          showAlert(
            refill.payload?.message ||
              `₹${refill.payload?.added ?? 10000} added to demo account`,
            true
          );
          // 3. Navbar/wallet balance refresh
          dispatch(userDetail());
        }
      } catch {
        // Silent fail — user abhi bhi normally recharge kar sakta hai
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.isdemo, userInfo?.money_user, userInfo?.money]);

  // ============================================
  // Lazy-load UPI details for Manual UPI tab
  // ============================================
  useEffect(() => {
    if (activeTab === "UPI Manual" && !manualUpiDetailsData?.upi_id) {
      dispatch(getManualUPIDetails());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ============================================
  // Derived
  // ============================================
  const amountNumber = Number(amount);
  const isAmountValid = !!amountNumber && amountNumber >= MIN_AMOUNT;
  const isManualReady =
    activeTab !== "UPI Manual" || !!manualUpiDetailsData?.upi_id;
  const isSubmitDisabled =
    loader || submitting || !isAmountValid || !isManualReady;

  const isPopupSubmitDisabled =
    loader || submitting || utr.length !== UTR_LENGTH;

  const upiUri = useMemo(() => {
    if (!manualUpiDetailsData?.upi_id || qrAmount < MIN_AMOUNT) return "";
    return `upi://pay?pa=${encodeURIComponent(
      manualUpiDetailsData.upi_id
    )}&pn=${encodeURIComponent(
      manualUpiDetailsData.username || "Payment"
    )}&am=${qrAmount}&cu=INR`;
  }, [manualUpiDetailsData, qrAmount]);

  return (
    <>
      <CustomeNavbar
        name="Deposit"
        details="Deposit history"
        link="/wallet/RechargeHistory"
      />

      <div className="container-section mt-5 text-white pb-3">
        {/* Balance card */}
        <div className="total-img rounded p-4">
          <div className="flex items-center">
            <p className="fs-sm text-white ml-7 mt-2">Balance</p>
          </div>
          <div className="flex items-center ms-2 mt-2">
            <h3 className="heaing-h3 text-xl font-bold">
              ₹{" "}
              {userInfo?.money_user
                ? Number(userInfo.money_user).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0.00"}
            </h3>
            <img
              src={RefereshImg}
              alt="Refresh balance"
              className="w-5 ms-2 mb-[2px] cursor-pointer"
              onClick={handleRefresh}
            />
          </div>
        </div>

        {/* Tab selector */}
        <div className="grid grid-cols-12 gap-2 mt-2">
          {CHANNELS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              className={`col-span-6 py-5 nav-bg gray-text relative text-sm flex justify-center flex-col items-center rounded ${
                activeTab === tab.label
                  ? "blue-linear text-black"
                  : "nav-bg gray-text"
              }`}
              onClick={() => handleTabChange(tab.label)}
            >
              <img src={tab.Icons} alt="" className="w-10" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          {/* Method selector */}
          <div className="nav-bg p-2 py-3 pb-5 rounded-lg">
            <h2 className="text-lg mb-2 flex items-center text-whites">
              <GiSwipeCard className="color-blue border-b border-[#21D9CC] mr-2" />{" "}
              Select Method
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {selectedChannel?.items.map((item) => (
                <div
                  key={item.label}
                  className={`p-2 rounded-md cursor-pointer ${
                    item.label === activeItemLabel
                      ? "blue-linear whites"
                      : "bg-popup-nav gray-text"
                  }`}
                  onClick={() => setActiveItemLabel(item.label)}
                >
                  <p className="text-base">{item.label}</p>
                  <p className="text-base">Balance: {item.balance}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Deposit amount section */}
          <div className="nav-bg p-2 py-3 pb-5 mt-4 rounded-lg">
            <h2 className="text-lg mb-2 flex items-center text-whites">
              <IoMdWallet className="color-blue text-lg mr-2" /> Deposit amount
            </h2>
            <div className="grid grid-cols-12 gap-2">
              {selectedItem?.presetAmounts.map((am) => (
                <button
                  key={am}
                  type="button"
                  className={`col-span-4 p-1 rounded font-semibold ${
                    Number(amount) === am
                      ? "blue-linear color-orange"
                      : "border color-blue sky-border"
                  }`}
                  onClick={() => setAmount(String(am))}
                >
                  <span
                    className={`mx-2 ${
                      Number(amount) === am ? "text-white" : "gray-text"
                    }`}
                  >
                    ₹
                  </span>{" "}
                  {formatAmount(am)}
                </button>
              ))}
            </div>

            {/* Amount input */}
            <div className="bgs-body flex items-center mt-4 px-5 py-1 rounded-full">
              <span className="color-blue text-lg font-bold">₹</span>{" "}
              <span className="border-r border-[#bdbdbd] ml-2 w-2 h-4"></span>
              <input
                type="number"
                className="w-full bgs-body p-2 ps-6 flex items-center focus:outline-none placeholder:text-sm placeholder:text-[var(--text_color_L3)]"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setAmount("");
                    return;
                  }
                  const num = Number(val);
                  if (Number.isFinite(num) && num >= 0) setAmount(val);
                }}
                min={MIN_AMOUNT}
                inputMode="numeric"
              />
            </div>

            {activeTab === "UPI Manual" && (
              <p className="text-xs gray-text mt-2 px-2">
                {manualUpiDetailsLoading
                  ? "Loading UPI details..."
                  : `Transfer the exact amount to the UPI ID shown in the QR popup, then enter the ${UTR_LENGTH}-digit UTR and submit.`}
              </p>
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
            {[
              "If the transfer time is up, please fill out the deposit form again.",
              "The transfer amount must match the order you created, otherwise the money cannot be credited successfully.",
              "If you transfer the wrong amount, our company will not be responsible for the lost amount!",
              "Note: do not cancel the deposit order after the money has been transferred.",
            ].map((text, i) => (
              <li key={i} className="flex mt-2">
                <span>
                  <FaSquare className="rotate-45 text-[7px] color-blue mr-2 mt-[2px]" />
                </span>
                <p className="text-sm gray-text leading-[18px]">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 bg-[#1E2530] left-0 right-0 m-auto w-full sm:max-w-[24.7rem] items-center justify-center shadow-lg border-t border-gray-700 z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div className="flex-1">
            <p className="text-xs text-gray-400">Recharge Method:</p>
            <h2 className="text-lg font-semibold text-white">
              {selectedItem?.label || "Select Method"}
            </h2>
          </div>
          <button
            type="button"
            className={`font-bold py-3 px-6 rounded shadow-md hover:opacity-90 transition-opacity p-2 ${
              !isSubmitDisabled
                ? "blue-linear text-black"
                : "bg-gray-500 text-black cursor-not-allowed"
            }`}
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            {loader || submitting
              ? "Processing..."
              : activeTab === "UPI Manual"
              ? `Pay ₹${formatAmount(amount)}`
              : `Deposit ₹${formatAmount(amount)}`}
          </button>
        </div>
      </div>

      {/* QR popup — Manual UPI */}
      {qrPopup && upiUri && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setQrPopup(false)}
        >
          <div
            className="bg-[#1E2530] rounded-xl p-5 w-full max-w-sm text-white relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-white"
              onClick={() => setQrPopup(false)}
              aria-label="Close"
            >
              <IoMdClose />
            </button>

            <h3 className="text-lg font-semibold mb-1">Scan & Pay</h3>
            <p className="text-xs gray-text mb-3">
              Scan with any UPI app. Amount is pre-filled.
            </p>

            <div className="flex justify-center">
              <div className="bg-white p-3 rounded-lg">
                <QRCodeSVG value={upiUri} size={220} level="M" includeMargin />
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs gray-text">Amount</p>
              <p className="text-2xl font-bold color-blue">
                ₹{qrAmount.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 bg-[#2A3341] rounded-lg px-3 py-2">
              <span className="break-all text-sm font-semibold">
                {manualUpiDetailsData?.upi_id}
              </span>
              <button
                type="button"
                className="rounded border border-[#21D9CC] px-3 py-1 text-xs shrink-0"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      manualUpiDetailsData.upi_id
                    );
                    showAlert("UPI ID copied", true);
                  } catch {
                    showAlert("Unable to copy UPI ID.");
                  }
                }}
              >
                Copy
              </button>
            </div>

            <p className="mt-3 text-xs text-amber-300 text-center">
              Pay exactly ₹{qrAmount.toLocaleString("en-IN")}. Then enter the
              UTR below and submit.
            </p>

            <div className="bgs-body flex items-center mt-3 px-5 py-1 rounded-full">
              <span className="color-blue text-sm font-bold">UTR</span>{" "}
              <span className="border-r border-[#bdbdbd] ml-2 w-2 h-4"></span>
              <input
                type="text"
                inputMode="numeric"
                className="w-full bgs-body p-2 ps-6 flex items-center focus:outline-none placeholder:text-sm placeholder:text-[var(--text_color_L3)]"
                placeholder={`Enter ${UTR_LENGTH}-digit UTR`}
                value={utr}
                onChange={(e) =>
                  setUtr(e.target.value.replace(/\D/g, "").slice(0, UTR_LENGTH))
                }
                maxLength={UTR_LENGTH}
              />
            </div>
            <p className="text-xs gray-text mt-1 px-2 text-right">
              {utr.length}/{UTR_LENGTH}
            </p>

            <button
              type="button"
              disabled={isPopupSubmitDisabled}
              className={`mt-3 w-full py-2 rounded font-semibold ${
                !isPopupSubmitDisabled
                  ? "blue-linear text-black"
                  : "bg-gray-500 text-black cursor-not-allowed"
              }`}
              onClick={handleSubmitManualUPI}
            >
              {loader || submitting ? "Processing..." : "Submit Deposit"}
            </button>
          </div>
        </div>
      )}

      <CopyCopmponent copyPopup={copyPopup} message="Refresh successfully" />

      <div className={`place-bet-popup ${alertSuccess ? "active" : ""}`}>
        <div className="text-sm">{alertMessage}</div>
      </div>

      <AlertCopmponent alertPopup={alerts} message={alertMessage} />
    </>
  );
}