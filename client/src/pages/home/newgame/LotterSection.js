import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { rechargeList2 } from "../../../store/reducer/userReducer";
import RechargePopup from "../../../components/RechargePopup";

import Slider from "react-slick";

const img11 = "https://i.ibb.co/7xzW3FWt/wingo.png";
const img12 = "https://i.ibb.co/RksPMscQ/k3.png";
const img13 = "https://i.ibb.co/bj9PQtCK/5d.png";
const img14 = "https://i.ibb.co/Df41Vh4p/4.png";
const cargame = "https://i.ibb.co/5xSm1xPD/car.png";

const LotterSection = () => {
  const navigate = useNavigate();
  const [soon, setSoon] = useState(false);
  const [repopup, setRepopup] = useState(false);
  const dispatch = useDispatch();
  const handleCheck = (path) => {
    // //console.log("path",
    dispatch(rechargeList2()).then((res) => {
      if (res.payload.data2?.length == 0) {
        setRepopup(true);
      } else if (res.payload.message === "Please login") {
        navigate("/login");
      } else {
        navigate(path);
      }
    });
  };

  const handlecloseSoon = () => {
    setSoon(false);
  };

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <>
      {soon == true && (
        <div className="fixed top-0 z-[20] bottom-0 bg-[#ffffffdc] h-40 border border-[#1ab266] backdrop-blur-xl m-auto flex flex-col justify-center gap-2 items-center left-0 right-0 w-[20rem] rounded-lg">
          <h3 className="heading-h3 gray-50 mt-5">Alert</h3>
          <p className="text-sm gray-100 mt-2">Game will be available soon</p>
          <button
            className="bg-[#1ab266] px-4 py-1 rounded-full"
            onClick={handlecloseSoon}
          >
            Close
          </button>
        </div>
      )}

      <div className={soon ? "overlay-section block" : "hidden"}></div>

      <RechargePopup repopup={repopup} setRepopup={setRepopup} />

      <div className="flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <h2 className="border-after font-[500] text-black text-base ">
            Lottery
          </h2>
          <button className="text-blue text-xs  bg-[#201D2B] rounded items-center overflow-auto p-1   ">
            More 3
          </button>
        </div>

        <p className="text-whites text-xs ">
          Fair and diverse lottery gameplay
        </p>
      </div>
      <div className="slider-container mt-1">
        <Slider {...settings}>
          <div>
            <div className="grid grid-cols-12 gap-2">
              <div
                className="col-span-4"
                onClick={() => handleCheck("/wingo?Game=10")}
              >
                <img
                  src={img11}
                  alt=""
                  loading="lazy"
                  className="w-full  h-[160px] object-cover"
                />
              </div>
              <div className="col-span-4" onClick={() => handleCheck("/k3")}>
                <img
                  src={img12}
                  alt=""
                  loading="lazy"
                  className="w-full h-[160px] object-cover"
                />
              </div>
              <div className="col-span-4" onClick={() => handleCheck("/5d")}>
                <img
                  src={img13}
                  alt=""
                  loading="lazy"
                  className="w-full h-[160px] object-cover"
                />
              </div>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4" onClick={() => handleCheck("/trx")}>
                <img
                  src={img14}
                  alt=""
                  loading="lazy"
                  className="w-full h-[160px] object-cover"
                />
              </div>
            </div>
          </div>
        </Slider>
      </div>
    </>
  );
};

export default LotterSection;
