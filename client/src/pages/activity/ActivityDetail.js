import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import CustomeNavbar from "../../components/CustomeNavbar";

const ActivityDetail = () => {
  const { bannergetData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <CustomeNavbar name="Activity details" />
      <div className="nav-bg">
        {id == 2 && (
          <div>
            <img
              src={bannergetData?.activity?.ban2}
              alt=""
              className="w-full"
            />
            <h3 className="heading-h3 text-center mt-3 mb-1 text-whites font-medium">
              {" "}
              VIP bonus
            </h3>
            <h4
              onClick={() => navigate("/vip")}
              className="text-green-500 text-xs text-center underline mb-2 font-bold"
            >
              Click here for claim
            </h4>
            <div className="container-section">
              <img src={bannergetData?.activity?.ban22} alt="" />
            </div>
          </div>
        )}
        {id == 3 && (
          <div>
            <img
              src={bannergetData?.activity?.ban3}
              alt=""
              className="w-full"
            />
            <h3 className="heading-h3 text-center mt-3 mb-1 text-whites font-medium">
              💰 Member Activities Winning Streak 💰
            </h3>
            <div className="container-section">
              <img src={bannergetData?.activity?.ban33} alt="" />
            </div>
          </div>
        )}
        {id == 4 && (
          <div>
            <img
              src={bannergetData?.activity?.ban4}
              alt=""
              className="w-full"
            />
            <h3 className="heading-h3 text-center mt-3 mb-1 text-whites font-medium">
              RECHARGE BONUS
            </h3>
            <div className="container-section">
              <img src={bannergetData?.activity?.ban44} alt="" />
            </div>
          </div>
        )}
        {id == 5 && (
          <div>
            <img
              src={bannergetData?.activity?.ban5}
              alt=""
              className="w-full"
            />
            <h3 className="heading-h3 text-center mt-3 mb-1 text-whites font-medium">
              Aviator Additional Bonus
            </h3>
            <div className="container-section">
              <img
                src="https://i.ibb.co/hJ1cBKDJ/AVIATOR-ADDITIONALBONUS.jpg"
                alt=""
              />
            </div>
          </div>
        )}
        {id == 6 && (
          <div>
            <img
              src={bannergetData?.activity?.ban6}
              alt=""
              className="w-full"
            />
            <h3 className="heading-h3 text-center mt-3 mb-1 text-whites font-medium">
              Lucky Spin
            </h3>

            <div className="container-section">
              <img src={bannergetData?.activity?.ban66} alt="" />
            </div>
          </div>
        )}
        {id == 7 && (
          <div>
            <img
              src={bannergetData?.activity?.ban7}
              alt=""
              className="w-full"
            />
            <h3 className="heading-h3 text-center mt-3 mb-1 text-whites font-medium">
              BENEFITS OF USING AR WALLET
            </h3>
            <div className="container-section">
              <img src={bannergetData?.activity?.ban77} alt="" />
            </div>
          </div>
        )}
        {id == 8 && (
          <div>
            <img
              src={bannergetData?.activity?.ban8}
              alt=""
              className="w-full"
            />
            <h3 className="heading-h3 text-center mt-3 mb-1 text-whites font-medium">
              VIDEO CONTENT BONUS
            </h3>

            <div className="container-section">
              <img src={bannergetData?.activity?.ban88} alt="" />
            </div>
          </div>
        )}
        {id == 9 && (
          <div>
            <img
              src={bannergetData?.activity?.ban9}
              alt=""
              className="w-full"
            />
            <h3 className="heading-h3 text-center mt-3 mb-1 text-whites font-medium">
              WEEKLY DEPOSIT BONUS FOR AGENT
            </h3>
            {/* <h4 className="text-center text-[#00ff00] mb-2 text-xs font-bold">
              Click here to apply : Winning Streak Bonus
            </h4> */}
            <div className="container-section">
              <img src={bannergetData?.activity?.ban99} alt="" />
            </div>
          </div>
        )}
        {id == 10 && (
          <div>
            <img
              src={bannergetData?.activity?.ban9}
              alt=""
              className="w-full"
            />
            <h3 className="heading-h3 text-center mt-3 mb-1 text-whites font-medium">
              ⁉️ WEEKLY DEPOSIT BONUS FOR AGENT ⁉️
            </h3>
            <div className="container-section">
              <img src={bannergetData?.activity?.ban99} alt="" />
            </div>
          </div>
        )}
        {id == 11 && (
          <div>
            <img
              src={bannergetData?.activity?.ban101}
              alt=""
              className="w-full"
            />
            <h3 className="heading-h3 text-center mt-3 mb-1 text-whites font-medium">
              Deposit 10% USDT Bonus
            </h3>
            <div className="container-section">
              <img src={bannergetData?.activity?.ban1012} alt="" />
            </div>
          </div>
        )}
        {id == 12 && (
          <div>
            <img
              src={bannergetData?.activity?.ban105}
              alt=""
              className="w-full"
            />
            <h3 className="heading-h3 text-center mt-3 mb-1 text-whites font-medium">
              BENEFITS OF USING AR WALLET
            </h3>
            <div className="container-section">
              <img src={bannergetData?.activity?.ban1012} alt="" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ActivityDetail;
