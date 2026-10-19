import React from "react";
import VaulIcon from "../../assets/vaul.png";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { BsExclamationCircle, BsShieldFillCheck } from "react-icons/bs";
import { MdKeyboardDoubleArrowRight, MdLibraryBooks } from "react-icons/md";
import { useSelector } from "react-redux";
import CustomeNavbar from "../../components/CustomeNavbar";
const StrongBox = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  return (
    <>
       <CustomeNavbar name="Safe"/>

      <div className="container-section mt-2  text-white ">
        <div className="flex m-auto w-full justify-center">
          <p className="text-center text-sm color-red-200 px-6 rounded-xl nav-bg inline-flex m-auto justify-center">
            Interest rate 0.10%
          </p>
        </div>
        <div className="total-img p-4 mt-3">
          <div className="flex items-center justify-between">
            <img src={VaulIcon} alt="" className="w-4 mr-2 mb-[2px]" />
            <p className="fs-sm border border-[var(--white)] px-3 rounded-md flex items-center ">
              <BsShieldFillCheck className="mr-1" /> Financial security
            </p>
          </div>
          <div className="flex items-center ms-1 mt-2">
            <h3 className="heaing-h3 text-xl font-bold font-sans">
              ₹{Number(userInfo?.money_user)?.toFixed(2)}
            </h3>
            {/* <img src={RefereshImg} alt="" className='w-5 ms-2 mb-[2px]' /> */}
          </div>
          <p className="fs-sm mt-5">
            Transfer in 1 million, income 1000 per day
          </p>
        </div>

        <div className="mt-3 nav-bg pt-4">
          <div className="flex justify-between">
            <div className="flex justify-center items-center flex-col w-[50%] px-2">
              <h3 className="heading-h3 color-red-200 gray-100 font-bold">
                ₹0.00
              </h3>
              <p className="text-xs font-sans gray-50">Generated revenue</p>
              <p className="fs-sm pb-1 mt-1 font-sans rounded-full px-5 text-slate-500 border border-slate-500 text-xs">
                My interest rate 0.1%
              </p>
            </div>
            <div className="flex  items-center flex-col w-[50%] px-2 border-s border-[var(--bg-color-l)]">
              <h3 className="heading-h3 gray-100">₹0.00</h3>
              <p className="text-xs font-sans gray-50">Accumulated revenue</p>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex justify-center items-center flex-col w-[50%] p-2">
              <button className="border w-full text-[var(--bgdark)] flex color-blue-500 font-sans  justify-center items-center border-[var(--bgblue)] m-auto rounded-md p-2 mt-2 ">
                <span className="text-base">Transfer Out</span>
              </button>
            </div>
            <div className="flex justify-center items-center flex-col w-[50%] p-2">
              <button className="border bg-[var(--bgdark)] w-full flex  font-sans  justify-center items-center border-[var(--bgblue)] m-auto rounded-md p-2 mt-2 ">
                <span className="text-base ">Transfer in</span>
              </button>
            </div>
          </div>
          <p className="fs-sm color-red-200 flex items-center px-2 font-sans">
            <BsExclamationCircle className="color-red-200 mr-1 " />
            <span>
              Funds are safe and secure, and can be transferred at any time
            </span>
          </p>
          <p className="fs-sm gray-50 flex items-center mt-3 pb-1 justify-center font-sans">
            Learn about safes{" "}
            <MdKeyboardDoubleArrowRight className="text-slate-500" />
          </p>
        </div>

        <div className="flex items-center font-semibold mt-5 text-lg gray-100">
          <MdLibraryBooks className=" text-3xl mr-1 text-[var(--bgdark)]" />
          <h1>Historical record</h1>
        </div>

        <button className="border w-full flex text-[var(--bgdark)] font-semibold  justify-center items-center border-[var(--bgdark)] m-auto rounded-full p-2 mt-6 ">
          <span className="tracking-widest font-bold text-lg">All history</span>
        </button>
      </div>
    </>
  );
};

export default StrongBox;
