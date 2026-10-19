import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";

import { ImMobile } from "react-icons/im";
import { MdKeyboardArrowDown, MdVerifiedUser } from "react-icons/md";
import { TbLockFilled } from "react-icons/tb";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { forgotPassword, otpSend } from "../../store/reducer/authReducer";
import AlertCopmponent from "../../components/AlertComponent";
import Cookies from "js-cookie";
import CustomeNavbar from "../../components/CustomeNavbar";
const Forgot = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [username, setUsername] = useState("");
  const [alertsuccess, setAlertsuccess] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const [countdown, setCountdown] = useState(0);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const toggleShowPassword2 = () => {
    setShowPassword2(!showPassword2);
  };

  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleReset = () => {
    const state = new FormData();
    state.append("username", username);
    state.append("pwd", password);
    state.append("pwd2", password2);
    state.append("otp", otp);
    Cookies.remove("auth");
    dispatch(forgotPassword(state)).then((res) => {
      setSuccessMessage(res.payload.message);
      if (res.payload.status) {
        setAlertsuccess(true);
        setTimeout(() => {
          navigate(`/login`);
        }, 2000);
      } else {
        setAlerts(true);
      }
    });
  };

  useEffect(() => {
    setTimeout(() => {
      setAlerts(false);
      setAlertsuccess(false);
    }, 2000);
  }, [dispatch, alerts, alertsuccess]);

  const handleOtp = async () => {
    dispatch(otpSend(username)).then((res) => {
      setSuccessMessage(res.payload.message);
      if (res.payload.status) {
        setAlertsuccess(true);
        setCountdown(60);
      } else {
        setAlerts(true);
      }
    });
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer); // Clean up
    }
  }, [countdown]);

  return (
    <>
      <CustomeNavbar logo="logo" bgClass="nav-bg" />
      <div className="blue-linear2 px-4 pb-6">
        <h1 className="heading-h1 pt-2 py-2">Forgot password</h1>
        <p className="fs-sm">
          Please retrieve/change your password through your mobile phone number
          or email
        </p>
      </div>
      <div className="container-section mt-5">
        <div className="flex flex-col justify-center items-center">
          <span>
            <span>
              <svg data-v-47f4cc84="" class="svg-icon icon-phone">
                <use href="#icon-phone"></use>
              </svg>
            </span>
          </span>
          <h3 className="heading-h3 text-base  font-semibold mt-1 leading-10 text-[#F95959] border-b-2 w-full text-center border-[#F95959]">
            phone reset
          </h3>
        </div>

        <form action="" className="mt-8">
          <div>
            <div className="flex items-center">
              <span>
                {/* <BsPhoneFill className="color-l text-2xl" /> */}
                <svg data-v-47f4cc84="" class="svg-icon icon-phone">
                  <use href="#icon-phone"></use>
                </svg>
              </span>

              <label htmlFor="" className="font-medium ms-1 gray-100">
                Phone number
              </label>
            </div>
            <div className="mt-3 flex justify-between">
              <div className="w-[24%] flex items-center justify-center font-bold text-sm gray-50 bg-light rounded-lg p-2">
                +91 <MdKeyboardArrowDown className="ms-1 text-lg" />
              </div>
              <input
                type="number"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-[75%] py-3 bg-light border border-[--bgbody] focus:border-gray-200 rounded-lg p-2 focus:[#fff] ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-[var(--grey-200)]"
                placeholder="Please enter the phone number"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <span>
                <svg
                  data-v-ea5b66c8=""
                  className="svg-icon icon-editPswIcon passwordInput__container-label__icon color-l text-2xl"
                >
                  <use href="#icon-editPswIcon"></use>
                </svg>
              </span>
              <label htmlFor="" className="font-medium ms-1 gray-100">
                A new Password
              </label>
            </div>
            <div className="mt-3 flex justify-between relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full  bg-light border border-[--bgbody] rounded-lg p-2 py-3 focus:[var(--grey-100)] ps-6 flex items-center focus:border focus:outline-none focus:border-gray-200 placeholder:text-sm placeholder:text-[var(--grey-200)]"
                placeholder="A new password"
              />
              <span
                onClick={toggleShowPassword}
                className="absolute right-4 text-lg top-4 gray-100 cursor-pointer"
              >
                {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
              </span>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center">
              <span>
                <svg
                  data-v-ea5b66c8=""
                  className="svg-icon icon-editPswIcon passwordInput__container-label__icon color-l text-2xl"
                >
                  <use href="#icon-editPswIcon"></use>
                </svg>
              </span>
              <label htmlFor="" className="font-medium ms-1 gray-100">
                Confirm new password
              </label>
            </div>
            <div className="mt-3 flex justify-between relative">
              <input
                type={showPassword2 ? "text" : "password"}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="w-full  bg-light border border-[--bgbody] rounded-lg p-2 py-3 focus:[var(--grey-100)] ps-6 flex items-center focus:border focus:outline-none focus:border-gray-200 placeholder:text-sm placeholder:text-[var(--grey-200)]"
                placeholder="Please new password"
              />
              <span
                onClick={toggleShowPassword2}
                className="absolute right-4 text-lg top-4 gray-100 cursor-pointer"
              >
                {showPassword2 ? <IoEyeOutline /> : <IoEyeOffOutline />}
              </span>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center ">
              <span>
                <MdVerifiedUser className="text-[#F95959] text-2xl" />
              </span>
              <label htmlFor="" className="font-medium ms-1 gray-100">
                Verification Code
              </label>
            </div>
            <div className="mt-3 flex justify-between relative">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full  bg-light border border-[--bgbody] rounded-lg p-2 py-3 focus:[var(--grey-100)] ps-6 flex items-center focus:border focus:outline-none focus:border-gray-200 placeholder:text-sm placeholder:text-[var(--grey-200)]"
                placeholder="Please enter the confirmation code"
              />
              <span
                onClick={handleOtp}
                disabled={countdown > 0}
                type="submit"
                className="absolute blue-linear right-3 top-2 text-white cursor-pointer text-sm px-6 py-2 rounded-full"
              >
                {countdown > 0 ? `Wait ${countdown}s` : "Send"}
              </span>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <label className="flex items-center ">
              <input
                type="checkbox"
                className="hidden peer"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
              <div className="w-5 h-5 rounded-full border-2 border-[#F95959] flex items-center justify-center peer-checked:border-[#F95959] peer-checked:bg-[#F95959]">
                <svg
                  className={`w-4 h-4 text-white ${isChecked ? "block" : "hidden"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414L8 11.586l6.793-6.793a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="gray-50 ms-2 mr-2 text-sm cursor-pointer">
                I have read and agree
              </span>{" "}
              <Link
                to={"/main/About/RiskDisclosure"}
                className="color-red-200 text-sm"
              >
                [Privacy Agreement]
              </Link>
            </label>
          </div>
        </form>
        <button
          onClick={handleReset}
          className="blue-linear flex justify-center  text-xl  w-80 text-white  m-auto font-bold text-center  rounded-full p-2 mt-5 tracking-[3px]"
        >
          Reset
        </button>
      </div>
      <div className={`place-bet-popup ${alertsuccess ? "active" : ""}`}>
        <div className="text-sm">{successMessage}</div>
      </div>
      <AlertCopmponent alertPopup={alerts} message={successMessage} />
    </>
  );
};

export default Forgot;
