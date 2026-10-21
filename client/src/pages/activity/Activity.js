import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import Layout from "../../layout/Layout";
import "./activity.css";

// Import Popup2 component (ensure path is correct based on your file structure)

const InvitationImg = "https://i.ibb.co/pvdxFQds/invitation-Bonus-aa7acbd3.png";
const bettingImg = "https://i.ibb.co/Kz8vtWT/Betting-Rebate.png";
const SupperImg = "https://i.ibb.co/1MbggqG/super-Jackpot.png";
const MemberGiftImg = "https://i.ibb.co/Hg13hYF/member-Gift.png";

const GiftImg = "https://i.ibb.co/GkJh6My/sign-In-Banner.png";
const AttendanceImg = "https://i.ibb.co/PCm07tj/gift-Redeem.png";

const Activity = () => {
  // State to control the visibility of Popup2, initialized based on localStorage
  const [showPopup2, setShowPopup2] = useState(false);
  // This state likely controls a different popup, kept as is
  const [showOtherPopup, setShowOtherPopup] = useState(false);

  const { loader, bannergetData, totalCommissionData, rechargeList2Data } =
    useSelector((state) => state.user);
  const navigate = useNavigate();

  // Function to determine if Popup2 should be shown on initial load
  const shouldShowPopup2OnLoad = () => {
    const today = new Date().toDateString();
    const lastReminderDate = localStorage.getItem("topup2_lastReminderDate");
    const hideReminders =
      localStorage.getItem("topup2_hideReminders") === "true";

    // Show Popup2 if reminders are not hidden for today
    return !(hideReminders && lastReminderDate === today);
  };

  // Effect to manage body overflow when any popup is active
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (showPopup2 || showOtherPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function to reset overflow when component unmounts or states change
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showPopup2, showOtherPopup]);

  // Effect to initialize Popup2 visibility on component mount
  useEffect(() => {
    if (shouldShowPopup2OnLoad() && rechargeList2Data?.length === 0) {
      setShowPopup2(true);
    }
  }, []); // Empty dependency array means this runs only once on mount

  // Handle closing Popup2
  const handlePopup2Close = () => {
    setShowPopup2(false);
    // You can add logic here to trigger 'showOtherPopup' if needed after Popup2 closes
    // For example, if totalCommissionData.yesterdayBalance > 0.0 should open the other popup
    if (totalCommissionData?.yesterdayBalance > 0.0) {
      setShowOtherPopup(true);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center nav-bg sticky top-0">
        <img
          src={bannergetData?.gameall?.logo1}
          alt=""
          loading="lazy"
          className="w-28 m-2"
        />
      </div>

      {loader && <Loader />}
      <div className="nav-bg p-5">
        <h3 className="heading-h3 font-medium mb-2">Activity</h3>
        <p className="fs-sm pb-1">Please remember to follow the event page</p>
        <p className="fs-sm">
          We will launch user feedback activities from to time
        </p>
      </div>
      <div className="container-section mt-3">
        {/* 2 Row 4 Column Grid Icon Section */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 justify-items-center">
          <div
            className="flex flex-col justify-center items-center"
            onClick={() => navigate("/main/InvitationBonus")}
          >
            <img src={InvitationImg} alt="" loading="lazy" className="w-10" />
            <p className="fs-sm gray-text text-center whitespace-nowrap leading-3 mt-2">
              Invitation Bonus
            </p>
          </div>

          {/* <div
            className="flex flex-col justify-center items-center"
            onClick={() => navigate("/main/ActivityAward")}
          >
            <img src={MemberGiftImg} alt="" loading="lazy" className="w-10" />
            <p className="fs-sm gray-text text-center whitespace-nowrap leading-3 mt-2">
              Activity Reward
            </p>
          </div> */}

          <div
            className="flex flex-col justify-center items-center"
            onClick={() => navigate("/main/Laundry")}
          >
            <img src={bettingImg} alt="" loading="lazy" className="w-10" />
            <p className="fs-sm gray-text text-center whitespace-nowrap leading-3 mt-2">
              Betting Rebate
            </p>
          </div>

          <div
            className="flex flex-col justify-center items-center"
            onClick={() => navigate("/main/SuperJackpot")}
          >
            <img src={SupperImg} alt="" loading="lazy" className="w-10" />
            <p className="fs-sm gray-text text-center whitespace-nowrap leading-3 mt-2">
              Super Jackpot
            </p>
          </div>

          {/*  <div
            className="flex flex-col justify-center items-center"
            onClick={() => navigate("/main/firstgift")}
          >
            <img src={MemberGiftImg} alt="" loading="lazy" className="w-10" />
            <p className="fs-sm gray-text text-center whitespace-nowrap leading-3 mt-2">
              Frist Gift
            </p>
          </div>
*/}
          {/* Fillers for full 2x4 grid */}
          <div></div>
          <div></div>
          <div></div>
        </div>

        {/* Gift and Attendance Cards */}
        <div className="grid grid-cols-12 gap-3 mt-5">
          <div
            className="col-span-6 nav-bg rounded-md"
            onClick={() => navigate("/main/RedeemGift")}
          >
            <img src={GiftImg} alt="" loading="lazy" />
            <div className="p-2 mb-3">
              <h3 className="heading-h3 text-whites mb-1 text-base font-bold">
                Gift
              </h3>
              <p className="gray-text fs-sm">
                Enter the redemption code to receive gift rewards
              </p>
            </div>
          </div>
          <div
            className="col-span-6 nav-bg rounded-md"
            onClick={() => navigate("/activity/DailySignIn")}
          >
            <img src={AttendanceImg} alt="" loading="lazy" />
            <div className="p-2 mb-3">
              <h3 className="heading-h3 text-whites mb-1 text-base font-bold">
                Attendance bonus
              </h3>
              <p className="gray-text fs-sm">
                The more consecutive days you sign in, the higher the reward
                will be.
              </p>
            </div>
          </div>
        </div>

        {/* Banners and Bonus Sections */}
        <div
          className="nav-bg mt-3 rounded-xl"
          onClick={() => navigate("/activity/DepositBouns")}
        >
          <img
            src={bannergetData?.activity?.ban1}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            Member First Deposit Bonus
          </h3>
        </div>

        <div
          className="nav-bg mt-3 rounded-xl"
          onClick={() => navigate("/promotion/PartnerReward")}
        >
          <img
            src={bannergetData?.activity?.ban2}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            AGENT REFFERAL BONUS
          </h3>
        </div>

        <div
          className="nav-bg mt-3 rounded-xl"
          onClick={() => navigate("/main/InvitationBonus")}
        >
          <img
            src={bannergetData?.activity?.ban3}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            REFFERAL BONUS
          </h3>
        </div>

        <div
          className="nav-bg mt-3 rounded-xl"
          onClick={() => navigate("/activity/ActivityDetail?id=4")}
        >
          <img
            src={bannergetData?.activity?.ban4}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            RECHARGE BONUS FOR NEW PLAYERS
          </h3>
        </div>

        <div
          className="nav-bg mt-3 rounded-xl"
          onClick={() => navigate("/activity/ActivityDetail?id=5")}
        >
          <img
            src={bannergetData?.activity?.ban5}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            7-DAYS CUMULATIVE BETTING REWARDS
          </h3>
        </div>

        <div
          className="nav-bg mt-3 rounded-xl"
          // onClick={() => navigate("/main/ActivityAward")}
        >
          <img
            src={bannergetData?.activity?.ban6}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            MINI GAMES DAILY MISSION REWARDS
          </h3>
        </div>

        <div
          className="nav-bg mt-3 rounded-xl"
          onClick={() => navigate("/activity/ActivityDetail?id=7")}
        >
          <img
            src={bannergetData?.activity?.ban7}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            Benefits of Using AR WALLET
          </h3>
        </div>

        <div
          className="nav-bg mt-3 rounded-xl"
          onClick={() => navigate("/main/firstgift")}
        >
          <img
            src={bannergetData?.activity?.ban8}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            New Member Gift Package
          </h3>
        </div>

        {/* <div
          className="nav-bg mt-3 rounded-xl"
          onClick={() => navigate("/activity/ActivityDetail?id=9")}
        >
          <img
            src={bannergetData?.activity?.ban9}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            WEEKLY DEPOSIT BONUS FOR AGENT
          </h3>
        </div> */}
      </div>

      {/* Render Popup2 component */}
      {/* <Popup2
        showPopup={showPopup2} // Pass the correct state for Popup2 visibility
        onClose={handlePopup2Close} // Use the dedicated close handler for Popup2
      /> */}
    </Layout>
  );
};

export default Activity;
