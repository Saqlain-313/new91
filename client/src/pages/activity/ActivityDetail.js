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
      <div className="bg-light">
        {id == 2 && (
          <div>
            <img
              src={bannergetData?.activity?.ban1}
              alt=""
              className="w-full"
            />
            <h3 className="heading-h3 text-center mt-3 mb-1 text-whites font-medium">
              {" "}
              Mega Spin Event
            </h3>
            <h3 className="text-[#920be7] text-center">
              <a href="#">Click here to join</a>
            </h3>
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
              Benefits of Using ARWALLET
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
              Chennai91 Super Jackpot
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
              Chennai91 Real-Time Rebate
            </h3>
            <div className="container-section">
              <img src={bannergetData?.activity?.ban55} alt="" />
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
              Chennai91 Youtube Creative Video Event
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
              Chennai91 Winstreak Bonus
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
              Partner Rewards
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
              Special Attendance Bonus
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
              src={
                "https://i.ibb.co/xKgW3thN/imgi-13-Banner-2025101920340218jl.png"
              }
              alt=""
              className="w-full"
            />
            <h3 className="heading-h3 text-center mt-3 mb-1 text-whites font-medium">
              Weekly Betting Rewards
            </h3>
            <div className="container-section">
              <img
                src={
                  "https://i.ibb.co/BVgQTKG8/imgi-2-editor-20251019203357xs95.png"
                }
                alt=""
              />
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
              PARTNER REWARDS BONUS
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
