import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./invitation.css";
import InviteRuleImg from "../../assets/inviterule.svg";
import InviteRecordImg from "../../assets/inviterecord.svg";
import { RxCross2 } from "react-icons/rx";
import { useSelector, useDispatch } from "react-redux";
import {
  invitationBonus,
  invitationData,
} from "../../store/reducer/activityReducer";
import CustomeNavbar from "../../components/CustomeNavbar";
const InvitaionBonus = () => {
  const { invitationBonusData, invitationBonusDatas } = useSelector(
    (state) => state.activity
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(invitationBonus());
    dispatch(invitationData());
  }, []);

  function formatNumber(number) {
    return new Intl.NumberFormat("en-US").format(number);
  }

  const inviteData = invitationBonusDatas?.map((item) => ({
    invite: item.count,
    recharge: item.amount,
    bonus: item.bonus,
  }));

  return (
    <>
      <CustomeNavbar name="Invitation bonus" />
      <div className="invitation-banner">
        <div className="w-[60%] h-[100%]">
          <h3 className="text-lg mb-2">Invite friends and deposit</h3>
          <p className="fs-sm pb-2">Both parties can rewards</p>
          <p className="fs-sm pb-2">
            Invite friends to register and recharge to recieve awards
          </p>
          <p className="fs-sm pb-2">activity date</p>
          <h3 className="text-lg">2024-03-24 - 2124-03-2024</h3>
        </div>
      </div>

      <div className="in-bonus-head bg-popup-nav w-[87%] h-[5.7rem] m-auto flex justify-between items-center p-2 mt-[-20px] rounded-xl text-center">
        <div
          className="text-center flex flex-col justify-center items-center pl-4"
          onClick={() => navigate("/main/InvitationBonus/Rule")}
        >
          <img src={InviteRuleImg} alt="" className="w-12" />
          <p className="text-whites fs-sm pt-1">Invitation reward rules</p>
        </div>
        <div
          className="text-center flex flex-col justify-center items-center pr-6"
          onClick={() => navigate("/main/InvitationBonus/record")}
        >
          <img src={InviteRecordImg} alt="" className="w-12" />
          <p className="text-whites fs-sm pt-1">Invitation record</p>
        </div>
      </div>
      <div className="container-section mt-5">
        {inviteData?.map((item, i) => {
          // Assuming data array has an `id` that matches with `inviteData`
          const dataItem = Array.isArray(invitationBonusData?.data)
            ? invitationBonusData?.data[i]
            : [];
          //   const dataItem = invitationBonusData?.data[i];
          const buttonText =
            dataItem?.status === 1 ? "Completed" : "Unfinished";

          return (
            <div className="rounded-xl mt-3 bg-light" key={i}>
              <div className="flex justify-between items-center">
                <div className=" bgs-green w-[40%]  rounded-tl-xl rounded-br-xl px-3 py-3 text-base font-medium">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm">Bonus</span>
                      <span className="bg-white rounded-full ml-1 w-5 h-5 tex-sm text-center flex items-center justify-center gray-text">
                        {i + 1}
                      </span>
                    </div>
                    <RxCross2 className="bg-white gray-text rounded-full ml-1 w-5 h-5 tex-sm text-center flex items-center justify-center" />
                  </div>
                </div>
                <p className="color-yellow-200 text-base mr-2 border-b border-slate-700  w-[55%] flex justify-end leading-9 font-medium">
                  ₹{formatNumber(item.bonus)}.00
                </p>
              </div>

              <div className="bg-[#e6e6e6] mt-3 flex justify-between items-center mx-2 px-3 py-1 rounded-sm text-whites text-sm">
                <span>Number of invitations</span>
                <span className="mr-10">{item.invite}</span>
              </div>
              <div className="bg-[#e6e6e6] mt-2 flex justify-between items-center mx-2 px-3 py-1 rounded-sm text-whites text-sm">
                <span>Recharge per people</span>
                <span className="mr-10 color-red-200">
                  ₹{item.recharge.toFixed(2)}
                </span>
              </div>

              <div className="line-two"></div>

              <div className="flex item-center justify-around mb-3">
                <div className="flex items-center flex-col justify-center w-[50%]">
                  <p className="text-base color-yellow-200">
                    {invitationBonusData?.downline >= 0
                      ? invitationBonusData?.downline
                      : 0}{" "}
                    / {item.invite}
                  </p>
                  <span className="text-[12px] text-whites">
                    Number of invitations
                  </span>
                </div>

                <div className="flex items-center flex-col justify-center w-[50%] border-l border-slate-700">
                  <p className="text-base text-red-200">
                    {invitationBonusData?.validCounts?.find(
                      (tier) => tier.tierId === i + 1
                    )?.validCount || 0}{" "}
                    / {item.invite}
                  </p>
                  <span className="text-[12px] text-whites">
                    Deposit number
                  </span>
                </div>
              </div>

              <div className="m-2 pb-4 pt-2">
                <button
                  className={` py-2 rounded-3xl text-base w-full text-whites heading-h3 text-black font-bold ${
                    dataItem?.status === 1 ? "bgs-green" : "bg-gray-300"
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

export default InvitaionBonus;
