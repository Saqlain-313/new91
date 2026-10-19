import React, { useEffect, useState } from "react";
import Wallet from "../../assets/balance.png";
import BannerImg from "../../assets/gift-bg.png";
import { IoCalendarClear } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  getRedeemGift,
  RedeemGiftCode,
} from "../../store/reducer/activityReducer";
import CustomeNavbar from "../../components/CustomeNavbar";
import EmptyData from "./EmptyData";
const RedeemGift = () => {
  const { redeemData, loader } = useSelector((state) => state.activity);
  const [Alerts, setAlerts] = useState(false);
  const [code, setCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = () => {
    dispatch(RedeemGiftCode({ code: code })).then((res) => {
      setSuccessMessage(res.payload.message);
      dispatch(getRedeemGift());
    });
    setAlerts(true);
    setTimeout(() => {
      setAlerts(false);
    }, 2000);
  };
  useEffect(() => {
    dispatch(getRedeemGift());
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <CustomeNavbar name="Gift" />
      <div>
        <img src={BannerImg} alt="" className="h-52" />
      </div>
      <div className="container-section">
        <div className="bg-body mt-2 p-3 rounded-md min-h-[275px]">
          <p className="gray-100">Hi</p>
          <p className="gray-100">We have a gift for you</p>
          <p className="mt-6 gray-100">Please enter the gift code below </p>
          <input
            type="text"
            className="w-full mt-2 bgs-body border border-[--bgbody]  rounded-full p-2 focus:[var(--grey-100)] ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm  placeholder:text-[var(--grey-200)] placeholder:font-medium"
            placeholder="Please enter gift code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            disabled={loader}
            className=" text-white w-full rounded-full p-2.5 mt-7 text-base bg-[#FA6F6B] border border-[#FA6F6B]"
            onClick={handleSubmit}
          >
            Recieve
          </button>
        </div>

        <div className="bg-body mt-4 p-3 pb-4 rounded-md">
          <div className="flex items-center text-whites">
            <IoCalendarClear className="blue-color-300 mr-1" />{" "}
            <span className="text-base">History</span>
          </div>

          {redeemData?.length > 0 ? (
            Array.isArray(redeemData) &&
            redeemData?.map((item, i) => (
              <div className="flex items-center justify-between mb-3" key={i}>
                <div>
                  <h3 className="color-green font-semibold">
                    Successful recieved
                  </h3>
                  <p className="fs-sm gray-50">{item.time}</p>
                </div>
                <p className="flex items-center border border-[#ffd180] p-[2px] w-20 justify-between px-2 fs-sm rounded-md color-yellow-200">
                  <img src={Wallet} alt="" className="w-3 mr-4" /> {item.money}
                </p>
              </div>
            ))
          ) : (
            <EmptyData className="pb-5" />
          )}
        </div>
      </div>
      <div className={`place-bet-popup ${Alerts ? "active" : ""}`}>
        <div className="text-sm">{successMessage} </div>
      </div>
    </>
  );
};

export default RedeemGift;
