import React, { useEffect, useState } from "react";

import { IoDiamondSharp } from "react-icons/io5";
import Rewards from "../../assets/rewards.png";
import MRewards from "../../assets/coince.png";
import Safe from "../../assets/safe.png";
import Rate from "../../assets/rate.png";
import Wallet from "../../assets/balance.png";
import { RiVipDiamondFill } from "react-icons/ri";
import { BsDatabaseFill } from "react-icons/bs";

import "./vip.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import vip1 from "../../assets/1-1fca7935.png";
import vip11 from "../../assets/1-d951dc6d.png";
import vip2 from "../../assets/2-fcf77958.png";
import vip22 from "../../assets/2-5df32e87.png";
import vip3 from "../../assets/3-9cf04b7e.png";
import vip4 from "../../assets/4-a4cfd018.png";
import vip5 from "../../assets/5-89e9b349.png";
import vip6 from "../../assets/6-05959c7c.png";
import vip7 from "../../assets/7-a50aebe0.png";
import vip8 from "../../assets/8-8cbed392.png";
import vip9 from "../../assets/9-63365227.png";
import vip10 from "../../assets/10-0eaf39a0.png";
import vipBg1 from "../../assets/bg1-7ff97a99.png";
import vipBg2 from "../../assets/bg2-ee7fbf5e.png";
import vipBg3 from "../../assets/bg3-96f1cdae.png";
import vipBg4 from "../../assets/bg4-c3caf0f8.png";
import vipBg5 from "../../assets/bg5-e2132369.png";
import vipBg6 from "../../assets/bg6-8b5d1b4f.png";
import vipBg7 from "../../assets/bg7-535312da.png";
import vipBg8 from "../../assets/bg8-8bdc102c.png";
import vipBg9 from "../../assets/bg9-74d6723d.png";
import vipBg10 from "../../assets/bg10-76abb4b7.png";

import VIPCard from "./VIPCard";
import { useDispatch, useSelector } from "react-redux";
import { AvatarData, VIPImg } from "../main/AvatarData";
import {
  invitationBonus,
  vipLevel,
  vipsectionData,
} from "../../store/reducer/activityReducer";
import CustomeNavbar from "../../components/CustomeNavbar";

const Vip = () => {
  const [activeRule, setActiveRule] = useState(1);
  const { userInfo } = useSelector((state) => state.auth);
  const { vipLevelData } = useSelector((state) => state.activity);

  const dispatch = useDispatch();
  const [count, setCount] = useState(1);
  const [exp, setExp] = useState(0);
  const [vipData, setVipData] = useState([]);

  const [daysLeft, setDaysLeft] = useState(0);
  const [hoursLeft, setHoursLeft] = useState(0);

  useEffect(() => {
    const currentDate = new Date();
    let lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // If the last day of the month is 31, decrease it by one day
    if (lastDayOfMonth.getDate() === 31) {
      lastDayOfMonth.setDate(lastDayOfMonth.getDate() + 1);
    }

    const timeDiff = lastDayOfMonth.getTime() - currentDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const hoursDiff = Math.floor(
      (timeDiff % (1000 * 3600 * 24)) / (1000 * 3600)
    );

    setDaysLeft(daysDiff);
    setHoursLeft(hoursDiff);
  }, []);

  const levels = [
    {
      level: 1,
      progress: exp,
      maxProgress: vipData[0]?.amount,
      bgColor: "#889ebe",
      vipImage: vip1,
      iconImage: vip11,
      bgImage: vipBg1,
      track: "#647a9a",
    },
    {
      level: 2,
      progress: exp,
      maxProgress: vipData[1]?.amount,
      bgColor: "#e2984e",
      vipImage: vip2,
      iconImage: vip22,
      bgImage: vipBg2,
      track: "#d57c26",
    },
    {
      level: 3,
      progress: exp,
      maxProgress: vipData[2]?.amount,
      bgColor: "#ff7878",
      vipImage: vip3,
      iconImage: vip22,
      bgImage: vipBg3,
      track: "#ef5b5b",
    },
    {
      level: 4,
      progress: exp,
      maxProgress: vipData[3]?.amount,
      bgColor: "#48c7f0",
      vipImage: vip4,
      iconImage: vip22,
      bgImage: vipBg4,
      track: "#32b6e8",
    },
    {
      level: 5,
      progress: exp,
      maxProgress: vipData[4]?.amount,
      bgColor: "#ef82d5",
      vipImage: vip5,
      iconImage: vip22,
      bgImage: vipBg5,
      track: "#ea69ca",
    },
    {
      level: 6,
      progress: exp,
      maxProgress: vipData[5]?.amount,
      bgColor: "#46c188",
      vipImage: vip6,
      iconImage: vip22,
      bgImage: vipBg6,
      track: "#1eb18b",
    },
    {
      level: 7,
      progress: exp,
      maxProgress: vipData[6]?.amount,
      bgColor: "#41ac46",
      vipImage: vip7,
      iconImage: vip22,
      bgImage: vipBg7,
      track: "#137b48",
    },
    {
      level: 8,
      progress: exp,
      maxProgress: vipData[7]?.amount,
      bgColor: "#4a9ded",
      vipImage: vip8,
      iconImage: vip22,
      bgImage: vipBg8,
      track: "#215dce",
    },
    {
      level: 9,
      progress: exp,
      maxProgress: vipData[8]?.amount,
      bgColor: "#b068f0",
      vipImage: vip9,
      iconImage: vip22,
      bgImage: vipBg9,
      track: "#742cef",
    },
    {
      level: 10,
      progress: exp,
      maxProgress: vipData[9]?.amount,
      bgColor: "#f49c3b",
      vipImage: vip10,
      iconImage: vip22,
      bgImage: vipBg10,
      track: "#e46f1a",
    },
    // Add more levels with different properties as needed
  ];

  const settings = {
    dots: false,
    speed: 500,
    infinite: false, // Set to false to disable infinite loop
    slidesToScroll: 1,
    prevArrow: false,
    nextArrow: false,
    centerPadding: "20px",
    afterChange: (current) => setCount(current + 1),
  };

  useEffect(() => {
    dispatch(invitationBonus());

    dispatch(vipLevel()).then((res) => {
      setExp(res.payload.levels);
    });
  }, [dispatch]);
  useEffect(() => {
    dispatch(vipsectionData()).then((res) => {
      setVipData(res.payload.data);
    });
    window.scrollTo(0, 0);
  }, [dispatch]);

  const filteredBenefits = vipData?.filter((item) => item.id == count);

  return (
    <>
      <CustomeNavbar name="VIP" bgClass="nav-bg text-white" />
      <div className="nav-bg py-1 pb-10">
        <div className="container-section">
          <div className="flex items-center">
            <img
              src={AvatarData[userInfo?.userPhoto]}
              alt=""
              className="w-20 rounded-full h-20"
            />
            <div className="ms-2">
              <h3 className="heaing-h3 flex items-center text-xl">
                {" "}
                <img
                  src={VIPImg[userInfo?.vip_level]}
                  alt=""
                  className="w-16  "
                />
              </h3>
              <p className="text-sm mt-1">{userInfo?.name_user}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="container-section relative top-[-27px]">
        <div className="flex items-center justify-between">
          <div className="w-[48%] bg-popup-nav flex py-3 justify-center items-center flex-col rounded-md">
            <p className="text-sm text-blue">{Math.floor(exp)} EXP</p>
            <p className="text-sm gray-text">My experience</p>
          </div>
          <div className="w-[48%] bg-popup-nav flex justify-center items-center flex-col py-4  rounded-md">
            <p className="fs-sm gray-text">
              <span className="text-whites text-sm font-semibold">
                {daysLeft + 1}
              </span>{" "}
              Days
            </p>
            <p className="fs-sm gray-text">Payout time</p>
          </div>
        </div>
      </div>
      <div className="container-section">
        <p className="border border-gray-400 py-1.5 rounded-md fs-sm gray-text text-center">
          VIP level rewards are settled at 2:00 am on the 1st every month
        </p>

        <div className="m-auto mt-3 vips w-[90%]">
          <Slider {...settings}>
            {levels.map((vip, i) => (
              <VIPCard
                key={i}
                level={vip.level}
                progress={vip.progress}
                maxProgress={vip.maxProgress}
                bgColor={vip.bgColor}
                vipImage={vip.vipImage}
                iconImage={vip.iconImage}
                bgImage={vip.bgImage}
                track={vip.track}
                className="mx-2"
              />
            ))}
          </Slider>
        </div>

        {Array.isArray(filteredBenefits) &&
          filteredBenefits?.map((item, i) => (
            <div className="bg-light p-3 mt-4" key={i}>
              <div className="flex items-center ">
                <span>
                  <IoDiamondSharp className="color-l text-xl" />
                </span>
                <h3 className="heading-h3 text-whites ms-1 font-medium">
                  VIP{count} Benefits level
                </h3>
              </div>
              <hr className="border-color-slat" />
              <div className="flex justify-between items-center">
                <div className="flex items-center mt-2">
                  <img src={Rewards} alt="" className="w-14 mr-1" />
                  <div>
                    <p className="text-sm text-whites">Level up rewards</p>
                    <p className="fs-sm gray-50 mt-2">
                      Each account can only recieve 1 time
                    </p>
                  </div>
                </div>
                <div>
                  <div className="border border-[--yellow-200] rounded-md color-yellow-200 flex items-center px-4 text-sm">
                    <img src={Wallet} className="w-3 mr-1" alt="" />
                    <span>{item.onetime} </span>
                  </div>
                  <div className="border border-[#F5CC2C] rounded-md color-l flex items-center px-4 text-sm mt-1">
                    <RiVipDiamondFill className="color-l mr-1" />
                    <span>0</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center mt-2">
                  <img src={MRewards} alt="" className="w-14 mr-1" />
                  <div>
                    <p className="text-sm text-whites">Monthly rewards</p>
                    <p className="fs-sm gray-50 ">
                      Each account can only recieve 1 time per month
                    </p>
                  </div>
                </div>
                <div>
                  <div className="border border-[--yellow-200] rounded-md color-yellow-200 flex items-center px-4 text-sm">
                    <img src={Wallet} className="w-3 mr-1" alt="" />
                    <span>{item.monthstime}</span>
                  </div>
                  <div className="border border-[#F5CC2C] rounded-md color-l flex items-center px-4 text-sm mt-1">
                    <RiVipDiamondFill className="color-l mr-1" />
                    <span>0</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center mt-2">
                  <img src={Safe} alt="" className="w-14 mr-1" />
                  <div>
                    <p className="text-sm text-whites">Safe</p>
                    <p className="fs-sm gray-50 mt-2">
                      Increase the extra income of the safe
                    </p>
                  </div>
                </div>
                <div>
                  <div className="border border-[#F5CC2C] rounded-md color-l flex items-center px-2 py-1 text-sm mt-1">
                    <RiVipDiamondFill className="color-l mr-1" />
                    <span>{item.sefe}%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center mt-2">
                  <img src={Rate} alt="" className="w-14 mr-1" />
                  <div>
                    <p className="text-sm text-whites">Rebate rate</p>
                    <p className="fs-sm gray-50 mt-2">
                      Increase income of rebate
                    </p>
                  </div>
                </div>
                <div>
                  <div className="border border-[#F5CC2C] rounded-md color-l flex items-center px-2 py-1 text-sm mt-1">
                    <BsDatabaseFill className="color-l mr-1" />
                    <span>{item.rebet}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        <div className="mt-5">
          <div className="flex items-center justify-between relative">
            <button
              className={`flex justify-center items-center bg-light w-full py-2 rounded-md ${
                activeRule == 1 ? "color-l border-b " : "gray-50"
              } border-[#FA6F6B]`}
              onClick={() => setActiveRule(1)}
            >
              {" "}
              History
            </button>
            <button
              className={`flex justify-center items-center bg-light w-full py-2 rounded-md  ${
                activeRule == 2 ? "color-l border-b " : "gray-50"
              } border-[#FA6F6B]`}
              onClick={() => setActiveRule(2)}
            >
              Rules
            </button>
          </div>

          {activeRule == 1 && (
            <div>
              {vipLevelData?.map((item, i) => (
                <div
                  className="flex items-center justify-between bg-light mt-2 rounded-md p-2"
                  key={i}
                >
                  <div>
                    <h3 className="color-l">Experience Bonus</h3>
                    <p className="fs-sm gray-50">Betting Level</p>
                    <span className="fs-sm gray-50">{item?.level}</span>
                  </div>
                  <p className="flex items-center border border-[#ffd180] p-[2px] w-auto justify-between px-2 fs-sm rounded-md color-yellow-200">
                    <img src={Wallet} alt="" className="w-3 mr-1" />{" "}
                    {item?.amount}
                  </p>
                </div>
              ))}

              <button className="blue-linear flex justify-center text-lg  w-full text-white m-auto font-semibold text-center rounded-full p-2 mt-10 tracking-widest">
                View All
              </button>
            </div>
          )}

          {activeRule == 2 && (
            <div className="container-section mt-2">
              <h1 className="heading-h1 text-center text-red-600 font-bold text-xl">
                {" "}
                VIP privilenges
              </h1>
              <p className="text-base  gray-50 text-center">
                VIP rule description
              </p>

              <div className="bg-popup-nav mt-5 px-2 pb-5 rounded-md">
                <div className="nav-bg w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto  fs-sm text-white">
                  Upgrade standard
                </div>

                <p className="fs-sm gray-text leading-7">
                  The IP member's experience points (valid bet amount) that meet
                  the requirements of the corresponding rank will be promoted to
                  the corresponding VIP level, the member's VIP data statistics
                  period starts from 00:00:00 days VIP system launched.VIP level
                  calculation is refreshed every 10 minutes! The corresponding
                  experience level is calculated according to valid odds 100:1 !
                </p>
              </div>
              <div className="bg-popup-nav mt-5 px-2 pb-5 rounded-md">
                <div className="nav-bg w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto text-white fs-sm">
                  Upgrade order
                </div>
                <p className="fs-sm gray-text leading-7">
                  The VIP level that meets the corresponding requirements can be
                  promoted by one level every day, but the VIP level cannot be
                  promoted by leapfrogging.
                </p>
              </div>
              <div className="bg-popup-nav mt-5 px-2 pb-5 rounded-md">
                <div className="nav-bg w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto text-white fs-sm">
                  Level maintenance
                </div>
                <p className="fs-sm gray-text leading-7">
                  VIP members need to complete the maintenance requirements of
                  the corresponding level within 30 days after the "VIP level
                  change"; if the promotion is completed during this period, the
                  maintenance requirements will be calculated according to the
                  current level.
                </p>
              </div>
              <div className="bg-popup-nav mt-5 px-2 pb-5 rounded-md">
                <div className="nav-bg w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto text-white fs-sm">
                  Downgrade standard
                </div>
                <p className="fs-sm gray-text leading-7">
                  If a VIP member fails to complete the corresponding level
                  maintenance requirements within 30 days, the system will
                  automatically deduct the experience points corresponding to
                  the level. If the experience points are insufficient, the
                  level will be downgraded, and the corresponding discounts will
                  be adjusted to the downgraded level accordingly.
                </p>
              </div>
              <div className="bg-popup-nav mt-5 px-2 pb-5 rounded-md">
                <div className="nav-bg w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto text-white fs-sm">
                  Upgrade Bonus
                </div>
                <p className="fs-sm gray-text leading-7">
                  The upgrade benefits can be claimed on the VIP page after the
                  member reaches the VIP membership level, and each VIP member
                  can only get the upgrade reward of each level once.
                </p>
              </div>
              <div className="bg-popup-nav mt-5 px-2 pb-5 rounded-md">
                <div className="nav-bg w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto text-white fs-sm">
                  Monthly reward
                </div>
                <p className="fs-sm gray-text leading-7">
                  VIP members can earn the highest level of VIP rewards once a
                  month.Can only be received once a month. Prizes cannot be
                  accumulated. And any unclaimed rewards will be refreshed on
                  the next settlement day. When receiving the highest level of
                  monthly rewards this month Monthly Rewards earned in this
                  month will be deducted e.g. when VIP1 earns 500 and upgrades
                  to VIP2 to receive monthly rewards 500 will be deducted.
                </p>
              </div>
              <div className="bg-popup-nav mt-5 px-2 pb-5 rounded-md">
                <div className="nav-bg w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto text-white fs-sm">
                  Real-time rebate
                </div>
                <p className="fs-sm gray-text leading-7">
                  The higher the VIP level, the return rate, all the games are
                  calculated in real time and can be self-rewrded!
                </p>
              </div>
              <div className="bg-popup-nav mt-5 px-2 pb-5 rounded-md">
                <div className="nav-bg w-[60%] rounded-bl-full mb-2 py-2 rounded-br-full flex justify-center m-auto text-white fs-sm">
                  Safe
                </div>
                <p className="fs-sm gray-text leading-7">
                  VIP members who have reached the corresponding level will get
                  additional benefits on safe deposit based on the member's VIP
                  level.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Vip;
