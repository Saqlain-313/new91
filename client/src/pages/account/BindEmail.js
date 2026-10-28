import { useEffect, useState } from "react";

import { MdVerifiedUser } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import CustomeNavbar from "../../components/CustomeNavbar";
import ServiceRotate from "../../components/ServiceRotate";
import { emailotp, emailsubmit } from "../../store/reducer/authReducer";

const BindEmail = () => {
  const { loader } = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [successMessage, setsuccessMessage] = useState("");
  const [Alerts, setAlerts] = useState(null);
  const dispatch = useDispatch();

  const handleOtp = async () => {
    dispatch(emailotp(email)).then((res) => {
      if (res.payload.status) {
        setAlerts(true);
        setsuccessMessage(res.payload.message);
        setTimeout(() => {
          setAlerts(false);
        }, 2000);
      } else {
        setAlerts(true);
        setsuccessMessage(res.payload.message);
        setTimeout(() => {
          setAlerts(false);
        }, 2000);
      }
    });
  };

  const submit = async () => {
    dispatch(emailsubmit({ otp, email })).then((res) => {
      if (res.payload.status) {
        setAlerts(true);
        setsuccessMessage(res.payload.message);
        setTimeout(() => {
          setAlerts(false);
        }, 2000);
      } else {
        setAlerts(true);
        setsuccessMessage(res.payload.message);
        setTimeout(() => {
          setAlerts(false);
        }, 2000);
      }
    });
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loader]);

  return (
    <>
      <CustomeNavbar name="Bind mainbox" />
      <ServiceRotate />
      <div className="container-section">
        <form action="" className="mt-10">
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
                className="w-full  nav-bg border border-[--bgbody] focus:[var(--grey-100)] rounded-lg p-2 py-2  ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-[var(--grey-200)] placeholder:font-medium"
                placeholder="Please enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center ">
              <span>
                <MdVerifiedUser className="color-l text-2xl" />
              </span>
              <label htmlFor="" className="font-medium ms-1 text-whites">
                Verification Code
              </label>
            </div>
            <div className="mt-3 flex justify-between relative">
              <input
                type="text"
                className="w-full  nav-bg border border-[--bgbody] focus:[var(--grey-100)] rounded-lg p-2 py-3  ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-[var(--grey-200)] placeholder:font-medium"
                placeholder="Enter the confirmation code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              {loader ? (
                <span className="absolute blue-linear right-3 top-2 text-white cursor-pointer text-sm px-6 py-2 rounded-full">
                  Wait
                </span>
              ) : (
                <span
                  className="absolute blue-linear right-3 top-2  text-white cursor-pointer text-sm px-6 py-2 rounded-full"
                  onClick={handleOtp}
                >
                  Send
                </span>
              )}
            </div>
          </div>
        </form>
        <button
          className="blue-linear flex justify-center  text-xl  w-full  text-white m-auto font-bold text-center  rounded-full p-2 px-2 mt-52 tracking-[3px]"
          onClick={submit}
        >
          Bind
        </button>
      </div>

      <div
        className={`place-bet-popup absolute top-[40%] z-50 ${
          Alerts ? "active" : ""
        }`}
      >
        <div className="text-sm">{successMessage} </div>
      </div>
    </>
  );
};

export default BindEmail;
