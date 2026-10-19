import React, { useState } from "react";

import { RiFileCopyLine } from "react-icons/ri";
import CopyCopmponent from "../../components/CopyCopmponent";
import { useSelector } from "react-redux";
import CustomeNavbar from "../../components/CustomeNavbar";

const PartnerRewards = () => {
  const { promotionsData } = useSelector((state) => state.promotion);
  const { userInfo } = useSelector((state) => state.auth);

  const [copyPopup, setCopyPopup] = useState(false);
  const currentUrl = window.location.origin;
  const invitationLink = `${currentUrl}/#/register?invitationCode=${userInfo?.code}`;
  // //console.log("object", promotionsData)
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(invitationLink)
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
  return (
    <div className="bgs-body text-black max-w-md mx-auto rounded-xl shadow-lg ">
      <CopyCopmponent
        copyPopup={copyPopup}
        message="Copy successful"
        className="z-20"
      />
      {/* Header */}

      <CustomeNavbar name="Partner reward" />

      {/* Banner */}
      <div className="relative w-full overflow-hidden mb-4">
        <img
          src="https://i.ibb.co/cXNgLHYf/team-Partner-Bg.png" // Replace with your banner if needed
          alt="Invite Banner"
          className="w-full h-auto object-cover"
        />
        <div className="absolute top-1/2 right-6 transform -translate-y-1/2">
          <p className="text-sm font-semibold text-black leading-tight text-right">
            Invite friends to get
          </p>
          <p className="text-sm font-semibold text-black leading-tight">
            {" "}
            max rewards
          </p>
          <p className="bg-gradient-to-r from-orange-300 to-orange-400 px-4 py-1 rounded-full mt-2 text-whites font-bold text-sm shadow-md">
            ₹10,000.00
          </p>
        </div>
      </div>

      {/* Counte₹ */}
      <div className="space-y-2 p-2">
        <div className="bg-light p-3 rounded flex justify-between">
          <span className="gray-text">Invitation count</span>
          <span>{promotionsData?.invite?.f1}</span>
        </div>
        <div className="bg-light p-3 rounded flex justify-between">
          <span className="gray-text">Effective Invitation count</span>
          <span className="text-green-500">0</span>
        </div>
        <div className="bg-light p-3 rounded flex justify-between">
          <span className="gray-text">Invitation total bonus</span>
          <span className="text-red-500">₹0.00</span>
        </div>
      </div>

      {/* Invitation Link */}
      <div className="mt-4 px-4">
        {/* Invitation Record */}
        <p className="text-sm text-center text-whites mb-2">
          Invitation record <span className="ml-1">{`>`}</span>
        </p>

        {/* Invitation Link */}
        <div>
          <p className="font-semibold mb-1 flex items-center">
            <span className="w-1 h-4 bg-yellow-400 mr-2 inline-block rounded-sm" />
            Invitation link
          </p>

          <div className="relative bg-light flex items-center rounded-full overflow-hidden text-sm w-full max-w-md partner-code">
            <span className="truncate px-4 py-2 text-whites">
              {invitationLink}
            </span>
            <span
              onClick={copyToClipboard}
              className="relative partner-code flex items-center justify-center w-[80px] h-full z-10"
            >
              <RiFileCopyLine className="text-white text-2xl z-20 ml-5 py-1" />
            </span>
          </div>
        </div>
      </div>

      {/* Invitation Rules */}
      <div className="mt-6 p-2 bg-light">
        <div className="text-yellow-400 text-lg font-semibold mb-2 flex">
          <svg data-v-28c19aaa="" class="svg-icon icon-shuoming img img">
            <use href="#icon-shuoming"></use>
          </svg>
          Invitation rules
        </div>
        <p className="text-sm text-whites mb-4">
          If you invites player A, with in{" "}
          <span className="text-red-400 font-semibold">7 Day</span>
        </p>

        {/* Bonus Table */}
        <div className="bg-light gray-text w-full overflow-x-auto">
          <div className="grid grid-cols-3 bg-[--main-color] border rounded-t-lg text-center font-semibold py-2 border-b border-[#E1E1E1] text-sm text-white">
            <div>Deposit</div>
            <div>When Player A</div>
            <div>You get bonus</div>
          </div>

          {/* 1st Deposit */}
          {[
            {
              amount: "₹300 ≤ Amount<₹500 and Turnover ≥ ₹1,500",
              bonus: "₹60",
            },
            {
              amount: "₹500 ≤ Amount<₹1,000 and Turnover ≥ ₹2,500",
              bonus: "₹80",
            },
            {
              amount: "₹1,000 ≤ Amount<₹5,000 and Turnover ≥ ₹5,000",
              bonus: "₹170",
            },
            {
              amount: "₹5,000 ≤ Amount<₹10,000 and Turnover ≥ ₹25,000",
              bonus: "₹450",
            },
            {
              amount: "₹10,000 ≤ Amount<₹50,000 and Turnover ≥ ₹50,000",
              bonus: "₹730",
            },
            {
              amount: "Amount ≥ ₹50,000 and Turnover ≥ ₹250,000",
              bonus: "₹4,000",
            },
          ].map((item, i) => (
            <div className="grid grid-cols-[1fr_3fr_1fr] text-center py-2 border-b border-[#E1E1E1] text-xs">
              <div className="text-purple-400">
                {i === 0 ? "1st deposit" : ""}
              </div>
              <div>{item.amount}</div>
              <div className="text-red-500 font-medium">{item.bonus}</div>
            </div>
          ))}

          {/* 2nd Deposit */}
          {[
            {
              amount: "₹500 ≤ Amount<₹1,000 and Turnover ≥ ₹5,000",
              bonus: "₹80",
            },
            {
              amount: "₹1,000 ≤ Amount<₹5,000 and Turnover ≥ ₹10,000",
              bonus: "₹160",
            },
            {
              amount: "₹5,000 ≤ Amount<₹10,000 and Turnover ≥ ₹50,000",
              bonus: "₹400",
            },
            {
              amount: "₹10,000 ≤ Amount<₹50,000 and Turnover ≥ ₹100,000",
              bonus: "₹850",
            },
            {
              amount: "₹50,000 ≤ Amount<₹100,000 and Turnover ≥ ₹500,000",
              bonus: "₹3,000",
            },
            {
              amount: "Amount ≥ ₹100,000 and Turnover ≥ ₹1,000,000",
              bonus: "₹6,000",
            },
          ].map((item, i) => (
            <div className="grid grid-cols-[1fr_3fr_1fr] text-center py-2 border-b border-[#E1E1E1] text-xs">
              <div className="text-purple-400">
                {i === 0 ? "1st deposit" : ""}
              </div>
              <div>{item.amount}</div>
              <div className="text-red-500 font-medium">{item.bonus}</div>
            </div>
          ))}

          {/* 3rd Deposit */}
          {[
            {
              amount: "₹1,000 ≤ Amount<₹5,000 and Turnover ≥ ₹15,000",
              bonus: "₹150",
            },
            {
              amount: "₹5,000 ≤ Amount<₹10,000 and Turnover ≥ ₹75,000",
              bonus: "₹520",
            },
            {
              amount: "₹10,000 ≤ Amount<₹50,000 and Turnover ≥ ₹150,000",
              bonus: "₹920",
            },
            {
              amount: "₹50,000 ≤ Amount<₹100,000 and Turnover ≥ ₹750,000",
              bonus: "₹3,200",
            },
            {
              amount: "₹100,000 ≤ Amount<₹250,000 and Turnover ≥ ₹1,500,000",
              bonus: "₹5,200",
            },
            {
              amount: "Amount ≥ ₹250,000 and Turnover ≥ ₹3,750,000",
              bonus: "₹10,000",
            },
          ].map((item, i) => (
            <div className="grid grid-cols-[1fr_3fr_1fr] text-center py-2 text-xs border-b border-[#E1E1E1]">
              <div className="text-purple-400">
                {i === 0 ? "1st deposit" : ""}
              </div>
              <div>{item.amount}</div>
              <div className="text-red-500 font-medium">{item.bonus}</div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="mt-4 text-sm space-y-2 gray-text p-2">
          <p className="text-red-400">*Each deposit can only get one bonus.</p>
          <ul className="space-y-1">
            <li className="flex flex-col text-sm">
              <div className="flex items-center space-x-1">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 11 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="5.65625"
                    width="8"
                    height="8"
                    rx="1"
                    transform="rotate(45 5.65625 0)"
                    fill="#F5CC2C"
                  />
                </svg>
                <span>eg:</span>
              </div>
              <div className="flex flex-wrap pl-4">
                <span> Player A 1st deposit</span>
                <span className="text-red-500">₹299.00</span>
                <span>and turnover</span>
                <span className="text-red-500">₹1,500.00</span>
                <span>, you can't get bonus</span>
              </div>
            </li>

            <li className="flex space-x-1">
              <svg
                data-v-ca43e9bb=""
                width="10"
                height="10"
                viewBox="0 0 11 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  data-v-ca43e9bb=""
                  x="5.65625"
                  width="10"
                  height="10"
                  rx="1"
                  transform="rotate(45 5.65625 0)"
                  fill="#F5CC2C"
                ></rect>
              </svg>
              <span className="ml-2">
                the reward has no limitation, the more you invited the more
                rewards you will get it
              </span>
            </li>
            <li className="flex space-x-2">
              <svg
                data-v-ca43e9bb=""
                width="10"
                height="10"
                viewBox="0 0 11 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  data-v-ca43e9bb=""
                  x="5.65625"
                  width="10"
                  height="10"
                  rx="1"
                  transform="rotate(45 5.65625 0)"
                  fill="#F5CC2C"
                ></rect>
              </svg>
              <span className="ml-2">
                {" "}
                If the conditions are met the rewards will be automatically
                credited to player's balance
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PartnerRewards;
