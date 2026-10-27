import { QRCodeSVG } from "qrcode.react";
import { Fragment, useEffect, useRef, useState } from "react";
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
  getManualUPIDetails,
  kwikpayRecharge,
  manualUPIRecharge,
} from "../../store/reducer/userReducer";

import { useDispatch, useSelector } from "react-redux";
import AlertCopmponent from "../../components/AlertComponent";
import CustomeNavbar from "../../components/CustomeNavbar";

const MIN_AMOUNT = 1;
const UTR_LENGTH = 12;

export default function Recharge() {
  const { manualUpiDetailsData, manualUpiDetailsLoading } = useSelector(
    (state) => state.user,
  );
  const { userInfo, loader } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("KwikPay");
  const [activeTab2, setActiveTab2] = useState("KwikPay Gateway");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copyPopup, setCopyPopup] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [alertsuccess, setAlertsuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // QR popup state
  const [qrPopup, setQrPopup] = useState(false);
  // amount that was locked in when the QR popup was opened
  const [qrAmount, setQrAmount] = useState(0);

  const alertTimerRef = useRef(null);
  const copyTimerRef = useRef(null);

  const tabs = [
    { label: "KwikPay", Icons: EWalletIcon, g: false },
    { label: "UPI Manual", Icons: UpiIcon, g: false },
  ];

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

  // ============================================
  // Utility: show alert
  // ============================================
  const showAlert = (message, isSuccess = false) => {
    setSuccessMessage(message);
    if (isSuccess) {
      setAlertsuccess(true);
      setAlerts(false);
    } else {
      setAlerts(true);
      setAlertsuccess(false);
    }
    clearTimeout(alertTimerRef.current);
    alertTimerRef.current = setTimeout(() => {
      setAlerts(false);
      setAlertsuccess(false);
      setSuccessMessage("");
    }, 3000);
  };

  // ============================================
  // KwikPay Submit
  // ============================================
  const handleSubmitKwikPay = async () => {
    const amt = Number(amount);
    if (!amt || amt < MIN_AMOUNT) {
      showAlert(`Minimum deposit is ₹${MIN_AMOUNT}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await dispatch(kwikpayRecharge({ money: amt }));
      if (res.meta.requestStatus === "fulfilled" && res.payload?.payment_url) {
        showAlert(res.payload.message || "Redirecting to payment...", true);
        window.location.href = res.payload.payment_url;
      } else {
        showAlert(res.payload?.message || "Payment failed");
      }
    } catch (err) {
      showAlert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // Manual UPI Submit (called from QR popup)
  // ============================================
  const handleSubmitManualUPI = async () => {
    // popup open hai to QR me lock kiya hua amount use karo
    const amt = qrPopup ? Number(qrAmount) : Number(amount);
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
        manualUPIRecharge({ money: amt, utr: String(utr).trim() }),
      );
      if (res.meta.requestStatus === "fulfilled" && res.payload?.status) {
        showAlert(
          res.payload.message ||
            "Payment request submitted! Balance will update shortly.",
          true,
        );
        setAmount("");
        setUtr("");
        setQrPopup(false);
        setQrAmount(0);
      } else {
        showAlert(res.payload?.message || "Request failed");
      }
    } catch (err) {
      showAlert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // Open QR popup (Manual UPI only) after amount is valid
  // ============================================
  const handleGenerateQR = () => {
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
  // KwikPay -> direct submit
  // UPI Manual -> QR popup open (UTR popup ke andar hai)
  // ============================================
  const handleSubmit = () => {
    if (submitting) return;
    if (activeTab === "KwikPay") {
      handleSubmitKwikPay();
    } else if (activeTab === "UPI Manual") {
      handleGenerateQR();
    }
  };

  // ============================================
  // Refresh balance
  // ============================================
  const handleRefesh = () => {
    setCopyPopup(true);
    dispatch(userDetail());
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyPopup(false), 1500);
  };

  // ============================================
  // Initial mount only
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
  // Load UPI details when Manual UPI tab is active
  // ============================================
  useEffect(() => {
    if (activeTab === "UPI Manual" && !manualUpiDetailsData?.upi_id) {
      dispatch(getManualUPIDetails({ amount: 0 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ============================================
  // Tab switch handler
  // ============================================
  const handleTabChange = (tabLabel) => {
    if (tabLabel === activeTab) return;
    setActiveTab(tabLabel);
    setActiveIndex(0);
    setAmount("");
    setUtr("");
    setQrPopup(false);
    setQrAmount(0);

    const firstChannel = chennals.find((c) => c.label === tabLabel);
    if (firstChannel && firstChannel.chennalItem.length > 0) {
      setActiveTab2(firstChannel.chennalItem[0].label);
    }
  };

  // ============================================
  // Derived: is submit disabled?
  // ============================================
  const amountNumber = Number(amount);
  const isAmountValid = !!amountNumber && amountNumber >= MIN_AMOUNT;
  const isManualUpiReady =
    activeTab !== "UPI Manual" || !!manualUpiDetailsData?.upi_id;

  // Sticky bar button
  const isSubmitDisabled =
    loader || submitting || !isAmountValid || !isManualUpiReady;

  // QR popup ka Submit button (UTR valid hona chahiye)
  const isPopupSubmitDisabled =
    loader || submitting || utr.length !== UTR_LENGTH;

  // display helper for preset button + deposit button
  const formatAmount = (val) => {
    const num = Number(val);
    if (!num) return "";
    return num >= 1000 ? `${num / 1000}k` : `${num}`;
  };

  // ============================================
  // UPI deep link for the QR (uses locked qrAmount)
  // ============================================
  const upiUri =
    manualUpiDetailsData?.upi_id && qrAmount >= MIN_AMOUNT
      ? `upi://pay?pa=${encodeURIComponent(
          manualUpiDetailsData.upi_id,
        )}&pn=${encodeURIComponent(
          manualUpiDetailsData.username || "Payment",
        )}&am=${qrAmount}&cu=INR`
      : "";

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
              onClick={handleRefesh}
            />
          </div>
        </div>

        {/* Tab selector */}
        <div className="grid grid-cols-12 gap-2 mt-2">
          {tabs.map((tab) => (
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
                              type="button"
                              className={`col-span-4 p-1 rounded font-semibold ${
                                Number(amount) === data.am
                                  ? "blue-linear color-orange"
                                  : "border color-blue sky-border"
                              }`}
                              onClick={() => setAmount(String(data.am))}
                            >
                              <span
                                className={`mx-2 ${
                                  Number(amount) === data.am
                                    ? "text-white"
                                    : "gray-text"
                                }`}
                              >
                                ₹
                              </span>{" "}
                              {formatAmount(data.am)}
                            </button>
                          ))}
                        </Fragment>
                      ),
                  )}
                </Fragment>
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
                  if (Number.isFinite(num) && num >= 0) {
                    setAmount(val);
                  }
                }}
                min={MIN_AMOUNT}
                inputMode="numeric"
              />
            </div>

            {activeTab === "UPI Manual" && (
              <p className="text-xs gray-text mt-2 px-2">
                Transfer the exact amount to the UPI ID shown above (or scan the
                QR), then enter the {UTR_LENGTH}-digit UTR in the QR popup and
                submit.
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
              {selectedchennalItem?.label || "Select Method"}
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

      {/* <div>
        <DepositHistoryLite />
      </div> */}

      {/* ============================================ */}
      {/* QR POPUP — QR + UTR + Submit                 */}
      {/* ============================================ */}
      {qrPopup && upiUri && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setQrPopup(false)}
        >
          <div
            className="bg-[#1E2530] rounded-xl p-5 w-full max-w-sm text-white relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
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

            {/* QR */}
            <div className="flex justify-center">
              <div className="bg-white p-3 rounded-lg">
                <QRCodeSVG value={upiUri} size={220} level="M" includeMargin />
              </div>
            </div>

            {/* Amount */}
            <div className="mt-3 text-center">
              <p className="text-xs gray-text">Amount</p>
              <p className="text-2xl font-bold color-blue">
                ₹{qrAmount.toLocaleString("en-IN")}
              </p>
            </div>

            {/* UPI ID + copy */}
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
                      manualUpiDetailsData.upi_id,
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

            {/* Warning */}
            <p className="mt-3 text-xs text-amber-300 text-center">
              Pay exactly ₹{qrAmount.toLocaleString("en-IN")}. Then enter the
              UTR below and submit.
            </p>

            {/* UTR input — QR ke just niche */}
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

            {/* Submit */}
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

      <div className={`place-bet-popup ${alertsuccess ? "active" : ""}`}>
        <div className="text-sm">{successMessage}</div>
      </div>

      <AlertCopmponent alertPopup={alerts} message={successMessage} />
    </>
  );
}
