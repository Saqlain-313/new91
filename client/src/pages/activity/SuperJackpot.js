import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";

import { TbLayoutDashboardFilled } from "react-icons/tb";
import EmptyImg from "../../assets/empty.png";
import CustomeNavbar from "../../components/CustomeNavbar";
const Superjackpot = () => {
  const navigate = useNavigate();
  return (
    <>
      <CustomeNavbar name="Super jackpot" />
      <div className="jackpot-banner">
        <div className="w-[70%] h-[100%]">
          <h3 className="text-2xl mb-3 font-bold pt-3">Super Jackpot</h3>
          <p className="fs-sm pb-3 pt-3">
            When you get the Super jackpot <br /> in [Slots] Can get 1
            additional bonus
          </p>
          <p className="fs-sm mb-2">
            The reward is valid for 30 day, <br /> and you will not be able to
            claim it after it expires{" "}
          </p>
        </div>
      </div>

      <div className="container-section mt-3">
        <div className="flex justify-center items-center text-[#fff] fs-sm rounded-3xl bg-[#CDCFDD] p-2">
          <TbLayoutDashboardFilled className="rounded-full text-xl text-white p-[2px] mr-1" />{" "}
          Recieve in batches
        </div>
        <div className="grid grid-cols-12 gap-2 mt-2">
          <div
            className="col-span-6 bg-body flex justify-center items-center p-3 rounded-md"
            onClick={() => navigate("/main/SuperJackpot/rule")}
          >
            {/* <GrNotes className="blue-color-300 text-lg" /> */}
            <svg data-v-6243ef37="" class="svg-icon icon-rule">
              <use href="#icon-rule"></use>
            </svg>
            <span className="fs-sm ms-1 text-black">Rule</span>
          </div>
          <div
            className="col-span-6 bg-body flex justify-center items-center p-3 rounded-md"
            onClick={() => navigate("/main/SuperJackpot/star")}
          >
            {/* <PiShieldStarFill className="blue-color-300 text-xl" /> */}
            <svg data-v-6243ef37="" class="svg-icon icon-winningStar">
              <use href="#icon-winningStar"></use>
            </svg>
            <span className="fs-sm ms-1 text-black">Winning star</span>
          </div>
        </div>

        <div className="bg-body rounded-xl mt-3 h-52 relative flex justify-center items-center">
          <img src={EmptyImg} alt="" className="w-56 invert" />
          <p className="gray-50 absolute bottom-1 m-auto left-0 right-0 flex text-center justify-center">
            You don't have a big jackpot yet, let's bet
          </p>
        </div>
        <div
          className="flex mt-3 justify-center items-center text-white text-base rounded-3xl blue-linear cursor-pointer p-2"
          onClick={() => navigate("/")}
        >
          {" "}
          Go bet
        </div>
      </div>
    </>
  );
};

export default Superjackpot;
