import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";

import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { BsPhoneFill } from "react-icons/bs";

import CustomerImg from "../../assets/customerserviceIcon.png";
import { emailLogin, login } from "../../store/reducer/authReducer";
import { useDispatch, useSelector } from "react-redux";
import AlertCopmponent from "../../components/AlertComponent";
import axios from "axios";
import CustomeNavbar from "../../components/CustomeNavbar";
import Loader from "../../components/Loader";

const Login = () => {
  const { successMessage, userInfo } = useSelector((state) => state.auth);

  // const { checkBalanceData, loader } = useSelector((state) => state.spribeGame);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [tabs, setTabs] = useState("phone");
  const [alerts, setAlerts] = useState(false);
  const [value, setValue] = useState();
  const [alertsuccess, setAlertsuccess] = useState(false);
  const [referesh, setRefesh] = useState(false);
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [code, setCode] = useState("91");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const countryCodes = [
    { name: "USA", code: "1" },
    { name: "Thailand", code: "66" },
    { name: "Indonesia", code: "62" },
    { name: "Myanmar", code: "95" },
    { name: "United Arab Emirates", code: "971" },
    { name: "Afghanistan", code: "93" },
    { name: "Argentina", code: "54" },
    { name: "Bangladesh", code: "880" },
    { name: "Bhutan", code: "975" },
    { name: "Botswana", code: "267" },
    { name: "Canada", code: "1" },
    { name: "Chad", code: "235" },
    { name: "Comoros", code: "269" },
    { name: "Congo (DRC)", code: "243" },
    { name: "Egypt", code: "20" },
    { name: "Ethiopia", code: "251" },
    { name: "France", code: "33" },
    { name: "Georgia", code: "995" },
    { name: "Ghana", code: "233" },
    { name: "India", code: "91" },
    { name: "Italy", code: "39" },
    { name: "Kazakhstan", code: "7" },
    { name: "Kenya", code: "254" },
    { name: "Kosovo", code: "383" },
    { name: "Liberia", code: "231" },
    { name: "Libya", code: "218" },
    { name: "Malaysia", code: "60" },
    { name: "Morocco", code: "212" },
    { name: "Nepal", code: "977" },
    { name: "Nigeria", code: "234" },
    { name: "Pakistan", code: "92" },
    { name: "Peru", code: "51" },
    { name: "Qatar", code: "974" },
    { name: "Russia", code: "7" },
    { name: "Rwanda", code: "250" },
    { name: "Saudi Arabia", code: "966" },
    { name: "South Africa", code: "27" },
    { name: "Sri Lanka", code: "94" },
    { name: "Sudan", code: "249" },
    { name: "Tanzania", code: "255" },
    { name: "Turkey", code: "90" },
    { name: "Vatican City", code: "39" },
    { name: "Western Sahara", code: "212" },
    { name: "Zambia", code: "260" },
    { name: "Zimbabwe", code: "263" },
  ];

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const [isChecked, setIsChecked] = useState(false);

  const [state, setState] = useState({
    username: "",
    pwd: "",
  });

  const getCurrentFormattedDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async () => {
    // setVisible(false);
    setLoading(true); // loader start
    dispatch(login({ username, pwd })).then((res) => {
      setLoading(false); // 2 sec ke baad loader stop

      if (res?.payload?.status) {
        setLoading2(true);
        setTimeout(() => {
          setAlertsuccess(true);
          const formattedDate = getCurrentFormattedDate();
          localStorage.setItem("currentDate", formattedDate);
          // navigate("/");
          localStorage.setItem("topup", true);
          localStorage.setItem("topup22", true);
          localStorage?.removeItem("wingominute");
          localStorage?.removeItem("trxminute");
          localStorage?.removeItem("k3minute");
          localStorage?.removeItem("d5minute");
          localStorage.removeItem("app");
        }, 2000); // yahi pe loader 2s chalega
      } else {
        setAlerts(true);
      }
    });
  };

  axios.defaults.withCredentials = true;

  // const handleSubmit = async () => {
  //   setVisible(true);
  // };

  const handleSubmitEmail = async () => {
    dispatch(emailLogin({ email, pwd })).then((res) => {
      if (res.payload.status) {
        setAlertsuccess(true);
        const formattedDate = getCurrentFormattedDate();
        localStorage.setItem("currentDate", formattedDate);
        navigate("/");
      } else {
        setAlerts(true);
      }
    });
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    if (isChecked) {
      localStorage.removeItem("phone");
      localStorage.removeItem("pass");
    } else {
      localStorage.setItem("phone", username);
      localStorage.setItem("pass", pwd);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setAlerts(false);
      setAlertsuccess(false);
      setRefesh(false);
    }, 2000);
  }, [
    successMessage,
    dispatch,
    state,
    visible,
    referesh,
    alerts,
    alertsuccess,
  ]);

  useEffect(() => {
    if (userInfo && location.pathname === "/login") {
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000); // 5 seconds delay
      //console.log("User is logged in, redirecting to homepage.");
    } else if (!userInfo && location.pathname !== "/login") {
      //console.log("User not found, redirecting to login.");
      navigate("/login");
    }

    const phones = localStorage.getItem("phone");
    if (phones) {
      setIsChecked(true);
    }
    if (phones !== null && phones !== undefined) {
      setUsername(localStorage.getItem("phone"));
      setPwd(localStorage.getItem("pass"));
    }
  }, [userInfo, loading2, location.pathname, navigate]);

  return (
    <>
      <CustomeNavbar logo="logo" bgClass="nav-bg" />

      <div className="nav-bg px-5 pb-8 pt-2.5">
        <h1 className="heading-h1">Log in</h1>
        <p className="fs-sm mt-1">
          Please log in with your phone number or email <br />
          If you forget your password, please contact customer service
        </p>
      </div>
      {loading2 && <Loader />}
      <div className="container-section mt-3">
        <div className="container-section">
          <div className="flex items-center justify-between border-b border-gray-300">
            <div
              className={`flex flex-col justify-center items-center cursor-pointer  w-[50%] ${tabs === "phone"
                ? "border-b-2 border-[#F95959]"
                : "border-b-2 border-transparent"
                }`}
              onClick={() => setTabs("phone")}
            >
              <span>
                {/* <BsPhoneFill
                  className={`${
                    tabs === "phone" ? "color-l" : "gray-color"
                  } text-2xl`}
                /> */}
                <svg
                  data-v-47f4cc84=""
                  className={`svg-icon-login icon-phone ${tabs === "phone" ? "text-[#F95959]" : "gray-color"
                    } text-2xl`}
                >
                  <use href="#icon-phone"></use>
                </svg>
              </span>
              <h3
                className={`heading-h3 text-base  font-bold font-sans   leading-7 ${tabs === "phone" ? "text-[#F95959]" : "gray-color"
                  } w-full text-center `}
              >
                phone number
              </h3>
            </div>
            <div
              className={`flex flex-col justify-center items-center cursor-pointer  w-[50%] ${tabs === "email"
                ? "border-b-2 border-[#F95959]"
                : "border-b-2 border-transparent"
                }`}
              onClick={() => setTabs("email")}
            >
              <span className="flex">
                {/* <MdEmail
                  className={`${
                    tabs === "email" ? "color-l" : "gray-color"
                  } text-2xl`}
                /> */}
                <svg
                  data-v-47f4cc84=""
                  className={`svg-icon-login icon-email ${tabs === "email" ? "text-[#F95959]" : "gray-color"
                    } text-2xl`}
                >
                  <use href="#icon-email"></use>
                </svg>
              </span>
              <h3
                className={`heading-h3 text-base  font-bold font-sans  leading-7 ${tabs === "email" ? "text-[#F95959]" : "gray-color"
                  } w-full text-center `}
              >
                Email login
              </h3>
            </div>
          </div>
          {tabs === "phone" ? (
            <div>
              <form action="" className="mt-7">
                <div>
                  <div className="flex items-center">
                    <span>
                      {/* <BsPhoneFill className="color-l text-2xl" /> */}
                      <svg data-v-47f4cc84="" class="svg-icon icon-phone">
                        <use href="#icon-phone"></use>
                      </svg>
                    </span>
                    <label htmlFor="" className="font-sans  ms-1 text-whites">
                      Phone number
                    </label>
                  </div>
                  <div className="mt-3 flex justify-between gap-1">
                    <div className="relative">
                      <div
                        className="w-full h-full flex items-center justify-center text-base gray-100 bg-light rounded-lg p-2 cursor-pointer"
                        onClick={toggleDropdown}
                      >
                        +{code} <MdKeyboardArrowDown className="ms-1 text-xl" />
                      </div>
                      {isDropdownVisible && (
                        <div className="absolute top-full  bg-light shadow-lg rounded-lg w-[330px] z-20 text-sm gray-100 h-[40vh] overflow-auto">
                          {countryCodes.map((country, index) => (
                            <div
                              key={index}
                              className="p-2 hover:bg-gray-200 cursor-pointer"
                              onClick={() => {
                                setCode(country.code);
                                setDropdownVisible(false);
                              }}
                            >
                              +{country.code} {country.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      type="number"
                      className={`w-[95%] bg-light border rounded-lg p-3 ps-6 flex items-center 
    placeholder:text-sm placeholder:text-[var(--grey-200)] 
    focus:border-gray-200 focus:outline-none 
    ${username ? "border-gray-200" : "border-[--bgbody]"}`}
                      placeholder="Please enter your phone number"
                      name="username"
                      onChange={(e) => setUsername(e.target.value)}
                      value={username}
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center">
                    <span>
                      {/* <TbLockFilled className="color-l text-2xl" /> */}
                      <svg
                        data-v-ea5b66c8=""
                        className="svg-icon icon-editPswIcon passwordInput__container-label__icon color-l text-2xl"
                      >
                        <use href="#icon-editPswIcon"></use>
                      </svg>
                    </span>
                    <label htmlFor="" className="font-sans ms-1 text-whites">
                      Password
                    </label>
                  </div>
                  <div className="mt-3 flex justify-between relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="pwd"
                      onChange={(e) => setPwd(e.target.value)}
                      value={pwd}
                      placeholder="Password"
                      className={`w-full bg-light border rounded-xl p-2 py-3 ps-6 placeholder:text-sm placeholder:text-[var(--grey-200)] placeholder:font-medium 
    ${pwd ? "border-gray-200" : "border-[--bgbody]"
                        } focus:border-gray-200 focus:outline-none`}
                    />

                    <span
                      onClick={toggleShowPassword}
                      className="absolute right-4 text-lg top-4 gray-50 cursor-pointer"
                    >
                      {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                    </span>
                  </div>
                </div>

                <div className="flex items-center mt-6">
                  <label className="flex items-center ">
                    <input
                      type="checkbox"
                      className="hidden peer"
                      checked={isChecked}
                      onChange={handleCheckboxChange}
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center peer-checked:border-[#F95959] peer-checked:bg-[#F95959]">
                      <svg
                        className={`w-4 h-4 text-white ${isChecked ? "block" : "hidden"
                          }`}
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
                    <span className="text-whites ms-2 mr-2 fs-sm cursor-pointer">
                      Remember password
                    </span>
                  </label>
                </div>
                {/* disabled={loader?true:false} */}
              </form>
              <button
                className="flex justify-center text-lg w-72 m-auto font-bold text-center
    rounded-full p-2 mt-5 tracking-[3px]
    bg-gradient-to-r from-[#FF5757] to-[#FF9992] text-white"
                onClick={handleSubmit}
              >
                Log in
              </button>

              <button
                className="border  w-72 flex text-[#F95959] font-semibold  justify-center items-center border-[#F95959] m-auto rounded-full p-2 mt-6 "
                onClick={() => navigate("/register")}
              >
                {" "}
                <span className="tracking-[3px] font-bold text-xl">
                  Register
                </span>
              </button>
            </div>
          ) : (
            <div>
              <form action="" className="mt-7">
                <div>
                  <div className="flex items-center">
                    <span>
                      {/* <MdEmail className="color-l text-2xl" /> */}
                      <svg
                        data-v-4499df08=""
                        className="svg-icon icon-email emailinput__container-label__icon emailinput__container-label__icon color-l text-2xl"
                      >
                        <use href="#icon-email"></use>
                      </svg>
                    </span>
                    <label htmlFor="" className="font-sans  ms-1 text-whites">
                      Mail
                    </label>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <input
                      type="text"
                      className="w-full py-3  bg-light border border-[#E1E1E1] rounded-xl p-2 focus:[var(--grey-200)] ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-[var(--grey-200)] placeholder:font-medium"
                      placeholder="Please enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex items-center">
                    <span>
                      {/* <TbLockFilled className="color-l text-2xl" /> */}
                      <svg
                        data-v-ea5b66c8=""
                        className="svg-icon icon-editPswIcon passwordInput__container-label__icon passwordInput__container-label__icon color-l text-2xl"
                      >
                        <use href="#icon-editPswIcon"></use>
                      </svg>
                    </span>
                    <label htmlFor="" className="font-sans ms-1 text-whites">
                      Password
                    </label>
                  </div>
                  <div className="mt-4 flex justify-between relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-light border border-[--bg-light] rounded-xl p-2 py-3 focus:[#FFF] ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-[var(--grey-200)] placeholder:font-medium"
                      placeholder="Password"
                      value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                    />
                    <span
                      onClick={toggleShowPassword}
                      className="absolute right-4 text-lg top-4 gray-50 cursor-pointer"
                    >
                      {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                    </span>
                  </div>
                </div>

                <div className="flex items-center mt-6">
                  <label className="flex items-center ">
                    <input
                      type="checkbox"
                      className="hidden peer"
                      checked={isChecked}
                      onChange={handleCheckboxChange}
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center peer-checked:border-[#F95959] peer-checked:bg-[#F95959]">
                      <svg
                        className={`w-4 h-4 text-white ${isChecked ? "block" : "hidden"
                          }`}
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
                    <span className="text-whites ms-2 mr-2 fs-sm cursor-pointer">
                      Remember password
                    </span>
                  </label>
                </div>
              </form>
              <button
                className="flex justify-center text-lg w-72 m-auto font-bold text-center
    rounded-full p-2 mt-5 tracking-[3px]
    bg-gradient-to-r from-[#FF5757] to-[#FF9992] text-white"
                onClick={handleSubmitEmail}
              >
                Log in
              </button>

              <button
                className="border  w-72 flex color-l font-semibold  justify-center items-center border-[#F95959] m-auto rounded-full p-2 mt-6 "
                onClick={() => navigate("/register")}
              >
                {" "}
                <span className="tracking-[3px] font-bold text-[#F95959] text-lg">
                  Register
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={visible ? "overlay-section block" : "hidden"}></div>

      <div className={`place-bet-popup ${alertsuccess ? "active" : ""}`}>
        <div className="text-sm">{successMessage}</div>
      </div>

      <AlertCopmponent alertPopup={alerts} message={successMessage} />
      <AlertCopmponent alertPopup={referesh} message={"Referesh Successful"} />
    </>
  );
};

export default Login;