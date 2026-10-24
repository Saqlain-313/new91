import { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { HiUsers } from "react-icons/hi2";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { PiCopySimpleLight } from "react-icons/pi";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../layout/Layout";
import "./promotion.css";

// Import Popup2 component

import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import CommissionDetailImg from "../../assets/commisiondetail.png";
import CopyCodeImg from "../../assets/copyinvitationcode.png";
import CustomerServiceImg from "../../assets/customerserviceIcon.png";
import InvitationRuleImg from "../../assets/invitationrule.png";
import promotindataImg from "../../assets/promotiondeal.png";
import RebaterationImg from "../../assets/rebateratio.png";
import SubordinateImg from "../../assets/subordinatedata.png";
import CopyCopmponent from "../../components/CopyCopmponent";
import Loader from "../../components/Loader";
import {
  promotions,
  totalCommission,
} from "../../store/reducer/promotionReducer";

const PartnerReward = "https://i.ibb.co/x8HRG7tZ/icons.png";

const Promotion = () => {
  // Renamed topup2 state to showTopup2 for clarity, to be passed to Popup2
  const [showTopup2, setShowTopup2] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // This seems to be for another popup, kept as is

  const { promotionsData, totalCommissionData } = useSelector(
    (state) => state.promotion,
  );
  const { userInfo } = useSelector((state) => state.auth);
  const { rechargeList2Data } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check if topup2 reminders should be shown today
  const shouldShowTopup2OnLoad = () => {
    const today = new Date().toDateString();
    const lastReminderDate = localStorage.getItem("topup2_lastReminderDate");
    const hideReminders =
      localStorage.getItem("topup2_hideReminders") === "true";

    return !(hideReminders && lastReminderDate === today);
  };

  useEffect(() => {
    // Control body overflow when topup2 or showPopup is active
    if (showTopup2 || showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showTopup2, showPopup]); // Depend on showTopup2 and showPopup

  useEffect(() => {
    // Initialize showTopup2 state based on localStorage on component mount
    if (shouldShowTopup2OnLoad() && rechargeList2Data?.length === 0) {
      setShowTopup2(true);
    }
  }, []); // Run only once on component mount

  const [copyPopup, setCopyPopup] = useState(false);

  const copyToClipCode = () => {
    navigator.clipboard
      .writeText(userInfo?.code)
      .then(() => {
        setCopyPopup(true);
        setTimeout(() => {
          setCopyPopup(false);
        }, 1500);
      })
      .catch((err) => {
        console.error("Failed to copy the text: ", err);
      });
  };

  useEffect(() => {
    dispatch(promotions());
    dispatch(totalCommission());
    window.scrollTo(0, 0);
  }, [dispatch]);

  return (
    <Layout>
      {/* this is promotion page design by maxify web solution and developed by Engineer Jitendra kumar */}
      <div className="nav-bg p-1 py-3 sticky top-0 z-30">
        <div className="container-section flex  items-center">
          {/* <button><Link to={"/activity"}>  <IoIosArrowBack className='text-xl' /></Link></button> */}
          <h3 className="heading-h3 text-whites text-lg font-bold text-center flex justify-center items-center m-auto">
            Agency
          </h3>
          <Link to={"/promotion/Subordinate"}>
            {/* <PiNoteFill className="text-green-600 text-2xl" /> */}
            <svg data-v-600663f7="" className="svg-icon icon-subordinate">
              <use href="#icon-subordinate"></use>
            </svg>
          </Link>
        </div>
      </div>

      {!userInfo && <Loader />}

      <div className="promotion-banner">
        <div className="flex flex-col justify-center items-center pt-3">
          <h3 className="heading-h3 text-2xl text-black">
            {totalCommissionData?.yesterdayBalance?.toFixed(2)}
          </h3>
          <p className="text-sm nav-bg color-blue rounded-full px-3  pb-[2px] flex items-center justify-center text-center my-2 p-1">
            Yesterday's total commission
          </p>
          <p className="fs-sm py-2 text-black">
            Upgrade the level to increase commission income
          </p>

          <div className="promotion-member mt-2 flex items-start nav-bg w-[100%] rounded-lg relative z-10">
            <div className="w-[50%]">
              <div className="sheet_nav_bg flex items-center p-1 rounded-tl-lg">
                <HiUsers className="color-blue text-2xl" />
                <p className="text-sm ms-2 font-normal py-2">
                  Direct subordinates
                </p>
              </div>

              <div className="flex  items-center justify-center flex-col text-center p-2">
                <div>
                  <h5 className="text-whites text-sm">
                    {promotionsData?.level1_count
                      ? promotionsData?.level1_count
                      : "0"}
                  </h5>
                  <p className="text-whites text-sm">number of register</p>
                </div>
                <div>
                  <h5 className="text-green-600 text-sm">
                    {promotionsData?.totalDepositCount
                      ? promotionsData?.totalDepositCount
                      : "0"}
                  </h5>
                  <p className="text-whites text-sm">Deposit number</p>
                </div>
                <div>
                  <h5 className="color-yellow-200 text-sm">
                    {promotionsData?.totalDepositAmount
                      ? promotionsData?.totalDepositAmount
                      : "0"}
                  </h5>
                  <p className="text-whites text-sm">Deposit amount</p>
                </div>
                <div>
                  <h5 className="text-whites text-sm">
                    {promotionsData?.firstDepositCount
                      ? promotionsData?.firstDepositCount
                      : "0"}
                  </h5>
                  <p className="text-whites text-sm">
                    Number of people making first deposit
                  </p>
                </div>
              </div>
            </div>
            <div className="w-[50%] h-full border-l border-text-whites">
              <div className="sheet_nav_bg h-full flex items-center p-1 rounded-tr-lg">
                <FaUsers className="color-blue text-2xl" />
                <p className="text-sm ms-2 font-normal py-2">
                  Team subordinates
                </p>
              </div>
              <div className="flex  items-center justify-center flex-col text-center p-2">
                <div>
                  <h5 className="text-whites text-sm">
                    {promotionsData?.level2_to_level6count
                      ? promotionsData?.level2_to_level6count
                      : "0"}
                  </h5>
                  <p className="text-whites text-sm">number of register</p>
                </div>
                <div>
                  <h5 className="text-green-600 text-sm">
                    {promotionsData?.level2_to_level6totalDepositCount
                      ? promotionsData?.level2_to_level6totalDepositCount
                      : "0"}
                  </h5>
                  <p className="text-whites text-sm">Deposit number</p>
                </div>
                <div>
                  <h5 className="color-yellow-200 text-sm">
                    {promotionsData?.level2_to_level6totalDepositAmount
                      ? promotionsData?.level2_to_level6totalDepositAmount
                      : "0"}
                  </h5>
                  <p className="text-whites text-sm">Deposit amount</p>
                </div>
                <div>
                  <h5 className="text-whites text-sm">
                    {promotionsData?.level2_to_level6firstDepositCount
                      ? promotionsData?.level2_to_level6firstDepositCount
                      : "0"}
                  </h5>
                  <p className="text-whites text-sm">
                    Number of people making first deposit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-section">
        <div
          onClick={() => navigate("/invite")}
          className="blue-linear w-full p-1 text-md font-bold my-2 rounded-full text-center text-black py-2 color-orange"
        >
          <div className="w-full ">INVITAION LINK</div>
        </div>

        <ul className="mt-3">
          <li className="mt-2 text-lg nav-bg p-3 py-4 rounded-lg">
            <Link
              className="flex justify-between items-center "
              to={"/promotion/PartnerReward"}
            >
              <div className="flex items-center">
                <img
                  src={PartnerReward}
                  alt=""
                  loading="lazy"
                  className="filter-imgs w-7"
                />
                <span className="text-sm  text-whites ms-2 font-sans">
                  Partner rewards
                </span>
              </div>
              <div className="flex items-center">
                <MdOutlineArrowForwardIos className="text-xl text-whites" />
              </div>
            </Link>
          </li>

          <li className="mt-2 nav-bg p-3 py-4 rounded-lg">
            <Link className="flex justify-between items-center ">
              <div className="flex items-center">
                <img
                  src={CopyCodeImg}
                  alt=""
                  loading="lazy"
                  className="filter-imgs w-7"
                />
                <span className="text-sm  text-whites ms-2 font-sans">
                  Copy invitation code
                </span>
              </div>
              <div className="flex items-center" onClick={copyToClipCode}>
                <span className="text-sm gray-text mr-2">{userInfo?.code}</span>
                <PiCopySimpleLight />
              </div>
            </Link>
          </li>
          <li className="mt-2 nav-bg p-3 py-4 rounded-lg">
            <Link
              className="flex justify-between items-center "
              to={"/promotion/TeamReport"}
            >
              <div className="flex items-center">
                <img
                  src={SubordinateImg}
                  alt=""
                  loading="lazy"
                  className="filter-imgs w-7"
                />
                <span className="text-sm  text-whites ms-2 font-sans">
                  Subordinate data
                </span>
              </div>
              <div className="flex items-center">
                <MdOutlineArrowForwardIos className="text-xl text-whites" />
              </div>
            </Link>
          </li>

          <li className="mt-2 nav-bg p-3 py-4 rounded-lg">
            <Link
              className="flex justify-between items-center "
              to={"/promotion/searchsubordinate"}
            >
              <div className="flex items-center">
                <img
                  src={SubordinateImg}
                  alt=""
                  loading="lazy"
                  className="filter-imgs w-7"
                />
                <span className="text-sm  text-whites ms-2 font-sans">
                  Search Subordinate
                </span>
              </div>
              <div className="flex items-center">
                <MdOutlineArrowForwardIos className="text-xl text-whites" />
              </div>
            </Link>
          </li>
          <li className="mt-2 nav-bg p-3 py-4 rounded-lg">
            <Link
              className="flex justify-between items-center"
              to={"/promotion/MyCommission"}
            >
              <div className="flex items-center">
                <img
                  src={CommissionDetailImg}
                  alt=""
                  loading="lazy"
                  className="filter-imgs w-7"
                />
                <span className="text-sm  text-whites ms-2 font-sans">
                  Commission detail
                </span>
              </div>
              <div className="flex items-center">
                <MdOutlineArrowForwardIos className="text-xl text-whites" />
              </div>
            </Link>
          </li>
          <li className="mt-2 nav-bg p-3 py-4 rounded-lg">
            <Link
              className="flex justify-between items-center "
              to={"/promotion/PromotionRule"}
            >
              <div className="flex items-center">
                <img
                  src={InvitationRuleImg}
                  alt=""
                  loading="lazy"
                  className="filter-imgs w-7 h-8"
                />
                <span className="text-sm  text-whites ms-2 font-sans">
                  Invitation rules
                </span>
              </div>
              <div className="flex items-center">
                <MdOutlineArrowForwardIos className="text-xl text-whites" />
              </div>
            </Link>
          </li>
          <li className="mt-2 nav-bg p-3 py-4 rounded-lg">
            <Link
              className="flex justify-between items-center "
              to={`https://h5.workorder.support.max-win.site?token=${Cookies.get(
                "auth",
              )}`}
            >
              <div className="flex items-center">
                <img
                  src={CustomerServiceImg}
                  alt=""
                  loading="lazy"
                  className="filter-imgs w-7"
                />
                <span className="text-sm  text-whites ms-2 font-sans">
                  Agent line customer service
                </span>
              </div>
              <div className="flex items-center">
                <MdOutlineArrowForwardIos className="text-xl text-whites" />
              </div>
            </Link>
          </li>
          <li className="mt-2 nav-bg p-3 py-4 rounded-lg">
            <Link
              className="flex justify-between items-center "
              to={"/promotion/RebateRatio"}
            >
              <div className="flex items-center">
                <img
                  src={RebaterationImg}
                  alt=""
                  loading="lazy"
                  className="filter-imgs w-7"
                />
                <span className="text-sm  text-whites ms-2 font-sans">
                  Rebate ratio
                </span>
              </div>
              <div className="flex items-center">
                <MdOutlineArrowForwardIos className="text-xl text-whites" />
              </div>
            </Link>
          </li>
        </ul>

        <div className="mt-2 nav-bg p-2 rounded-lg">
          <div className="flex items-center">
            <img
              src={promotindataImg}
              alt=""
              loading="lazy"
              className="filter-imgs w-7 mr-2"
            />
            <h5 className="heading-h5 text-base text-whites font-sans">
              promotion data
            </h5>
          </div>

          <div className="flex justify-between mt-2">
            <div className="text-center w-[50%]">
              <h5 className="heading-h5  text-sm text-whites">
                {Number(totalCommissionData?.weekBalance)?.toFixed(2)}
              </h5>
              <p className="font-light text-gray-400 leading-5">This Week</p>
            </div>
            <div className="text-center  w-[50%] border-l border-slate-800">
              <h5 className="heading-h5 text-sm text-whites">
                {Number(totalCommissionData?.totalBalance)?.toFixed(2)}
              </h5>
              <p className="font-light text-gray-400 leading-5">
                Total commission
              </p>
            </div>
          </div>

          <div className="flex justify-between mt-3">
            <div className="text-center w-[50%]">
              <h5 className="heading-h5  text-sm text-whites">
                {promotionsData?.invite?.f1}
              </h5>
              <p className="font-light text-gray-400 leading-5">
                direct subordinate
              </p>
            </div>
            <div className="text-center  w-[50%] border-l border-slate-800">
              <h5 className="heading-h5 text-sm text-whites">
                {promotionsData?.total_downline_count}
              </h5>
              <p className="font-light text-gray-400 leading-5">
                Total number of subordinate in the team
              </p>
            </div>
          </div>
        </div>
      </div>
      <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />

      {/* Render Popup2 component */}
      {/* <Popup2
        showPopup={showTopup2}
        onClose={() => {
          setShowTopup2(false);
          // Only show the other popup if yesterdayBalance is greater than 0
          if (totalCommissionData?.yesterdayBalance > 0.0) {
            setShowPopup(true); // Assuming 'showPopup' controls a different popup
          }
        }}
      /> */}
    </Layout>
  );
};

export default Promotion;
