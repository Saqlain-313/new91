import { useEffect } from "react";
import { FaRegTrashAlt } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import CustomeNavbar from "../../components/CustomeNavbar";
import {
  notification,
  notificationDelete,
  updatemessage,
} from "../../store/reducer/activityReducer";
import EmptyData from "../activity/EmptyData";

const Notification = () => {
  const dispatch = useDispatch();
  const { notificationData } = useSelector((state) => state.activity);

  const handleDelete = (id) => {
    dispatch(notificationDelete(id)).then((res) => {
      if (res?.payload?.status) {
        dispatch(notification());
      }
    });
  };
  useEffect(() => {
    dispatch(notification());
    dispatch(updatemessage());
    window.scrollTo(0, 0);
  }, []);

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  return (
    <>
      <CustomeNavbar name="Notification" />
      <div className="container-section">
        <ul>
          {notificationData?.length > 0 ? (
            Array.isArray(notificationData) &&
            notificationData?.map((item, i) => (
              <li className="p-3 bg-body relative mt-4 rounded" key={i}>
                <div className="flex items-center">
                  {/* <MdEmail className="text-slate-500 mr-1" /> */}
                  <svg
                    data-v-8084bf25=""
                    className="icon-notifications text-[#00e688] svg w-7 h-7"
                  >
                    <use href="#icon-notifications"></use>
                  </svg>
                  <h3 className="heading-h3 font-bold text-whites">
                    LOGIN NOTIFICATION
                  </h3>
                </div>
                <p className="fs-sm text-[#6E7277]">
                  {formatTimestamp(item.today)}
                </p>
                <p className="fs-sm gray-text mt-3 font-normal">
                  Your account has just been logged in at{" "}
                  {formatTimestamp(item.today)}. If you have any questions,
                  please contact online customer service for consultation! I
                  wish you happy gaming and lots of profits!
                </p>
                <span
                  className="absolute  right-3  top-3 cursor-pointer"
                  onClick={() => handleDelete(item.id)}
                >
                  <FaRegTrashAlt className="color-blue-500 text-lg text-[#f95959]" />
                </span>
              </li>
            ))
          ) : (
            <EmptyData />
          )}
        </ul>
      </div>
    </>
  );
};

export default Notification;
