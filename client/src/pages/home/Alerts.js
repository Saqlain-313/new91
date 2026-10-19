import React, { useState, useEffect } from "react";
import { IoCloseCircleOutline, IoWarningOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { userDetail } from "../../store/reducer/authReducer";

export const Alerts = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Fetch user details on mount
  useEffect(() => {
    dispatch(userDetail());
  }, [dispatch]);

  // Update message and control popup visibility
  useEffect(() => {
    if (
      userInfo?.message &&
      String(userInfo.message).trim() !== "" &&
      userInfo.message !== "0"
    ) {
      setMessage(userInfo.message);
      setShowPopup(true);
    } else {
      setMessage(""); // Clear message when invalid
      setShowPopup(false);
    }
  }, [userInfo?.message]);

  const handleClose = () => {
    setShowPopup(false);
  };

 
  if (!showPopup) return null; // Prevent rendering when not needed

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      {/* Popup Content */}
      <div className="relative bg-white shadow-xl rounded-lg w-80 max-w-md">
        {/* Header */}
        <div className="bg-[#22c55e] flex items-center justify-between text-white py-3 px-6 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <IoWarningOutline className="text-xl" />
            <h2 className="font-semibold text-lg">Warning Messages</h2>
          </div>
          <IoCloseCircleOutline
            className="text-2xl cursor-pointer hover:text-gray-900"
            onClick={handleClose}
          />
        </div>

        {/* Message Body */}
        <div className="p-4 text-center">
          <p className="text-red-500 text-sm mb-4">{message}</p>
          <button
            onClick={handleClose}
            className="bg-[#22c55e]  text-gray-300 hover:text-white px-6 py-2 rounded-md uppercase font-medium transition-colors duration-300"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
