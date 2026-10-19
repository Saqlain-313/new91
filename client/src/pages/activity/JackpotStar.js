import React from "react";
import Avatar1 from "../../assets/avatar5.png";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import CustomeNavbar from "../../components/CustomeNavbar";
const JackpotStar = () => {
  return (
    <>
      <CustomeNavbar name="Winning star" />

      <div className="container-section mt-3">
        <div className="bg-body rounded-lg p-2 pb-5">
          <div className="flex items-center mb-5">
            <img src={Avatar1} alt="" className="w-10 rounded-full mr-2" />
            <h3 className="heading-h3 font-medium text-whites">916***315</h3>
          </div>

          <div className="grid grid-cols-12 bg-grays px-2 fs-sm py-1 rounded-md">
            <div className="col-span-6 text-[#80849C]">Game name</div>
            <div className="col-span-6 text-whites"> Limbo</div>
          </div>
          <div className="grid grid-cols-12 bg-grays px-2 fs-sm py-1 rounded-md mt-1">
            <div className="col-span-6 text-[#80849C]">Number of wins</div>
            <div className="col-span-6 color-yellow-200 text-base"> 1.1X</div>
          </div>
          <div className="grid grid-cols-12 bg-grays px-2 fs-sm py-1 rounded-md mt-1">
            <div className="col-span-6 text-[#80849C]">Bonus</div>
            <div className="col-span-6 color-red-200 text-base"> ₹10.00</div>
          </div>
          <div className="grid grid-cols-12 bg-grays px-2 fs-sm py-1 rounded-md mt-1">
            <div className="col-span-6 text-[#80849C]">Winning time</div>
            <div className="col-span-6 text-[#80849C]">
              {" "}
              2024-06-18 12:03:06
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JackpotStar;
