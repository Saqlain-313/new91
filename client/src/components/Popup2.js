import React, { useEffect, useState } from "react";
import { RxCrossCircled } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { recharheBonus } from "../store/reducer/userReducer";
import { useDispatch, useSelector } from "react-redux";

const Popup2 = ({ showPopup, onClose }) => {
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate(); // Correct: Declare once
  const { rechargeBonusData, } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(recharheBonus());
  }, [dispatch]);

  // Effect to show topup2 popup on initial page load based on localStorage
  useEffect(() => {
    const shouldShow = shouldShowTopup2OnLoad();
    if (shouldShow) {
      // Initialize isChecked state based on localStorage for the checkbox
      setIsChecked(localStorage.getItem('topup2_hideReminders') === 'true');
    }
  }, []); // Run once on component mount

  // Effect to control body overflow when topup2 popup is active
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showPopup]);

  // Function to check if topup2 reminders should be shown today
  const shouldShowTopup2OnLoad = () => {
    const today = new Date().toDateString();
    const lastReminderDate = localStorage.getItem('topup2_lastReminderDate');
    const hideReminders = localStorage.getItem('topup2_hideReminders') === 'true';

    // Show topup2 if it has not been explicitly hidden for today
    return !(hideReminders && lastReminderDate === today);
  };

  // Handler for the "No more reminders today" checkbox change
  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);

    const today = new Date().toDateString();
    if (checked) {
      // Store current date and set hideReminders to true
      localStorage.setItem("topup2_lastReminderDate", today);
      localStorage.setItem("topup2_hideReminders", "true");
    } else {
      // Clear stored values
      localStorage.removeItem("topup2_lastReminderDate");
      localStorage.removeItem("topup2_hideReminders");
    }
  };

  // Handler for the "Activity" button click - always navigates
  const handleActivityClick = () => {
    navigate("/activity/DepositBouns");
    onClose(); // Close the popup after navigating
  };

  if (!showPopup) {
    return null;
  }

  return (
    <>
      <div className="overlay-section block"></div>
      <div id="popup" className="popup nav-bg z-50">
        {/* Header Section */}
        <div className="header-section bg-popup-nav text-white">
          <h4>Extra first deposit bonus</h4>
          <p className="mt-2">Each account can only receive rewards once</p>
        </div>

        {/* Middle Content */}
        <div className="middle-content-section">
          <ul>
            {rechargeBonusData?.map((item, i) => (
              <li key={i} onClick={() => navigate("/wallet/Recharge")}>
                <div className="first-c">
                  <p className="gray-50">
                    First deposit{" "}
                    <span className="text-[#feaa57]">
                      {" "}
                      {item.recAmount.toLocaleString()}
                    </span>
                  </p>
                  <p className="gray-50">
                    <span className="text-[#feaa57]">
                      +₹{item.bonus.toLocaleString()}.00
                    </span>
                  </p>
                </div>
                <p className="color-gray">
                  Deposit {item.recAmount.toLocaleString()} for the first time
                  in your account and you can receive ₹
                  {(Number(item.recAmount) + Number(item.bonus)).toLocaleString()}
                </p>
                <div className="bottom-c">
                  <div className="slider-box ">
                    0/{item.recAmount.toLocaleString()}
                  </div>
                  <button className="border fs-sm border-[#feaa57]">
                    Deposit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <div>
            <label className="flex items-center">
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
                No more reminders today
              </span>
            </label>
          </div>

          {/* Activity Button */}
          <button
            className="activity blue-linear text-black"
            onClick={handleActivityClick}
          >
            Activity {/* Always display "Activity" */}
          </button>
        </div>

        {/* Close Icon for Topup2 Popup */}
        <span onClick={onClose}>
          <RxCrossCircled className="m-auto flex text-center absolute left-0 right-0 justify-center text-2xl mt-4" />
        </span>
      </div>
    </>
  );
};

export default Popup2;