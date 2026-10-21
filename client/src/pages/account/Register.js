import { useEffect, useState } from "react";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AlertCopmponent from "../../components/AlertComponent";
import CustomeNavbar from "../../components/CustomeNavbar";
import { register } from "../../store/reducer/authReducer";

const Register = () => {
  const [ccode, setCcode] = useState("91");
  // Destructure errorMessage from Redux state
  const { loader, successMessage, errorMessage } = useSelector(
    (state) => state.auth,
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(false); // For error alerts
  const [alertSuccess, setAlertSuccess] = useState(false); // For success alerts
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    pwd: "",
    cpass: "",
  });
  const [alertMessage, setAlertMessage] = useState(""); // State to hold the specific message for the AlertComponent

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get("invitationCode");
  const [state, setState] = useState({
    username: "",
    pwd: "",
    cpass: "",
    invitecode: code,
    ccode: "",
  });

  const inputHandle = (e) => {
    const { name, value } = e.target;
    setState({
      ...state,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: "",
      pwd: "",
      cpass: "",
    };

    // Check if any critical field is empty for a generic "Please fill all fields" message
    if (!state.username || !state.pwd || !state.cpass) {
      setAlertMessage("Please fill all required fields.");
      setAlerts(true);
      return false; // Indicate overall form invalidity
    }

    // Phone number validation
    if (!state.username) {
      // This check is redundant if the above "all fields" check covers it, but kept for specific error message
      newErrors.username = "Phone number is required";
      valid = false;
    } else if (!/^\d{10}$/.test(state.username)) {
      newErrors.username = "Please enter a valid 10-digit phone number";
      valid = false;
    }

    // Password validation
    // if (!state.pwd) { // Redundant if "all fields" covers it
    //   newErrors.pwd = "Password is required";
    //   valid = false;
    // } else if (state.pwd.length < 6) {
    //   newErrors.pwd = "Password must be at least 6 characters";
    //   valid = false;
    // } else if (!/\d/.test(state.pwd) || !/[a-zA-Z]/.test(state.pwd)) {
    //   newErrors.pwd = "Password must contain both letters and numbers";
    //   valid = false;
    // }
    if (!state.pwd) {
      newErrors.pwd = "Password is required";
      valid = false;
    }

    // Confirm password validation
    if (!state.cpass) {
      // Redundant if "all fields" covers it
      newErrors.cpass = "Please confirm your password";
      valid = false;
    } else if (state.pwd !== state.cpass) {
      newErrors.cpass = "Passwords do not match";
      valid = false;
    }

    // Invite code validation (specific message for this field)
    // if (!state.invitecode) {
    //   setAlertMessage("Please fill the invite code.");
    //   setAlerts(true);
    //   return false; // Stop validation and show specific error
    // }
    // You might add more specific invite code validation (e.g., format) here
    // if (state.invitecode && !isValidInviteCode(state.invitecode)) { // Placeholder for a hypothetical validation
    //     setAlertMessage("Invalid invite code format.");
    //     setAlerts(true);
    //     return false;
    // }

    setErrors(newErrors);
    return valid;
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

  // const handleSubmit = async () => {
  //   // Check if critical fields are empty or invalid first
  //   if (!validateForm()) {
  //     // validateForm will set the alert message if fields are empty/invalid
  //     return;
  //   }

  //   // Then, check the checkbox separately
  //   if (!isChecked) {
  //     setAlertMessage("You must agree to the Privacy Agreement");
  //     setAlerts(true);
  //     return;
  //   }

  //   // If all client-side validations pass, dispatch the register action
  //   dispatch(register(state)).then((res) => {
  //     if (res.payload?.status) {
  //       setAlertSuccess(true);
  //       setAlertMessage(successMessage || "Registration successful!"); // Set success message for the popup
  //       navigate("/");
  //       localStorage.setItem("topup", true);
  //       localStorage.setItem("topup22", true);
  //     } else {
  //       // If API returns an error, display it
  //       setAlertMessage(errorMessage || "Registration failed. Please check your details and try again."); // Fallback message
  //       setAlerts(true); // Show error alert if registration fails from API
  //     }
  //   }).catch(error => {
  //       // Catch any network or uncaught errors from the dispatch
  //       console.error("Registration dispatch error:", error);
  //       setAlertMessage("An unexpected error occurred during registration.");
  //       setAlerts(true);
  //   });
  // };

  const handleSubmit = async () => {
    console.log("Submitting form with state:", state); // Check what's being sent

    if (!validateForm()) return;
    if (!isChecked) {
      setAlertMessage("You must agree to the Privacy Agreement");
      setAlerts(true);
      return;
    }

    console.log("Dispatching register action...");
    dispatch(register(state))
      .then((res) => {
        console.log("API Response:", res); // Check the full response
        if (res.payload?.status) {
          setAlertSuccess(true);
          setAlertMessage(successMessage || "Registration successful!");
          navigate("/");
          localStorage.setItem("topup", true);
          localStorage.setItem("topup22", true);
        } else {
          console.log("Registration failed:", res.payload);
          setAlertMessage(
            errorMessage ||
              "Registration failed. Please check your details and try again.",
          );
          setAlerts(true);
        }
      })
      .catch((error) => {
        console.error("Registration error:", error);
        setAlertMessage("An unexpected error occurred during registration.");
        setAlerts(true);
      });
  };

  useEffect(() => {
    // Set invite code and country code on initial load
    setState((prevState) => ({
      ...prevState,
      invitecode: code || "", // Ensure it's not null
      ccode: ccode,
    }));

    // Timer for hiding alerts
    const timer = setTimeout(() => {
      setAlerts(false);
      setAlertSuccess(false);
      setAlertMessage(""); // Clear the alert message after hiding
    }, 2000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, [successMessage, errorMessage, alerts, alertSuccess, code, ccode]);

  return (
    <>
      <CustomeNavbar logo="logo" />
      <div className="nav-bg px-4 pb-10 pt-3">
        <h1 className="heading-h1">Register</h1>
        <p className="fs-sm mt-2">Please register by phone number or email</p>
      </div>
      <div className="container-section">
        <div className="container-section mt-3">
          <div className="flex flex-col justify-center items-center">
            <span>
              <svg className="svg-icon icon-phone color-l text-2xl">
                <use href="#icon-phone"></use>
              </svg>
            </span>
            <h3 className="heading-h3 text-base font-semibold mt-1 leading-7 color-l border-b-2 w-full text-center border-[var(--bg-color-l)]">
              Register your phone
            </h3>
          </div>

          <form className="mt-5">
            <div>
              <div className="flex items-center">
                <span>
                  <svg className="svg-icon icon-phone color-l text-2xl">
                    <use href="#icon-phone"></use>
                  </svg>
                </span>
                <label htmlFor="" className="font-medium ms-1 text-white">
                  Phone number
                </label>
              </div>
              <div className="mt-3 flex justify-between">
                <div className="w-[24%] flex items-center justify-center font-bold text-sm gray-color nav-bg rounded-xl p-2">
                  +91 <MdKeyboardArrowDown className="ms-1 text-lg" />
                </div>

                <input
                  type="number"
                  className="w-[75%]  nav-bg border border-[--bgbody] rounded-lg px-4 py-3 focus:[var(--grey-100)] ps-6 flex items-center focus:border focus:outline-none placeholder:text-sm placeholder:text-[var(--grey-200)] placeholder:font-medium"
                  placeholder="Please enter the phone number"
                  name="username"
                  onChange={inputHandle}
                  value={state.username}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center">
                <span>
                  <svg className="svg-icon icon-editPswIcon passwordInput__container-label__icon passwordInput__container-label__icon color-l text-2xl">
                    <use href="#icon-editPswIcon"></use>
                  </svg>
                </span>
                <label htmlFor="" className="font-medium ms-1 text-white">
                  Set Password
                </label>
              </div>
              <div className="mt-3 flex justify-between relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="pwd"
                  onChange={inputHandle}
                  value={state.pwd}
                  className="w-full nav-bg border border-[--bgbody] rounded-lg px-4 py-3 focus:[var(--grey-100)] ps-6 flex items-center focus:border focus:outline-none placeholder:text-sm placeholder:text-[var(--grey-200)] placeholder:font-medium"
                  placeholder="Set password"
                />
                <span
                  onClick={toggleShowPassword}
                  className="absolute right-4 text-lg top-3 text-white cursor-pointer"
                >
                  {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </span>
              </div>
              {errors.pwd && (
                <p className="text-red-500 text-xs mt-1">{errors.pwd}</p>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center">
                <span>
                  <svg className="svg-icon icon-editPswIcon passwordInput__container-label__icon passwordInput__container-label__icon color-l text-2xl">
                    <use href="#icon-editPswIcon"></use>
                  </svg>
                </span>
                <label htmlFor="" className="font-medium ms-1 text-white">
                  Confirm Password
                </label>
              </div>
              <div className="mt-3 flex justify-between relative">
                <input
                  type={showPassword2 ? "text" : "password"}
                  name="cpass"
                  onChange={inputHandle}
                  value={state.cpass}
                  className="w-full nav-bg border border-[--bgbody] focus:[var(--grey-100)] rounded-lg px-4 py-3 ps-6 flex items-center focus:border focus:outline-none placeholder:text-sm placeholder:text-[var(--grey-200)] placeholder:font-medium"
                  placeholder="Confirm password"
                />
                <span
                  onClick={toggleShowPassword2}
                  className="absolute right-4 text-lg top-3 text-white cursor-pointer"
                >
                  {showPassword2 ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </span>
              </div>
              {errors.cpass && (
                <p className="text-red-500 text-xs mt-1">{errors.cpass}</p>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center">
                <span>
                  <svg data-v-e26f70e7="" className="svg-icon icon-invitation">
                    <use href="#icon-invitation"></use>
                  </svg>
                </span>
                <label htmlFor="" className="font-medium ms-1 text-white">
                  Invite code
                </label>
              </div>
              <div className="mt-3 flex justify-between">
                <input
                  type="text"
                  className="w-full nav-bg border border-[--bgbody] rounded-lg px-4 py-3 focus:[var(--grey-100)] ps-6 flex items-center focus:border focus:outline-none placeholder:text-sm placeholder:text-[var(--grey-200)] placeholder:font-medium"
                  placeholder="Please enter the invitation code"
                  name="invitecode"
                  onChange={inputHandle}
                  value={state.invitecode}
                />
              </div>
            </div>

            <div className="flex items-center mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="hidden peer"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center peer-checked:border-[var(--bg-color-l)] peer-checked:bg-[var(--bg-color-l)]">
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
                <span className="text-whites ms-2 mr-2 fs-sm cursor-pointer">
                  I have read and agree
                </span>{" "}
                <Link to="/main/About/RiskDisclosure" className="color-red-200">
                  [Privacy Agreement]
                </Link>
              </label>
            </div>
          </form>

          <button
            className="blue-linear flex justify-center text-white text-lg w-80 m-auto font-semibold text-center rounded-full p-1 py-2 mt-5 tracking-widest"
            disabled={loader}
            onClick={handleSubmit}
          >
            Register
          </button>

          <button
            className="border w-80 flex color-l font-semibold justify-center items-center border-[var(--bg-color-l)] m-auto rounded-full p-1 py-2 mt-6"
            onClick={() => navigate("/login")}
          >
            <span className="text-sm font-normal mr-2 text-white tracking-widest">
              I have an account
            </span>{" "}
            <span className="tracking-widest font-bold text-lg">Login</span>
          </button>
        </div>
      </div>

      {/* Success message popup */}
      <div className={`place-bet-popup ${alertSuccess ? "active" : ""}`}>
        <div className="text-sm">{alertMessage}</div>
      </div>

      {/* Error message popup */}
      <AlertCopmponent alertPopup={alerts} message={alertMessage} />
    </>
  );
};

export default Register;
