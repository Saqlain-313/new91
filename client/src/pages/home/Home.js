import AOS from "aos";
import "aos/dist/aos.css";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";
import { BsFire } from "react-icons/bs";
import { RiVolumeUpFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import MainLoader from "../../components/MainLoader";
import Popup2 from "../../components/Popup2"; // Assuming Popup2 exists in this path
import Layout from "../../layout/Layout";
import { userDetail } from "../../store/reducer/authReducer";
import { rechargeList2, recharheBonus } from "../../store/reducer/userReducer";
import { Alerts } from "./Alerts";
import Apkdownload from "./Apkdownload";
import EarningChart from "./EarningChart";
import "./home.css";
import PlatformDetails from "./lottery/PlatformDetails";
import SlotComponents from "./lottery/SlotComponents";
import WinningInformation from "./WinningInformation";

const Home = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { bannergetData, rechargeList2Data } = useSelector(
    (state) => state.user,
  );
  const { totalCommissionData } = useSelector((state) => state.promotion);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState(true);
  const [topup, setTopup] = useState(false);
  const [topup2, setTopup2] = useState(false);
  const [topup3, setTopup3] = useState(false);
  const [mainLoader, setMainloader] = useState(false);
  const [apps, setApp] = useState(true);

  // In your component, initialize AOS in useEffect
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true, // This makes animations happen only once when scrolling
    });
  }, []);

  const handleCheckboxChange = () => {
    setTopup2(false);
  };

  useEffect(() => {
    dispatch(recharheBonus());
  }, [dispatch]);

  const debouncedDispatch = useCallback(
    debounce(() => {
      dispatch(userDetail());
    }), // Adjust the debounce delay as needed
    [dispatch],
  );
  useEffect(() => {
    debouncedDispatch(); // Call the debounced dispatch function
    window.scrollTo(0, 0);
    const data = localStorage.getItem("topup");

    if (data == "true") {
      setTopup(true);
    }
  }, [debouncedDispatch]); // Empty dependency array ensures it runs only once
  const handleTopup = () => {
    localStorage.setItem("topup", false);
    setTopup(false);
    setTopup3(true);
  };

  useEffect(() => {
    const data = localStorage.getItem("app");

    if (data === "closed") {
      setApp(false);
    } else {
      setApp(true);
    }

    if (localStorage.getItem("topup") === "false") {
      const today = new Date().toDateString();
      const lastReminderDate = localStorage.getItem("topup2_lastReminderDate");
      const hideReminders =
        localStorage.getItem("topup2_hideReminders") === "true";
      console.log(
        "!(hideReminders && lastReminderDate === today)",
        !(hideReminders && lastReminderDate === today),
        userInfo,
      );
      console.log("rechargeList2Data", rechargeList2Data);

      if (
        !(hideReminders && lastReminderDate === today) &&
        userInfo &&
        (rechargeList2Data?.length === 0 || rechargeList2Data === null)
      ) {
        setTopup2(true);
      } else {
        setTopup2(false);
      }
    }
  }, [rechargeList2Data]);

  // useEffect(() => {
  //   const data = localStorage.getItem("app");

  //   if (data === "closed") {
  //     setApp(false);
  //   } else {
  //     setApp(true);
  //   }

  //   dispatch(totalCommission());
  // }, []);

  useEffect(() => {
    dispatch(rechargeList2());
    // Function to handle when the page has fully loaded
    const handleLoad = () => {
      console.log("Loading complete.");
      setMainloader(false);
    };

    if (performance.getEntriesByType("navigation")[0].type === "navigate") {
      console.log("Loading started in a new tab...");

      setMainloader(true);
      setTimeout(() => {
        setMainloader(false);
      }, 1000);
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  useEffect(() => {
    if (topup || topup2 || topup3) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "auto"; // or 'visible' depending on your default
    };
  }, [topup2, topup, topup3]);

  const notices = {
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    vertical: true,
    autoplay: true,
    autoplaySpeed: 4000,
    verticalSwiping: true,
    arrows: false, // This removes the arrows
    cssEase: "linear", // Smooth scrolling effect
  };

  const [showPopup, setShowPopup] = useState(false);
  const handleReceive = () => {
    setShowPopup(false);
  };
  const handlePopup2Close = () => {
    setTopup2(false);
  };

  const handleClose3 = () => {
    setTopup3(false);
    if (rechargeList2Data?.length === 0) {
      setTopup2(true);
    }
  };

  return (
    <Layout>
      <div
        style={{
          position: "fixed",
          zIndex: 500,
        }}
        className="flex flex-col right-0 bottom-36"
      >
        <Link to={userInfo?.telegram} style={{ display: "inline-block" }}>
          <img src="/telegram.png" alt="Service" className="w-20" />
        </Link>
      </div>

      <div className={topup ? "overlay-section block" : "hidden"}></div>
      <div className={topup2 ? "overlay-section block" : "hidden"}></div>
      <div className={topup3 ? "overlay-section block" : "hidden"}></div>
      {topup && (
        <div
          className="absolute top-20 left-0 right-0 flex m-auto flex-col blue-linear text-black  mx-8 pb-2 rounded-xl z-[9999]"
          data-aos="zoom-in"
          data-aos-duration="500"
        >
          <div className="bg-popup-nav text-center p-2 font-bold text-lg text-white rounded-t-xl">
            ✅ Welcome To {bannergetData?.gameall?.name} ✅
          </div>
          <div className=" py-2 font-medium  text-black text-[15px] nav-bg ">
            <div className="text-center comic-neue-regular text-[18px]  px-2">
              <span className=" text-whites bg-transparent">
                🚨🚨🚨FOLLOW OUR LATEST INFORMATION AND NEWS IN 👇👇👇
              </span>
            </div>
            <br />
            <div className="text-center">
              <span className="text-sm font-extrabold text-whites">
                🌟{bannergetData?.gameall?.name} OFFICIAL TELEGRAM🌟
              </span>

              <div className="mt-3">
                <span className=" text-whites font-bold text-lg leading-[23px] tracking-[1px]">
                  📢 Important Announcement: <br /> Beware of Imitations!
                </span>
              </div>
              <div className="mt-3">
                <span className="text-[16px] font-light text-whites">
                  Dear Valued Members,
                </span>
              </div>
              <div className="mt-3 mx-2 text-whites">
                <span className="text-[15px] font-medium">
                  We have noticed an increase in imitation of our PLATFORM,
                  {bannergetData?.gameall?.name} . To ensure you are on the
                  legitimate {bannergetData?.gameall?.name} website (
                  <span>
                    <Link className="text-blue-700" to="https://max-win.site/">
                      max-win.site
                    </Link>
                  </span>
                  ) please verify authenticity through our official channels.
                  Stay vigilant and report any suspicious activity.
                </span>
              </div>
              <div className="mx-3 mt-3">
                <span className="text-[15px] text-whites font-extrabold">
                  Thank you for your continued trust and support
                </span>
                <span>✅</span>
              </div>
            </div>
          </div>
          <button
            className=" flex justify-center  text-base  w-52   m-auto text-center  rounded-full p-1  tracking-widest text-black"
            onClick={handleTopup}
          >
            Confirm
          </button>
        </div>
      )}

      {topup3 && (
        <div
          className="absolute top-20 left-0 right-0 flex m-auto flex-col blue-linear text-black  mx-8 pb-2 rounded-xl z-[9999]"
          data-aos="zoom-in"
          data-aos-duration="500"
        >
          <div className="bg-popup-nav text-center p-2 font-bold text-lg text-white rounded-t-xl">
            Welcome To {bannergetData?.gameall?.name}
          </div>
          <div className=" py-2 pt-5 font-medium  text-black text-[15px] nav-bg">
            <div className="text-center  text-[15px]  px-2 ">
              <span className=" text-whites bg-transparent">
                👑 WELCOME TO {bannergetData?.gameall?.name} 👑
              </span>
            </div>
            <br />
            <div className="text-center">
              <span className="text-sm font-extrabold text-whites">
                🚨 Avoid Scams, Stay Safe 🚨
              </span>

              <div className="">
                <span className="text-[16px] font-light text-whites">
                  🔐 Protect Your Personal Information 🔐
                </span>
              </div>
              <div className="">
                <span className="text-[16px] font-light text-whites">
                  🎁 Enjoy the Rewards We Offer 🎁
                </span>
              </div>
              <div className="">
                <span className="text-[16px] font-light text-whites">
                  ✅ Experience the Fastest and Safest Transactions ✅
                </span>
              </div>

              <div className="mx-3 mt-3 text-whites mb-12">
                <span className="text-[15px]  ">
                  🚀 Have Fun and Good Luck! 🚀 <br />
                </span>
                <span>Welcome to {bannergetData?.gameall?.name}</span>
              </div>
            </div>
          </div>
          <button
            className=" flex justify-center  text-base  w-52   m-auto text-center  rounded-full p-1  tracking-widest text-black"
            onClick={handleClose3}
          >
            Confirm
          </button>
        </div>
      )}

      {/* Popup 2 */}
      {topup2 && (
        <Popup2
          showPopup={topup2}
          onClose={handlePopup2Close}
          isChecked={isChecked}
          handleCheckboxChange={handleCheckboxChange}
          className="z-50"
          data-aos="zoom-in"
          data-aos-duration="500"
        />
      )}

      {/* Commission Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#201d2b] rounded-2xl shadow-xl p-4 w-[21rem] text-center relative">
            <img
              src="https://i.ibb.co/NdLQwsCh/popup-img-01.png"
              alt=""
              className="absolute w-[9rem] right-0 left-0 flex m-auto top-[-25px]"
            />

            {/* Marvelous Message */}
            <h2 className="text-xl font-semibold text-gray-200 mb-2 pt-20">
              marvelous!
            </h2>
            <p className="text-gray-500 mb-2 font-normal text-sm">
              Your invitation reward has been settled
            </p>

            {/* Commission Display */}
            <div className="flex items-center justify-center gap-1 text-2xl font-normal text-yellow-700 mb-6">
              <span className="text-gray-500 text-sm">Commission</span>
              <span className="text-base">
                {totalCommissionData?.yesterdayBalance?.toFixed(2)}
              </span>
            </div>

            {/* Receive Button */}
            <button
              onClick={handleReceive}
              className="w-[80%] py-1 rounded-3xl text-xl font-bold  blue-linear text-black"
            >
              Receive
            </button>
          </div>
        </div>
      )}

      <div className="home-bg sticky top-0 z-20 bg-[#201D2B]">
        {userInfo && userInfo ? (
          <div className="flex items-center justify-between rounded-md px-3 py-2">
            <div className="flex items-center">
              <div className="logo">
                <img
                  src={bannergetData?.gameall?.logo}
                  alt="loading img"
                  loading="lazy"
                  className="w-[140px]"
                />
              </div>
            </div>
            <div className="flex items-center">
              <svg data-v-3dc40049 className="svg-icon icon-wallet1">
                <use xlinkHref="#icon-wallet1" />
              </svg>
              <div className="ms-1">
                <p className="fs-sm">Balance</p>
                <p className="fs-sm font-medium text-blue mt-1">
                  ₹{" "}
                  {userInfo?.money_user
                    ? Number(userInfo?.money_user).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center p-[2px] justify-between rounded-md px-3">
            <div className="logo py-2">
              <img
                src={bannergetData?.gameall?.logo}
                alt="loading img"
                loading="lazy"
                className="w-[140px]"
              />
            </div>
            <div className="flex items-center">
              <button
                className="blue-linear text-black p-1 px-3 text-sm rounded-md"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="text-blue ml-2 px-2 p-1 border border-[#21D9CC] text-sm rounded-md"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </div>
          </div>
        )}
      </div>

      <Alerts />

      {mainLoader && <MainLoader />}

      {/* Banner */}
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
            {[3, 7, 8, 9, 10].map((num) => (
              <SwiperSlide key={num}>
                <div className="w-full">
                  <img
                    src={bannergetData?.data?.[`ban${num}`]}
                    className="w-full rounded-md h-36"
                    alt=""
                    loading="lazy"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Notice board */}
          <div className="banner-notice nav-bg mt-[1.7rem]  rounded-full flex items-center justify-between">
            <RiVolumeUpFill className="text-lg text-blue absolute" />
            <div className="slider-container h-[33px] ms-6 mr-2 overflow-hidden">
              <Slider {...notices}>
                <div>
                  <h3 className="text-[12px] leading-[1rem] text-white">
                    Welcome to the {bannergetData?.gameall?.name}! Greetings,
                    Gamers and Enthusiasts! The {bannergetData?.gameall?.name}
                  </h3>
                </div>
                <div>
                  <h3 className="text-[12px] leading-[1rem] text-white">
                    If your deposit not receive, please send it directly to{" "}
                    {bannergetData?.gameall?.name} Self-service Center
                  </h3>
                </div>
                <div>
                  <h3 className="text-[12px]  leading-[1rem] text-white">
                    Please be sure to always use our official website for
                    playing the games with the following link, phishing links
                  </h3>
                </div>
              </Slider>
            </div>
            <span className="float-end text-xl relative mr-2">
              <Link
                to={"/main/Notification"}
                className="flex items-center blue-linear text-black p-2 rounded-2xl px-4"
              >
                <BsFire className="text-black mr-1 fs-sm" />
                <span className="text-black font-semibold fs-sm">Detail</span>
              </Link>
            </span>
          </div>
        </div>
      </div>

      <SlotComponents />

      <div className="container-section overflow-x-hidden">
        <WinningInformation />

        <EarningChart />
      </div>

      {/* <BasicTools /> */}

      <div>
        <PlatformDetails />
      </div>

      <Apkdownload />
    </Layout>
  );
};

export default Home;
