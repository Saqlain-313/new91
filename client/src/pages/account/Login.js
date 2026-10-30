import { useEffect, useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { MdKeyboardArrowDown } from "react-icons/md";

import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import CustomerImg from "../../assets/customerserviceIcon.png";
import AlertCopmponent from "../../components/AlertComponent";
import CustomeNavbar from "../../components/CustomeNavbar";
import { emailLogin, login } from "../../store/reducer/authReducer";

const Login = () => {
  const { successMessage, userInfo } = useSelector((state) => state.auth);

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

    dispatch(login({ username, pwd })).then((res) => {
      if (res?.payload?.status) {
        setAlertsuccess(true);
        const formattedDate = getCurrentFormattedDate();
        localStorage.setItem("currentDate", formattedDate);
        navigate("/");
        localStorage.setItem("topup", true);
        localStorage.setItem("topup22", true);
        localStorage?.removeItem("wingominute");
        localStorage?.removeItem("trxminute");
        localStorage?.removeItem("k3minute");
        localStorage?.removeItem("d5minute");
        localStorage.removeItem("app");
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
      navigate("/");
      console.log("User is logged in, redirecting to homepage.");
    } else if (!userInfo && location.pathname !== "/login") {
      console.log("User not found, redirecting to login.");
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
  }, [userInfo, location.pathname, navigate]);

  return (
    <>
      <CustomeNavbar logo="logo" />

      <div className="nav-bg px-4 pb-8 pt-5">
        <h1 className="heading-h1">Log in</h1>
        <p className="fs-sm mt-1">
          Please log in with your phone number or email <br />
          If you forget your password, please contact customer service
        </p>
      </div>
      <div className="container-section mt-3">
        <div className="container-section">
          <div className="flex items-center justify-between border-b border-gray-300">
            <div
              className={`flex flex-col justify-center items-center cursor-pointer  w-[50%] ${
                tabs === "phone"
                  ? "border-b-2 border-[var(--bg-color-l)]"
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
                  className={`svg-icon icon-phone ${
                    tabs === "phone" ? "color-l" : "gray-color"
                  } text-2xl`}
                >
                  <use href="#icon-phone"></use>
                </svg>
              </span>
              <h3
                className={`heading-h3 text-base  font-medium font-sans   leading-7 ${
                  tabs === "phone" ? "color-l" : "gray-color"
                } w-full text-center `}
              >
                Phone number
              </h3>
            </div>
            <div
              className={`flex flex-col justify-center items-center cursor-pointer  w-[50%] ${
                tabs === "email"
                  ? "border-b-2 border-[var(--bg-color-l)]"
                  : "border-b-2 border-transparent"
              }`}
              onClick={() => setTabs("email")}
            >
              <span>
                {/* <MdEmail
                  className={`${
                    tabs === "email" ? "color-l" : "gray-color"
                  } text-2xl`}
                /> */}
                <svg
                  data-v-47f4cc84=""
                  className={`svg-icon icon-email ${
                    tabs === "email" ? "color-l" : "gray-color"
                  } text-2xl`}
                >
                  <use href="#icon-email"></use>
                </svg>
              </span>
              <h3
                className={`heading-h3 text-base  font-medium font-sans  leading-7 ${
                  tabs === "email" ? "color-l" : "gray-color"
                } w-full text-center `}
              >
                Email login
              </h3>
            </div>
          </div>
          {tabs === "phone" ? (
            <div>
              <form action="" className="mt-5">
                <div>
                  <div className="flex items-center">
                    <span>
                      <svg
                        data-v-47f4cc84=""
                        className={`svg-icon icon-phone ${
                          tabs === "phone" ? "color-l" : "gray-color"
                        } text-2xl`}
                      >
                        <use href="#icon-phone"></use>
                      </svg>
                    </span>
                    <label htmlFor="" className="font-sans  ms-1 text-whites">
                      Phone number
                    </label>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <div className="w-[24%] flex items-center justify-center font-bold text-sm gray-color nav-bg rounded-xl p-2">
                      +91 <MdKeyboardArrowDown className="ms-1 text-lg" />
                    </div>
                    <input
                      type="number"
                      className="w-[75%] py-3  nav-bg border border-[--bgbody] rounded-xl p-2 focus:[var(--grey-200)] ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-gray-color placeholder:font-medium"
                      placeholder="Please enter your phone number"
                      name="username"
                      onChange={(e) => setUsername(e.target.value)}
                      value={username}
                    />
                  </div>
                </div>

                <div className="mt-4">
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
                      className="w-full  nav-bg border border-[--bgbody] rounded-xl p-2 py-3 focus:[var(--grey-100)] ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-[var(--grey-200)] placeholder:font-medium"
                      placeholder=" Password"
                    />
                    <span
                      onClick={toggleShowPassword}
                      className="absolute right-4 text-lg top-4 gray-50 cursor-pointer"
                    >
                      {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
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
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center peer-checked:border-[var(--bg-color-l)] peer-checked:bg-[var(--bg-color-l)]">
                      <svg
                        className={`w-4 h-4 text-white ${
                          isChecked ? "block" : "hidden"
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
                className={`${
                  username && pwd ? "blue-linear2" : "bg-[#454456]"
                } flex justify-center text-black text-lg w-80 m-auto font-bold text-center rounded-full p-1 py-2 mt-5 tracking-[3px]`}
                onClick={handleSubmit}
              >
                Log in
              </button>

              <button
                className="border  w-80 flex color-l font-semibold  justify-center items-center border-[var(--bg-color-l)] m-auto rounded-full p-1 py-2 mt-6 "
                onClick={() => navigate("/register")}
              >
                {" "}
                <span className="tracking-[3px] font-bold text-lg">
                  Register
                </span>
              </button>
            </div>
          ) : (
            <div>
              <form action="" className="mt-5">
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
                      className="w-full py-3  nav-bg border border-[--bgbody] rounded-xl p-2 focus:[var(--grey-100)] ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-[var(--grey-200)] placeholder:font-medium"
                      placeholder="Please enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4">
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
                  <div className="mt-3 flex justify-between relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full  nav-bg border border-[--bgbody] rounded-xl p-2 py-3 focus:[var(--grey-100)] ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-[var(--grey-200)] placeholder:font-medium"
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

                <div className="flex items-center mt-4">
                  <label className="flex items-center ">
                    <input
                      type="checkbox"
                      className="hidden peer"
                      checked={isChecked}
                      onChange={handleCheckboxChange}
                    />
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center peer-checked:border-[var(--bg-color-l)] peer-checked:bg-[var(--bg-color-l)]">
                      <svg
                        className={`w-4 h-4 text-white ${
                          isChecked ? "block" : "hidden"
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
                className={`${
                  username && pwd ? "blue-linear2" : "bg-[#454456]"
                } flex justify-center text-white text-lg w-80 m-auto font-bold text-center rounded-full p-1 py-2 mt-5 tracking-[3px]`}
                onClick={handleSubmitEmail}
              >
                Log in
              </button>

              <button
                className="border  w-80 flex color-l font-semibold  justify-center items-center border-[var(--bg-color-l)] m-auto rounded-full p-1 py-2 mt-6 "
                onClick={() => navigate("/register")}
              >
                {" "}
                <span className="tracking-[3px] font-bold text-lg">
                  Register
                </span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-10">
            <Link
              className="flex items-center justify-center flex-col w-[50%]"
              to={"/forgot"}
            >
              <span>
                {/* <MdLock className="color-l text-4xl" /> */}
                <svg
                  data-v-436a69c4=""
                  className="svg-icon icon-clock_b forgetbg forgetbg color-l w-9 h-9"
                >
                  <use href="#icon-clock_b"></use>
                </svg>
              </span>
              <p className="text-sm text-whites">Forgot password</p>
            </Link>
            <Link
              className="flex items-center justify-center flex-col w-[50%]"
              to={`https://h5.workorder.support.max-win.site/`}
            >
              <img src={CustomerImg} alt="" className="w-8 filter-imgs" />
              {/* <svg
                data-v-436a69c4=""
                class="svg-icon icon-serverTicket1 forgetbg forgetbg"
              >
                <use href="#icon-serverTicket1"></use>
              </svg> */}
              <p className="text-sm text-whites">Customer Service</p>
            </Link>
          </div>
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
