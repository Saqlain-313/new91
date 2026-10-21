import { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import CustomeNavbar from "../../components/CustomeNavbar";
import {
  notification,
  notificationDelete,
  updatemessage,
} from "../../store/reducer/activityReducer";

const Notification = () => {
  const dispatch = useDispatch();
  const { notificationData } = useSelector((state) => state.activity);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [notificationToDeleteId, setNotificationToDeleteId] = useState(null);

  const handleDeleteConfirmation = (id) => {
    setNotificationToDeleteId(id);
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    if (notificationToDeleteId) {
      dispatch(notificationDelete(notificationToDeleteId)).then((res) => {
        if (res?.payload?.status) {
          dispatch(notification());
        }
        setShowDeletePopup(false);
        setNotificationToDeleteId(null);
      });
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setNotificationToDeleteId(null);
  };

  useEffect(() => {
    dispatch(notification());
    dispatch(updatemessage());
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showDeletePopup ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showDeletePopup]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getMessageByDetails = (details, timestamp) => {
    const formattedTime = formatTimestamp(timestamp);
    switch (details) {
      case "KHATA RECHARGE":
        return "Congratulations on your successful recharge! Thank you for your trust and support on our platform. We wish you happy gaming and great profits! ₹100 has been credited to your account.";
      case "LOGIN JANKAARI":
        return `Your account was recently logged in at ${formattedTime}. If you have any questions, please contact our online customer service for assistance! We wish you enjoyable gaming and great profits!`;
      case "KHAATE SE NIKAALEN":
        return "Your withdrawal request has been successfully processed by the finance department. Please verify if the amount has been received. If you have any questions, please contact our online customer service for help.";
      case "Nikaasi ke liye aave...":
        return "Your withdrawal request has been approved by the finance department. We will process your payment as soon as possible. Please wait patiently. Thank you.";
      case "SAIN AP KAREN":
        return "Congratulations on your successful registration. You are now a member and we will serve you wholeheartedly! We offer many exciting games - this is a successful gaming platform. Try our specially developed lottery games. Enjoy the ultimate gaming experience while connecting with unlimited agents and earning money without leaving home.";
      default:
        return "No specific message available.";
    }
  };

  return (
    <>
      <CustomeNavbar name="Notification" />
      <div className="p-3 font-roboto text-xs ">
        <ul>
          {Array.isArray(notificationData) &&
            notificationData.map((item, i) => (
              <li
                key={i}
                className="relative mt-3 p-3 rounded-lg bg-[#2D2D2D] text-white"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 fill-current text-[#21D9CC]">
                    <use href="#icon-notification" />
                  </svg>
                  <h3 className="text-sm font-semibold">{item.details}</h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTimestamp(item.today)}
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  {getMessageByDetails(item.details, item.today)}
                </p>
                <span
                  className="absolute right-3 top-3 cursor-pointer"
                  onClick={() => handleDeleteConfirmation(item.id)}
                >
                  <FaRegTrashAlt className="text-[#21D9CC] text-base" />
                </span>
              </li>
            ))}
        </ul>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 font-roboto text-sm">
          <div className="w-[300px] bg-[#2d2d2d] rounded-lg overflow-hidden shadow-lg">
            <div className="text-center px-4 pt-4 pb-2">
              <h2 className="text-white text-2xl p-2 font-semibold">Warning</h2>
              <p className="text-gray-300 text-sm pb-2 mt-1">
                Are you sure to delete this message?
              </p>
            </div>
            <div className="flex divide-x divide-gray-700 text-xs font-semibold text-white h-10">
              <button
                onClick={cancelDelete}
                className="w-1/2 bg-[#5c5e6c] text-lg py-2 hover:bg-[#6a6c7a] font-bold rounded-bl-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="w-1/2 bg-[#58dad2] py-2 text-lg text-white hover:bg-[#21D9CC] rounded-br-lg font-bold transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notification;
