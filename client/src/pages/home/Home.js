import { useCallback, useEffect, useState } from "react";
import { IoIosMailUnread } from "react-icons/io";
import { RxCrossCircled } from "react-icons/rx";
import "./home.css";

import { IoMdArrowUp } from "react-icons/io";
import { IoArrowDownSharp } from "react-icons/io5";

import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import debounce from "lodash/debounce";
import { RiVolumeUpFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";

import { RiRefreshLine } from "react-icons/ri";
import MainLoader from "../../components/MainLoader";
import Layout from "../../layout/Layout";
import { userDetail } from "../../store/reducer/authReducer";
import { recharheBonus } from "../../store/reducer/userReducer";

import WinningInformation from "./WinningInformation";

import Cookies from "js-cookie";
import CircleImg from "../../assets/circle.png";
import DragonImg from "../../assets/dragon.svg";
import WheelSpinImg from "../../assets/wheelspin.png";
import bonusSpin from "../../assets/yarwin/bonus.png";
import depositImage from "../../assets/yarwin/deposit.svg";
import wheelSpin from "../../assets/yarwin/wheelSpin.png";
import withdrawImage from "../../assets/yarwin/withdraw.svg";
import { totalCommission } from "../../store/reducer/promotionReducer";
import { Alerts } from "./Alerts";
import Apkdownload from "./Apkdownload";
import PlatformDetails from "./lottery/PlatformDetails";
import SlotComponents from "./lottery/SlotComponents";

const Home = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const { bannergetData, rechargeBonusData } = useSelector(
    (state) => state.user,
  );

  const { totalCommissionData } = useSelector((state) => state.promotion);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isChecked, setIsChecked] = useState(true);

  // ============================================================
  // POPUP STATES
  // ============================================================

  // Popup 1 - Withdrawal Security Alert
  const [topup, setTopup] = useState(false);

  // Popup 2 - Important Notice
  const [topup3, setTopup3] = useState(false);

  // Popup 3 - Gift Code
  const [topup4, setTopup4] = useState(false);

  // Popup 5 - Welcome to 91Club
  const [topup5, setTopup5] = useState(false);

  // Popup 4 - First Deposit Bonus
  const [topup2, setTopup2] = useState(false);

  const [mainLoader, setMainloader] = useState(false);
  const [apps, setApp] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  // ============================================================
  // CHECKBOX
  // ============================================================

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  // ============================================================
  // RECHARGE BONUS
  // ============================================================

  useEffect(() => {
    dispatch(recharheBonus());
  }, [dispatch]);

  // ============================================================
  // USER DETAIL
  // ============================================================

  const debouncedDispatch = useCallback(
    debounce(() => {
      dispatch(userDetail());
    }, 300),
    [dispatch],
  );

  useEffect(() => {
    debouncedDispatch();

    window.scrollTo(0, 0);

    const data = localStorage.getItem("topup");

    if (data === "true") {
      setTopup(true);
    }

    return () => {
      debouncedDispatch.cancel();
    };
  }, [debouncedDispatch]);

  // ============================================================
  // POPUP FLOW
  // ============================================================

  // Popup 1 -> Popup 2
  const handleTopup = () => {
    localStorage.setItem("topup", "false");

    setTopup(false);
    setTopup3(true);
  };

  // Popup 2 -> Popup 3
  const handleTopup3 = () => {
    setTopup3(false);
    setTopup4(true);
  };

  // Popup 3 -> Popup 5
  const handleTopup4 = () => {
    setTopup4(false);
    setTopup5(true);
  };

  // Popup 5 -> First Deposit Bonus
  const handleTopup5 = () => {
    setTopup5(false);
    setTopup2(true);
  };

  // Popup 5 Close -> First Deposit Bonus
  // FIX: This function was missing
  const handleTopup5Close = () => {
    setTopup5(false);
    setTopup2(true);
  };

  // First Deposit Bonus -> Close
  const handleTopup2Close = () => {
    setTopup2(false);

    if (Number(totalCommissionData?.yesterdayBalance || 0) > 0) {
      setShowPopup(true);
    }
  };

  // ============================================================
  // COMMISSION POPUP
  // ============================================================

  const handleReceive = () => {
    setShowPopup(false);
  };

  // ============================================================
  // APP + COMMISSION
  // ============================================================

  useEffect(() => {
    const data = localStorage.getItem("app");

    if (data === "closed") {
      setApp(false);
    } else {
      setApp(true);
    }

    dispatch(totalCommission());
  }, [dispatch]);

  // ============================================================
  // MAIN LOADER
  // ============================================================

  useEffect(() => {
    const handleLoad = () => {
      setMainloader(false);
    };

    const navigation = performance.getEntriesByType("navigation")[0];

    if (navigation?.type === "navigate") {
      setMainloader(true);

      const timer = setTimeout(() => {
        setMainloader(false);
      }, 1000);

      window.addEventListener("load", handleLoad);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("load", handleLoad);
      };
    }
  }, []);

  // ============================================================
  // BODY SCROLL LOCK
  // ============================================================

  useEffect(() => {
    if (topup || topup2 || topup3 || topup4 || topup5) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [topup2, topup, topup3, topup4, topup5]);

  // ============================================================
  // NOTICE SLIDER
  // ============================================================

  const notices = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    autoplay: true,
    autoplaySpeed: 4000,
    verticalSwiping: true,
    arrows: false,
    cssEase: "linear",
  };

  return (
    <Layout>
      {/* ========================================================
          FIXED RIGHT SIDE ICONS
      ======================================================== */}

      <div
        style={{
          position: "fixed",
          zIndex: 500,
        }}
        className="flex flex-col right-0 bottom-36"
      >
        {/* WheelSpin Protected */}
        <div
          style={{
            display: "inline-block",
            cursor: "pointer",
          }}
          onClick={() => {
            if (userInfo) {
              navigate("/WheelSpin");
            } else {
              navigate("/login");
            }
          }}
        >
          <img
            src="https://i.ibb.co/d0M6CdWR/reward-Center-BO-n76h-A.png"
            alt="Service"
            className="w-[70px] pe-3 mt-1"
          />
        </div>

        <img src={CircleImg} alt="Service" className="w-[70px] pe-3 mt-1" />

        <img src={WheelSpinImg} alt="Service" className="w-[70px] pe-3 mt-1" />

        <img src={DragonImg} alt="Service" className="w-[70px] pe-3 mt-1" />
      </div>

      {/* ========================================================
          COMMISSION POPUP
      ======================================================== */}

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#f0f0f0] rounded-2xl shadow-xl p-4 w-[21rem] text-center relative">
            <img
              src="https://i.ibb.co/NdLQwsCh/popup-img-01.png"
              alt=""
              className="absolute w-[9rem] right-0 left-0 flex m-auto top-[-25px]"
            />

            <h2 className="text-xl font-semibold text-gray-800 mb-2 pt-20">
              marvelous!
            </h2>

            <p className="text-gray-500 mb-2 font-normal text-sm">
              Your invitation reward has been settled
            </p>

            <div className="flex items-center justify-center gap-1 text-2xl font-normal text-yellow-700 mb-6">
              <span className="text-gray-500 text-sm">Commission</span>

              <span className="text-base">
                {Number(totalCommissionData?.yesterdayBalance || 0).toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleReceive}
              className="w-[80%] py-1 rounded-3xl text-black text-xl font-bold blue-linear"
            >
              Receive
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="sticky top-0 z-40 bg-gradient-to-l pb-5">
        <div className="flex items-center justify-between rounded-md px-3">
          <div className="logo py-2 flex flex-col items-start">
            <img
              src={bannergetData?.gameall?.logo}
              alt="loading img"
              loading="lazy"
              className="w-[180px]"
            />
          </div>

          {userInfo ? (
            <div className="flex gap-2 items-center my-0.5">
              <img
                src="https://i.ibb.co/qMgWb30K/icon-Download-CAVOF-9-C.png"
                alt=""
                loading="lazy"
                className="w-7"
              />

              <Link
                className="flex justify-between items-center"
                to={`https://h5support.chennai91.co/?token=${Cookies.get(
                  "auth",
                )}`}
              >
                <div>
                  <img
                    src="https://i.ibb.co/0VnqD47C/message-Icon-Dzj8-Mws-M.png"
                    alt=""
                    loading="lazy"
                    className="w-7"
                  />
                </div>
              </Link>
            </div>
          ) : (
            <div className="text-black flex justify-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="bg-white text-black px-3 py-1 -mt-1.5 rounded-[4px] w-[70px] h-[29px] border border-gray-400 font-bold"
              >
                Log in
              </button>

              <button
                onClick={() => navigate("/register")}
                className="bg-[#FB5755] text-white px-3 -mt-1.5 py-1 rounded-[4px] w-[80px] h-[29px]"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      <Alerts />

      {mainLoader && <MainLoader />}

      {/* ========================================================
          NOTICE BOARD
      ======================================================== */}

      <div className="banner-notice mb-4 px-3 bg-body shadow-lg mt-[0.5rem] rounded-full flex items-center justify-between">
        <RiVolumeUpFill className="text-lg text-[#7D889D] absolute" />

        <div className="slider-container h-[33px] ms-6 mr-2 overflow-hidden">
          <Slider {...notices}>
            <div>
              <h3 className="text-[12px] leading-[1rem] text-black">
                Welcome to the {bannergetData?.gameall?.name}! Greetings, Gamers
                and Enthusiasts! The {bannergetData?.gameall?.name}
              </h3>
            </div>

            <div>
              <h3 className="text-[12px] leading-[1rem] text-black">
                If your deposit not receive, please send it directly to{" "}
                {bannergetData?.gameall?.name} Self-service Center
              </h3>
            </div>

            <div>
              <h3 className="text-[12px] leading-[1rem] text-[#808A9F]">
                Please be sure to always use our official website for playing
                the games with the following link, phishing links
              </h3>
            </div>
          </Slider>
        </div>

        <span className="float-end text-xl relative mr-2">
          <Link
            to="/main/Notification"
            className="flex items-center blue-linear p-2 rounded-2xl px-3 bg-white"
          >
            <IoIosMailUnread className="text-[#7D889D] mr-1 fs-sm size-6" />
          </Link>
        </span>
      </div>

      {/* ========================================================
          BANNER
      ======================================================== */}

      <div className="container-section">
        <div className="home-slider-banner">
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            className="mySwiper h-[184px] rounded-xl overflow-hidden"
          >
            <SwiperSlide>
              <div className="w-full">
                <img
                  src={bannergetData?.data?.ban1}
                  className="w-full rounded-md h-36"
                  alt=""
                  loading="lazy"
                />
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-full">
                <img
                  src={bannergetData?.data?.ban2}
                  className="w-full rounded-md h-36"
                  alt=""
                  loading="lazy"
                />
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-full">
                <img
                  src={bannergetData?.data?.ban3}
                  className="w-full rounded-md h-36"
                  alt=""
                  loading="lazy"
                />
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-full">
                <img
                  src={bannergetData?.data?.ban4}
                  className="w-full rounded-md h-36"
                  alt=""
                  loading="lazy"
                />
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-full">
                <img
                  src={bannergetData?.data?.ban5}
                  className="w-full rounded-md h-36"
                  alt=""
                  loading="lazy"
                />
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-full">
                <img
                  src={bannergetData?.data?.ban6}
                  className="w-full rounded-md h-36"
                  alt=""
                  loading="lazy"
                />
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-full">
                <img
                  src={bannergetData?.data?.ban7}
                  className="w-full rounded-md h-36"
                  alt=""
                  loading="lazy"
                />
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-full">
                <img
                  src={bannergetData?.data?.ban8}
                  className="w-full rounded-md h-36"
                  alt=""
                  loading="lazy"
                />
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-full">
                <img
                  src={bannergetData?.data?.ban9}
                  className="w-full rounded-md h-36"
                  alt=""
                  loading="lazy"
                />
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-full">
                <img
                  src={bannergetData?.data?.ban10}
                  className="w-full rounded-md h-36"
                  alt=""
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>

      {userInfo && (
        <div className="w-full flex items-center justify-between px-3 pt-[4px] pb-1 box-border bg-[#f5f6f9] mt-2.5">
          <div className="flex flex-col gap-[3px]">
            <div className="text-[12px] text-[#1d2b3d] leading-4">
              🟡 Wallet balance
            </div>
            <div className="flex items-center gap-[5px]">
              <span className="text-[18px] font-black text-black leading-[22px]">
                ₹
                {Number(
                  userInfo?.money_user ?? userInfo?.data?.money_user ?? 0,
                ).toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => dispatch(userDetail())}
                className="p-0 border-0 bg-transparent cursor-pointer"
              >
                <RiRefreshLine className="text-[18px] text-[#45484d] leading-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-[12px]">
            <button
              onClick={() => navigate("/wallet/withdraw")}
              className="w-[80px] h-[45px] px-1 py-[2px] border-0 rounded-lg bg-gradient-to-b from-[#ffb75b] to-[#ff9950] text-white flex flex-col items-center justify-center text-[14px] font-bold leading-[15px]"
            >
              <div className="flex items-center justify-center h-5">
                <img
                  src={withdrawImage}
                  alt="Withdraw"
                  className="w-5 h-5 object-contain"
                />
                <IoMdArrowUp className="text-white text-[20px] -ml-[20px]" />
              </div>
              <span className="font-bold">Withdraw</span>
            </button>

            <button
              onClick={() => navigate("/wallet/Recharge")}
              className="w-[80px] h-[45px] px-1 py-[2px] border-0 rounded-lg bg-gradient-to-b from-[#ff6677] to-[#ff4e64] text-white flex flex-col items-center justify-center text-[14px] font-bold leading-[15px]"
            >
              <div className="flex items-center justify-center h-5">
                <img
                  src={depositImage}
                  alt="Deposit"
                  className="w-5 h-5 object-contain"
                />
                <IoArrowDownSharp className="text-white text-[20px] -ml-[20px]" />
              </div>
              <span className="font-bold">Deposit</span>
            </button>
          </div>
        </div>
      )}
      {/* ========================================================
          WHEEL + BONUS
      ======================================================== */}

      <div className="flex gap-3 mx-2 mt-2 px-1">
        <Link to="/WheelSpin" className="relative flex-1 block">
          <img src={wheelSpin} alt="wheelSpin" className="w-full h-[55px]" />

          <span className="absolute bottom-2 left-4 text-white text-xs font-semibold px-2 py-0.5 rounded z-10">
            View
          </span>
        </Link>

        <Link to="/promotion" className="relative flex-1 block">
          <img src={bonusSpin} alt="bonusSpin" className="w-full h-[55px]" />

          <span className="absolute bottom-3 left-4 text-white text-xs font-semibold px-2 py-0.5 rounded z-10">
            View
          </span>
        </Link>
      </div>

      {/* ========================================================
          SLOT
      ======================================================== */}

      <SlotComponents />

      {/* ========================================================
          WINNING INFORMATION
      ======================================================== */}

      <div className="container-section overflow-x-hidden">
        <WinningInformation />
      </div>

      {/* ========================================================
          PLATFORM DETAILS
      ======================================================== */}

      <div>
        <PlatformDetails />
      </div>

      {/* ========================================================
          POPUP OVERLAYS
      ======================================================== */}

      <div className={topup ? "overlay-section block" : "hidden"} />

      <div className={topup2 ? "overlay-section block" : "hidden"} />

      <div className={topup3 ? "overlay-section block" : "hidden"} />

      <div className={topup4 ? "overlay-section block" : "hidden"} />

      <div className={topup5 ? "overlay-section block" : "hidden"} />

      {/* ========================================================
          POPUP 1
          WITHDRAWAL SECURITY ALERT
      ======================================================== */}

      {topup && (
        <div className="absolute top-56 left-1 right-0 bg-light flex m-auto flex-col mx-8 pb-1 rounded-xl z-[9999] w-[82%] max-w-md">
          <div className="blue-linear2 text-center p-2 font-bold text-lg rounded-t-xl">
            ⚠️ Withdrawal Security Alert ⚠️
          </div>

          <div className="h-[360px] w-full overflow-x-auto overflow-y-auto text-black px-4 text-center">
            <h1 className="text-red-700 mt-4 font-extrabold text-sm">
              NOTICE SCAM ALERT
            </h1>

            <img
              src="https://i.ibb.co/3mzXdbnt/editor-202609011631497m15.jpg"
              alt="Security Alert"
              className="w-full max-w-sm mx-auto mt-4 rounded-lg object-contain"
            />
          </div>

          <button
            className="flex justify-center text-base m-auto w-60 my-2 text-center blue-linear2 rounded-full p-2 tracking-widest text-color"
            onClick={handleTopup}
          >
            Confirm
          </button>
        </div>
      )}

      {/* ========================================================
          POPUP 2
          IMPORTANT NOTICE
      ======================================================== */}

      {topup3 && (
        <div className="absolute top-56 left-0 right-0 flex m-auto flex-col bg-light mx-8 pb-2 rounded-xl z-[9999]">
          <div className="blue-linear2 text-center p-2 font-bold text-lg text-white rounded-t-xl">
            📢 IMPORTANT NOTICE
          </div>

          <div className="pt-4 h-[400px] text-color text-[15px] bg-light overflow-y-auto overflow-x-auto">
            <div className="flex justify-center items-center px-5 h-52 w-full pb-2">
              <img
                src="https://i.ibb.co/tpz8vYys/editor-202508261321441a3u.png"
                alt=""
                className=""
              />
            </div>

            <div className="mx-3 text-gray-900 text-center text-sm">
              <span className="text-[14px]">
                [ .in ] Domain Expiry
                <br />
              </span>
            </div>

            <div className="mx-3 text-gray-900 text-center text-sm mt-3">
              <span>Our [ .in ] domains will expire soon.</span>

              <p>
                Please use our{" "}
                <a
                  href="#"
                  className="text-blue-700"
                  onClick={(e) => e.preventDefault()}
                >
                  Main Domain
                </a>{" "}
                or contact Customer Service / your Upline for the latest active
                domain to avoid service interruption.
              </p>
            </div>

            <div className="flex justify-center mt-3">
              <a
                href="#"
                className="uppercase text-blue-700 text-sm"
                onClick={(e) => e.preventDefault()}
              >
                Main DOMAIN Click Here
              </a>
            </div>
          </div>

          <button
            className="flex justify-center text-base w-60 blue-linear2 m-auto text-center rounded-full p-1.5 tracking-widest text-color"
            onClick={handleTopup3}
          >
            Confirm
          </button>
        </div>
      )}

      {/* ========================================================
          POPUP 3
          GIFT CODE
      ======================================================== */}

      {topup4 && (
        <div className="absolute top-56 left-0 right-0 flex m-auto flex-col bg-light mx-8 pb-4 rounded-xl z-[9999]">
          <div className="blue-linear2 text-center p-2 font-bold text-lg text-white rounded-t-xl">
            🎁 GIFT CODE 🎁
          </div>

          <div className="pt-5 h-96 text-whites text-[15px] bg-light">
            <span className="flex justify-center text-[13px]">
              ❤️ Your JOY is our PRIORITY ❤️
            </span>

            <h3 className="text-center mt-4 text-sm">
              Download Chennai91 APP now
            </h3>

            <div className="flex flex-col justify-center items-center px-5 h-40 w-full pb-3">
              <a
                href="#"
                className="text-blue-600 text-[13px] mt-1"
                onClick={(e) => e.preventDefault()}
              >
                ➡️CLICK HERE TO DOWNLOAD⬅️
              </a>

              <img
                src="https://i.ibb.co/LhCtrCF2/editor-20250825223331njkc.png"
                alt=""
                className=""
              />
            </div>

            <div className="mx-3 text-gray-900 text-center text-base">
              <span className="text-[15px]">
                ⚠️ Don’t miss it !
                <br />
              </span>
            </div>

            <div className="mx-3 text-gray-900 text-center text-sm">
              <span>Daily gift codes waiting for you in the app !</span>

              <p>
                🎁 Check the{" "}
                <a
                  href="#"
                  className="text-purple-600 text-[13px]"
                  onClick={(e) => e.preventDefault()}
                >
                  Activity Page
                </a>{" "}
                for more bonuses! 🎁
              </p>
            </div>
          </div>

          <button
            className="flex justify-center text-base w-60 blue-linear2 m-auto text-center rounded-full p-2 tracking-widest text-color"
            onClick={handleTopup4}
          >
            Confirm
          </button>
        </div>
      )}

      {/* ========================================================
          POPUP 5
          WELCOME TO 91CLUB
      ======================================================== */}

      {topup5 && (
        <div className="absolute top-56 left-0 right-0 flex m-auto flex-col bg-white mx-8 pb-4 rounded-xl z-[9999] shadow-2xl max-w-md">
          <div className="blue-linear2 text-center p-2 font-bold text-lg text-white rounded-t-xl">
            Welcome to Chennai91
          </div>

          <div className="pt-5 px-5 text-center text-gray-800">
            <p className="text-[13px] leading-tight">
              🎉 Welcome to Chennai91!
              <br />
              Your entertainment journey starts here. Explore our platform,
              discover exciting opportunities, and enjoy a smooth and secure
              gaming environment. Don't forget to visit our Promotion Center for
              the latest offers and rewards.
            </p>

            <p className="text-[13px] leading-relaxed">
              Thank you for being a valued member of Chennai91. We wish you an
              enjoyable and rewarding experience!
            </p>

            {/* LIVE LOGO FROM BACKEND */}
            <div className="flex justify-center items-center mt-8 mb-10">
              <img
                src={bannergetData?.gameall?.logo}
                alt="91Club Logo"
                loading="lazy"
                className="w-[180px] max-h-[80px] object-contain"
              />
            </div>
          </div>

          <button
            className="flex justify-center text-base w-60 blue-linear2 m-auto text-center rounded-full p-2 tracking-widest text-color mt-20"
            onClick={handleTopup5Close}
          >
            Confirm
          </button>
        </div>
      )}

      {/* ========================================================
          POPUP 4
          EXTRA FIRST DEPOSIT BONUS
      ======================================================== */}

      {topup2 && (
        <div id="popup" className="popup bg-light">
          <div className="header-section nav-bg text-white">
            <h4>Extra first deposit bonus</h4>

            <p className="mt-2">Each account can only receive rewards once</p>
          </div>

          <div className="middle-content-section">
            <ul>
              {[
                { recAmount: 100, bonus: 2 },
                { recAmount: 500, bonus: 10 },
                { recAmount: 1000, bonus: 25 },
                { recAmount: 5000, bonus: 150 },
                { recAmount: 10000, bonus: 300 },
                { recAmount: 20000, bonus: 700 },
                { recAmount: 50000, bonus: 2000 },
                { recAmount: 100000, bonus: 5000 },
              ].map((item, i) => (
                <li key={i} onClick={() => navigate("/wallet/Recharge")}>
                  <div className="first-c">
                    <p className="gray-50 text-base">
                      First deposit{" "}
                      <span className="text-[#FDAF62]">
                        {item.recAmount.toLocaleString()}
                      </span>
                    </p>

                    <p className="text-[#FDAF62]">
                      +₹{item.bonus.toLocaleString()}.00
                    </p>
                  </div>

                  <p className="gray-100 text-xs">
                    Deposit {item.recAmount.toLocaleString()} for the first time
                    in your account and you can receive{" "}
                    {(
                      Number(item.recAmount) + Number(item.bonus)
                    ).toLocaleString()}
                  </p>

                  <div className="bottom-c">
                    <div className="slider-box bg-[#ced6e1]">
                      0/{item.recAmount.toLocaleString()}
                    </div>

                    <button
                      className="border fs-sm border-[#FDAF62]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/wallet/Recharge");
                      }}
                    >
                      Deposit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bottom-section">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="hidden peer"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />

                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center peer-checked:border-[var(--bg-color-l)] peer-checked:bg-[var(--bg-color-l)]">
                  <svg
                    className={`w-4 h-4 text-black ${
                      isChecked ? "block" : "hidden"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414L8 11.586l6.793-6.793a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <span className="text-gray-500 ms-2 mr-2 fs-sm cursor-pointer">
                  No more reminders today
                </span>
              </label>
            </div>

            <button
              className="activity blue-linear text-white"
              onClick={() => setTopup2(false)}
            >
              Activity
            </button>
          </div>

          <span onClick={handleTopup2Close} className="cursor-pointer">
            <RxCrossCircled className="m-auto flex text-center absolute left-0 right-0 justify-center text-2xl mt-4" />
          </span>
        </div>
      )}

      {/* ========================================================
          APK DOWNLOAD
      ======================================================== */}

      <Apkdownload />
    </Layout>
  );
};

export default Home;
