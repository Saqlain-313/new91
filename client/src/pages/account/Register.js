import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import Logo from "../../assets/logo.png";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import AlertCopmponent from "../../components/AlertComponent";
import { register } from "../../store/reducer/authReducer";

import axios from "axios";
import "react-phone-input-2/lib/style.css";
import eng from "../../assets/english-logo.png";
import ind from "../../assets/india-flag.png";
import CustomeNavbar from "../../components/CustomeNavbar";

const Register = () => {
  const [ccode, setCcode] = useState("");
  const { loader, successMessage, bannergetData } = useSelector(
    (state) => state.auth,
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(false);
  const [alertsuccess, setAlertsuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    pwd: "",
    cpass: "",
    form: "",
  });
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [code, setCode] = useState("91");
  const [error, setError] = useState("");
  const [disable, setDisable] = useState(true);

  const invitecode = queryParams.get("invitationCode");
  const [state, setState] = useState({
    username: "",
    pwd: "",
    cpass: "",
    invitecode: invitecode,
    ccode: "",
  });
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

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

  //console.log("ddd", ccode);
  const inputHandle = (e) => {
    const { name, value } = e.target;

    const updatedState = {
      ...state,
      [name]: value,
    };

    setState(updatedState);
    // call validation every time user types
  };

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

  const handleSubmit = async () => {
    dispatch(register(state)).then((res) => {
      if (res.payload.status) {
        setAlertsuccess(true); // popup show

        // navigate ko delay kar do
        setTimeout(() => {
          navigate("/");
        }, 2000);

        localStorage.setItem("topup", true);
        localStorage.setItem("topup22", true);
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
    setState({
      ...state,
      invitecode: invitecode || "xWtUd92947",
      ccode: ccode,
    });
  }, [successMessage, dispatch, alerts, alertsuccess]);

  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        const response = await axios.get("/json/");
        // //console.log("code",ccode,"response.data",response.data)
        if (response.data && response.data.country_calling_code) {
          setCcode(response.data.country_calling_code.replace("+", ""));
        }
      } catch (error) {
        console.error("Error fetching country code:", error);
      }
    };

    fetchCountryCode();
  }, []);

  useEffect(() => {
    const isFormValid =
      state.username.trim() !== "" &&
      state.pwd.trim() !== "" &&
      state.cpass.trim() !== "" &&
      state.pwd === state.cpass;

    setDisable(!isFormValid);
  }, [state]);

  return (
    <>
      <CustomeNavbar logo="logo" bgClass="nav-bg" />
      <div className="nav-bg px-6 pb-12 pt-2">
        <h1 className="heading-h1">Register</h1>
        <p className="fs-sm mt-2">Please register by phone number or email</p>
      </div>
      {/* <div className="nav-bg px-4 pb-8">
        <h1 className="heading-h1">Register</h1>
        <p className="fs-sm mt-2">Please register by phone number or email</p>
      </div> */}
      <div className="container-section">
        <div className="container-section mt-2">
          <div className="flex flex-col justify-center items-center">
            <span>
              <svg data-v-50aa8bb0="" class="svg-icon icon-phone size-7">
                <use href="#icon-phone" className=""></use>
              </svg>
            </span>
            <h3 className="heading-h3 text-base pb-2 font-semibold mt-1 leading-7 text-[#F95959] border-b-2 w-full text-center border-[#F95959]">
              Register your phone
            </h3>
          </div>

          <form action="" className="mt-8">
            <div>
              <div className="flex items-center">
                <span>
                  <svg data-v-50aa8bb0="" class="svg-icon icon-phone size-6">
                    <use href="#icon-phone" className=""></use>
                  </svg>
                </span>
                <label htmlFor="" className=" ms-1 text-black">
                  Phone number
                </label>
              </div>
              <div className="mt-3 flex justify-between gap-1">
                <div className="relative">
                  <div
                    className="w-full h-full flex items-center justify-center text-base gray-100 rounded-lg p-2 cursor-pointer bg-light"
                    onClick={toggleDropdown}
                  >
                    +{code} <MdKeyboardArrowDown className="ms-1 text-lg" />
                  </div>
                  {isDropdownVisible && (
                    <div className="absolute top-full bg-light shadow-lg rounded-lg w-[330px] z-20 text-sm gray-100 h-[40vh] overflow-auto">
                      {countryCodes.map((country, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-[#e1e4e8] cursor-pointer"
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
                  className="w-[95%] py-3 bg-light border border-[--bgbody] rounded-lg p-2 ps-6 flex items-center focus:border focus:outline-none focus:border-gray-200 placeholder:text-sm placeholder:text-[--grey-200]"
                  placeholder="Please enter the phone number"
                  name="username"
                  onChange={inputHandle}
                  value={state.username}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>
            {/* <p className="fs-sm mt-1 color-l leading-3">
              The phone number cannot start with 0 when registering! <br />
              1234567890
            </p> */}
            <div className="mt-4">
              <div className="flex items-center">
                <span>
                  <svg
                    data-v-ea5b66c8=""
                    class="svg-icon icon-editPswIcon passwordInput__container-label__icon passwordInput__container-label__icon size-6"
                  >
                    <use href="#icon-editPswIcon"></use>
                  </svg>
                </span>
                <label htmlFor="" className=" ms-1 text-black">
                  Set Password
                </label>
              </div>
              <div className="mt-3 flex justify-between relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="pwd"
                  onChange={inputHandle}
                  value={state.pwd}
                  className="w-full bg-light border border-[--bgbody] rounded-lg p-2 py-3  ps-6 flex items-center focus:border focus:outline-none focus:border-gray-200 placeholder:text-sm placeholder:text-[--grey-200]"
                  placeholder="Please enter the password"
                />
                <span
                  onClick={toggleShowPassword}
                  className="absolute right-4 text-lg top-3 text-black cursor-pointer"
                >
                  {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </span>
              </div>
              {errors.pwd && (
                <p className="text-red-500 text-sm mt-1">{errors.pwd}</p>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center">
                <span>
                  <svg
                    data-v-ea5b66c8=""
                    class="svg-icon icon-editPswIcon passwordInput__container-label__icon passwordInput__container-label__icon size-6"
                  >
                    <use href="#icon-editPswIcon"></use>
                  </svg>
                </span>
                <label htmlFor="" className=" ms-1 text-black">
                  Confirm Password
                </label>
              </div>
              <div className="mt-3 flex justify-between relative">
                <input
                  type={showPassword2 ? "text" : "password"}
                  name="cpass"
                  onChange={inputHandle}
                  value={state.cpass}
                  className="w-full bg-light border border-[--bgbody] rounded-lg p-2 py-3  ps-6 flex items-center focus:border focus:outline-none focus:border-gray-200 placeholder:text-sm placeholder:text-[--grey-200]"
                  placeholder="Please enter the confirm password"
                />
                <span
                  onClick={toggleShowPassword2}
                  className="absolute right-4 text-lg top-3 text-black cursor-pointer"
                >
                  {showPassword2 ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </span>
              </div>
              {errors.cpass && (
                <p className="text-red-500 text-sm mt-1">{errors.cpass}</p>
              )}
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <span>
                  <svg
                    data-v-e26f70e7=""
                    class="svg-icon icon-invitation size-6"
                  >
                    <use href="#icon-invitation"></use>
                  </svg>
                </span>
                <label htmlFor="" className=" ms-1 text-black">
                  Invite code
                </label>
              </div>
              <div className="mt-3 flex justify-between">
                <input
                  type="text"
                  className="w-full bg-light border border-[--bgbody] rounded-lg p-2 py-2  ps-6 flex items-center focus:border focus:outline-none focus:border-gray-200 placeholder:text-sm placeholder:text-[--grey-200]"
                  placeholder="Please enter the invitation code"
                  name="invitecode"
                  readOnly
                  onChange={inputHandle}
                  value={state.invitecode}
                />
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
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center peer-checked:border-[#F95959] peer-checked:bg-[#F95959]">
                  <svg
                    className={`w-3 h-3 text-white ${
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
                <span className="gray-50 ms-2 mr-2 fs-sm cursor-pointer">
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
            className="flex justify-center text-lg w-72 m-auto font-semibold text-center
    rounded-full p-2 mt-5 tracking-widest
    bg-gradient-to-r from-[#FF5757] to-[#FF9992] text-white"
            disabled={disable || loader}
            onClick={() => handleSubmit()}
          >
            Register
          </button>

          <button
            className="border  w-72 flex color-l font-semibold justify-center items-center border-[#F95959] m-auto rounded-full p-2 mt-6 "
            onClick={() => navigate("/login")}
          >
            <span className="text-sm font-normal mr-2 gray-100 tracking-widest">
              I have an account
            </span>{" "}
            <span className="tracking-widest font-bold text-lg text-[#F95959]">
              Login
            </span>
          </button>
        </div>
      </div>
      <div className={`place-bet-popup ${alertsuccess ? "active" : ""}`}>
        <div className="text-sm">{successMessage}</div>
      </div>

      {showPopup && (
        <div className="fixed bottom-0 w-full md:w-[24.7rem] bg-[#201d2b] shadow-md rounded-md p-2 animate-slide-up z-[101]">
          <label
            className="flex items-center justify-between hover:bg-[#333332] px-4 rounded-lg"
            onClick={() => setShowPopup(false)}
          >
            <div className=" text-left p-2 text-text-black0 flex items-center gap-2">
              <span>
                <img
                  src={eng}
                  className="size-8 rounded-full overflow-hidden object-cover"
                  alt="eng"
                />
              </span>
              English
            </div>
            <input type="checkbox" className="hidden peer" />
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
          </label>
          <label
            className="flex items-center justify-between hover:bg-[#333332] px-4 rounded-lg"
            onClick={() => setShowPopup(false)}
          >
            <button className=" text-left p-2 text-text-black0 flex items-center gap-2">
              <span>
                <img
                  src={ind}
                  className="size-8 rounded-full overflow-hidden object-cover"
                  alt="eng"
                />
              </span>
              Hindi
            </button>
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
          </label>
        </div>
      )}

      <AlertCopmponent alertPopup={alerts} message={successMessage} />
    </>
  );
};

export default Register;
