import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AiFillSound } from "react-icons/ai";
import CustomeNavbar from "../../components/CustomeNavbar";
import { notificationgets } from "../../store/reducer/activityReducer";
const Notifications = () => {
  const { notificationgetData } = useSelector((state) => state.activity);
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(notificationgets());
  }, [dispatch]);

  return (
    <>
      <CustomeNavbar name="Notification" />

      <div className="container-section mt-5">
        {Array.isArray(notificationgetData) &&
          notificationgetData?.map((item, i) => (
            <div className="nav-bg p-2 flex rounded-md mb-2">
              <div>
                <AiFillSound className="text-[#21D9CC] text-lg mt-1" />
              </div>
              <div className="ms-1">
                <h3 className="heading-h3 text-white">{item.heading}</h3>
                <p className="text-xs gray-text mt-1">{item.message}</p>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default Notifications;
