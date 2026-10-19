import { useEffect } from "react";
import Layout from "../../layout/Layout";
import "./activity.css";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";

const InvitationImg = "https://i.ibb.co/60fp56NM/activity-Reward.png";
const bettingImg = 'https://i.ibb.co/Kz8vtWT/Betting-Rebate.png"';
const SupperImg = "https://i.ibb.co/1MbggqG/super-Jackpot.png";
const MemberGiftImg = "https://i.ibb.co/Hg13hYF/member-Gift.png";
const InviteImg = "https://i.ibb.co/BVPYF4zq/invite-wheel-bb332472.webp";
const GiftImg = "https://i.ibb.co/GkJh6My/sign-In-Banner.png";
const AttendanceImg = "https://i.ibb.co/PCm07tj/gift-Redeem.png";

const Activity = () => {
  const { loader, bannergetData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <Layout>
      <div className="flex justify-center nav-bg sticky top-0">
        <img
          src={bannergetData?.gameall?.logo1}
          alt=""
          loading="lazy"
          className="w-32"
        />
      </div>

      {loader && <Loader />}
      <div className="nav-bg text-center text-white py-6">
        <div className="flex justify-center items-center space-x-8 mb-5">
          <div>
            <p className="text-sm text-white">Today's bonus</p>
            <p className="text-xl font-bold text-white">₹0.00</p>
          </div>

          <div className="h-8 w-px bg-gray-100"></div>

          <div>
            <p className="text-sm text-white">Total bonus</p>
            <p className="text-xl font-bold text-white">₹0.00</p>
          </div>
        </div>

        <button className="border font-semibold text-[#F95959] px-6 py-2 rounded-full  transition bg-light">
          Bonus details
        </button>
      </div>
      <div className="container-section mt-3">
        <div className="flex justify-around items-center">
          <div
            className=" flex flex-col justify-center items-center "
            onClick={() => navigate("/main/ActivityAward")}
          >
            <img src={InvitationImg} alt="" loading="lazy" className="w-10" />
            <p className="fs-sm gray-text leading-3 mt-2">Activity Award</p>
          </div>

          <div
            className=" flex flex-col justify-center items-center"
            onClick={() => navigate("/main/Laundry")}
          >
            <img src={bettingImg} alt="" loading="lazy" className="w-10" />
            <p className="fs-sm gray-text leading-3 mt-2">Betting rebate</p>
          </div>
          <div
            className=" flex flex-col justify-center items-center"
            onClick={() => navigate("/main/SuperJackpot")}
          >
            <img src={SupperImg} alt="" loading="lazy" className="w-10" />
            <p className="fs-sm gray-text leading-3 mt-2">Super Jackpot</p>
          </div>
          <div
            className="flex flex-col justify-center items-center"
            onClick={() => navigate("/activity/MemberPackage")}
          >
            <img src={MemberGiftImg} alt="" loading="lazy" className="w-10" />
            <p className="fs-sm gray-text leading-3 mt-2">Frist Gift</p>
          </div>
        </div>
        <div
          className="flex flex-col pt-5"
          onClick={() => navigate("/WheelSpin")}
        >
          <img src={InviteImg} alt="" loading="lazy" className="w-10 ml-7" />
          <p className="fs-sm gray-text leading-3 mt-2 pl-3">Invite Wheel</p>
        </div>

        <div className="grid grid-cols-12 gap-3 mt-5">
          <div
            className="col-span-6 bg-body rounded-md"
            onClick={() => navigate("/main/RedeemGift")}
          >
            <img src={GiftImg} alt="" loading="lazy" />
            <div className="p-2 mb-3">
              <h3 className="heading-h3 text-whites mb-1 text-base font-bold">
                Gift
              </h3>
              <p className="gray-text fs-sm">
                Enter the redemption code to recieve gift rewards
              </p>
            </div>
          </div>
          <div
            className="col-span-6 bg-body rounded-md"
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

        <div
          className="bg-body mt-3 rounded-xl"
          onClick={() => navigate("/activity/ActivityDetail?id=2")}
        >
          <img
            src={bannergetData?.activity?.ban1}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            Mega Spin Event
          </h3>
        </div>

        <div
          className="bg-body mt-3 rounded-xl"
          onClick={() => navigate("/activity/DepositBouns")}
        >
          <img
            src={bannergetData?.activity?.ban2}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            First Deposit Bonus
          </h3>
        </div>
        <div
          className="bg-body mt-3 rounded-xl"
          onClick={() => navigate("/activity/ActivityDetail?id=3")}
        >
          <img
            src={bannergetData?.activity?.ban3}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            Benefits of Using ARWALLET
          </h3>
        </div>
        <div
          className="bg-body mt-3 rounded-xl"
          onClick={() => navigate("/activity/ActivityDetail?id=4")}
        >
          <img
            src={bannergetData?.activity?.ban4}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            Chennai91 Super Jackpot
          </h3>
        </div>
        <div
          className="bg-body mt-3 rounded-xl"
          onClick={() => navigate("/activity/ActivityDetail?id=5")}
        >
          <img
            src={bannergetData?.activity?.ban5}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            Chennai91 Real-Time Rebate
          </h3>
        </div>
        <div
          className="bg-body mt-3 rounded-xl"
          onClick={() => navigate("/activity/ActivityDetail?id=6")}
        >
          <img
            src={bannergetData?.activity?.ban6}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            Chennai91 Youtube Creative Video Event
          </h3>
        </div>
        <div
          className="bg-body mt-3 rounded-xl"
          onClick={() => navigate("/activity/ActivityDetail?id=7")}
        >
          <img
            src={bannergetData?.activity?.ban7}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            Chennai91 Winstreak Bonus
          </h3>
        </div>

        <div
          className="bg-body mt-3 rounded-xl"
          onClick={() => navigate("/activity/ActivityDetail?id=8")}
        >
          <img
            src={bannergetData?.activity?.ban8}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            Partner Rewards
          </h3>
        </div>

        <div
          className="bg-body mt-3 rounded-xl"
          onClick={() => navigate("/activity/ActivityDetail?id=9")}
        >
          <img
            src={bannergetData?.activity?.ban9}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            Special Attendance Bonus
          </h3>
        </div>
        {/* <div
          className="bg-body mt-3 rounded-xl"
          onClick={() => navigate("/activity/ActivityDetail?id=10")}
        >
          <img
            src={"https://i.ibb.co/wrp8d0qm/banner11.png"}
            alt=""
            loading="lazy"
            className="rounded-t-xl h-44 w-full"
          />
          <h3 className="heading-h3 text-whites font-bold p-2">
            Weekly Betting Rewards
          </h3>
        </div> */}
      </div>
    </Layout>
  );
};

export default Activity;
