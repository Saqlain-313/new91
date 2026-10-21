import EarningImg from "../../assets/tiranga/DailyProfitRank.png";

import Crown1 from "../../assets/tiranga/crown1.png";
import Crown2 from "../../assets/tiranga/crown2.png";
import Crown3 from "../../assets/tiranga/crown3.png";
import Place1 from "../../assets/tiranga/place1.png";
import Place2 from "../../assets/tiranga/place2.png";
import Place3 from "../../assets/tiranga/place3.png";
import { AvatarData } from "../main/AvatarData";

const EarningChart = () => {
  return (
    <>
      <div className="mt-5">
        <div className="flex items-center mt-2  border-l-4 border-color-green text-sm mb-2">
          {" "}
          <h1 className="heading-h3 font-medium ml-1 text-whites">
            Today's earning chart
          </h1>
        </div>

        <div
          style={{ backgroundImage: `url(${EarningImg})` }}
          className="w-full mt-20 h-32 bg-cover "
        >
          <div className="flex items-center justify-around w-full">
            <div>
              <div className="relative top-[-20px]">
                <img
                  src={Crown2}
                  alt=""
                  className="absolute w-12 left-[-20px] top-[-20px]"
                />
                <img
                  src={AvatarData[1]}
                  alt=""
                  loading="lazy"
                  className="w-14 rounded-full h-14"
                />
                <img src={Place2} alt="" className="absolute bottom-[-10px]" />
              </div>
              <div className="left-4 absolute">
                <p className="text-xs left-6 relative">Mem**SLH</p>
                <button className="text-xs mt-1 rounded-3xl p-1 px-2 bg-[#FFFFFF4D]">
                  ₹220,499,518.82
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="relative  top-[-45px]">
                <img
                  src={Crown1}
                  alt=""
                  className="absolute w-12 left-[-20px] top-[-20px]"
                />
                <img
                  src={AvatarData[4]}
                  alt=""
                  loading="lazy"
                  className="w-14 rounded-full h-14"
                />
                <img src={Place1} alt="" className="absolute bottom-[-10px]" />
              </div>
              <div className="left-[-25px] mt-[-20px] absolute">
                <p className="text-xs left-6 relative">Mem**FXI</p>
                <button className="text-xs mt-1 rounded-3xl p-1 px-2 bg-[#FFFFFF4D]">
                  ₹1,272,332,040.00
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="relative top-[-20px]">
                <img
                  src={Crown3}
                  alt=""
                  className="absolute w-12 left-[-20px] top-[-20px]"
                />
                <img
                  src={AvatarData[5]}
                  alt=""
                  loading="lazy"
                  className="w-14 rounded-full h-14"
                />
                <img src={Place3} alt="" className="absolute bottom-[-10px]" />
              </div>
              <div className="left-[-15px] absolute">
                <p className="text-xs left-6 relative">Mem**IAP</p>
                <button className="text-xs mt-1 rounded-3xl p-1 px-2 bg-[#FFFFFF4D]">
                  ₹97,990,200.00
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex py-1 items-center justify-between my-2 rounded-md nav-bg">
            <div className="flex items-center ps-1">
              <h1 className="text-whites w-14 flex justify-center">4</h1>
              <img
                src={AvatarData[6]}
                alt=""
                className="rounded-full w-[40px] h-[40px] mr-2"
              />
              <p className="fs-sm text-whites">Mem***WJA</p>
            </div>
            <div className="relative flex items-center">
              <button className=" text-sm mt-1 px-2 rounded-3xl p-1 text-black blue-linear mr-2">
                ₹78,976,308.99
              </button>
            </div>
          </div>
          <div className="py-1 flex items-center justify-between my-2 rounded-md nav-bg">
            <div className="flex items-center ps-1">
              <h1 className="text-whites w-14 flex justify-center">5</h1>
              <img
                src={AvatarData[7]}
                alt=""
                className="rounded-full w-[40px] h-[40px] mr-2"
              />
              <p className="fs-sm text-whites">Mem***GOP</p>
            </div>
            <div className="relative flex items-center">
              <button className=" text-sm mt-1 rounded-3xl p-1 px-2 blue-linear text-black add-desktop mr-2">
                ₹61,692,960.00
              </button>
            </div>
          </div>
          <div className="py-1 flex items-center justify-between my-2 rounded-md nav-bg">
            <div className="flex items-center ps-1">
              <h1 className="text-whites w-14 flex justify-center">6</h1>
              <img
                src={AvatarData[2]}
                alt=""
                className="rounded-full w-[40px] h-[40px] mr-2"
              />
              <p className="fs-sm text-whites">Mem***IIS</p>
            </div>
            <div className="relative flex items-center">
              <button className=" text-sm text-black mt-1 rounded-3xl p-1 px-2 blue-linear add-desktop mr-2">
                ₹59,543,123.00
              </button>
            </div>
          </div>
          <div className="py-1 flex items-center justify-between my-2 rounded-md nav-bg">
            <div className="flex items-center ps-1">
              <h1 className="text-whites w-14 flex justify-center">7</h1>
              <img
                src={AvatarData[5]}
                alt=""
                className="rounded-full w-[40px] h-[40px] mr-2"
              />
              <p className="fs-sm text-whites">Mem***MIK</p>
            </div>
            <div className="relative flex items-center">
              <button className=" text-sm mt-1 text-black rounded-3xl p-1 px-2 blue-linear add-desktop mr-2">
                ₹48,632,770.00
              </button>
            </div>
          </div>
          <div className="py-1 flex items-center justify-between my-2 rounded-md nav-bg">
            <div className="flex items-center ps-1">
              <h1 className="text-whites w-14 flex justify-center">8</h1>
              <img
                src={AvatarData[1]}
                alt=""
                className="rounded-full w-[40px] h-[40px] mr-2"
              />
              <p className="fs-sm text-whites">Mem***BRU</p>
            </div>
            <div className="relative flex items-center">
              <button className=" text-sm mt-1 text-black rounded-3xl p-1 px-2 blue-linear add-desktop mr-2">
                ₹43,692,960.00
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EarningChart;
