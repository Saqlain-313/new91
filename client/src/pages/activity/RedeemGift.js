import { useEffect, useState } from "react";
import { IoCalendarClear } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import Wallet from "../../assets/balance.png";
import BannerImg from "../../assets/gift-bg.png";
import CustomeNavbar from "../../components/CustomeNavbar";
import {
  getRedeemGift,
  RedeemGiftCode,
} from "../../store/reducer/activityReducer";
const RedeemGift = () => {
  const { redeemData } = useSelector((state) => state.activity);
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
        <div className="nav-bg mt-2 p-3 rounded-md pb-10">
          <p className="text-white">Hi</p>
          <p className="text-white">We have a gift for you</p>
          <p className="mt-6 text-white">Please enter the gift code below </p>
          <input
            type="text"
            className="w-full mt-2 bgs-body border border-[--bgbody]  rounded-full p-2 focus:[var(--grey-100)] ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm  placeholder:text-[var(--grey-200)] placeholder:font-medium"
            placeholder="Please enter gift code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            className="blue-linear text-white w-full rounded-full p-2 mt-4"
            onClick={handleSubmit}
          >
            Recieve
          </button>
        </div>

        <div className="nav-bg mt-3 p-3 pb-4 rounded-md">
          <div className="flex items-center text-whites">
            <IoCalendarClear className="blue-color-300 mr-1" />{" "}
            <span className="text-base">History</span>
          </div>

          {Array.isArray(redeemData) &&
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
            ))}
        </div>
      </div>
      <div className={`place-bet-popup ${Alerts ? "active" : ""}`}>
        <div className="text-sm">{successMessage} </div>
      </div>
    </>
  );
};

export default RedeemGift;
