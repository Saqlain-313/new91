import React, { useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
import "./invitation.css";
import { useSelector, useDispatch } from "react-redux";
import {
  invitationBonus,
  invitationData,
} from "../../store/reducer/activityReducer";
import icon7 from "../../assets/7icon-01.png";
import wallet from "../../assets/yellow-wallet-01.png";

const ActivityAward = () => {
  const { invitationBonusData, invitationBonusDatas } = useSelector(
    (state) => state.activity
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(invitationBonus());
    dispatch(invitationData());
  }, []);

  const inviteData = invitationBonusDatas?.map((item) => ({
    name: "slot betting bonus",
    image: icon7,
    invite: item.count,
    recharge: item.amount,
    bonus: item.bonus,
    award: "Award amount",
  }));

  return (
    <>
      <div className="p-1 py-3 sticky top-0 bg-light">
        <div className="container-section flex justify-between">
          <div>
            <button className="">
              <Link to={"/activity"}>
                {" "}
                <IoIosArrowBack className="text-xl text-black" />
              </Link>
            </button>
          </div>
          <div>
            <h1 className="text-xl text-black flex  items-center m-auto">
              Collection record
            </h1>
          </div>
        </div>
      </div>

      <div className="invitation-banner">
        <div className="w-[60%]">
          <h3 className="heading-h3 mb-1 font-semibold pt-2">Activity Award</h3>
          <p className="fs-sm">
            Complete weekly/daily tasks to receive rich rewards
          </p>
          <p className="fs-sm">
            Weekly rewards cannot be accumulated to the next week, and daily
            rewards cannot be accumulated to the next day.
          </p>
        </div>
      </div>

      <div className="container-section mt-5">
        {inviteData?.map((item, i) => {
          // Assuming data array has an `id` that matches with `inviteData`
          const dataItem = invitationBonusData?.data[i];
          const buttonText =
            dataItem?.status === 1 ? "Unfinished" : "Completed";

          return (
            <div className="bg-light rounded-xl mt-3" key={i}>
              <div className="flex justify-between items-center">
                <div className="bgs-green w-[40%]  rounded-tl-xl rounded-br-xl px-3 py-2 text-base font-medium">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm">Daily Mission</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-500 text-base mr-2 border-b w-[55%] flex justify-end leading-9">
                  {buttonText}
                </p>
              </div>

              <div className="bg-white mt-3 flex justify-between items-center px-3 py-1 rounded-sm gray-100 text-sm">
                <img src={item.image} alt={item.name} className="w-8 h-8" />
                <span className="text-xs gray-50">{item.name}</span>
                <div className="flex items-center flex-col justify-center mr-28 border-slate-700">
                  <p className="text-base color-red-200">
                    {invitationBonusData?.validDepositsCount} / {item.invite}
                  </p>
                </div>
              </div>
              <div className="bg-[#F6F6F6] mt-2 flex justify-between items-center mx-2 px-3 py-1 rounded-sm gray-100 text-sm">
                <span className="gray-50 text-xs">{item.name}</span>
              </div>

              <div className="bg-white mt-2 flex items-center mx-2 px-3 py-1 rounded-sm gray-100 text-sm">
                <span className="gray-50 text-xs">{item.award}</span>
                <img src={wallet} alt="wallet" className="w-5 h-5 ml-40" />
                <span className="color-red-200 ml-2">₹{item.recharge}</span>
              </div>

              <div className="m-2 pb-4 pt-2">
                <button
                  className={` py-1 rounded-3xl text-base w-full border-[#F5CC2C] border gray-100 heading-h3 text-[#F5CC2C] font-semibold ${
                    dataItem?.status === 1 ? "bg-light" : "white"
                  }`}
                >
                  {buttonText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ActivityAward;
