import React, { useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import debounce  from "lodash/debounce";
import Coins from "../../assets/coins.png";
import { attendance } from "../../store/reducer/activityReducer";
import CustomeNavbar from "../../components/CustomeNavbar";
import EmptyData from "./EmptyData";
const AttendanceHistory = () => {
  const { attendance_history } = useSelector(
    (state) => state.activity
  );
  const dispatch = useDispatch();
  const debounced = useCallback(
    debounce(() => {
      dispatch(attendance());
    }, 500),
    [dispatch]
  );

  useEffect(() => {
    debounced();
  }, [debounced]);


  return (
    <>
     
        <CustomeNavbar name="Attendance History"/>
      <div className="container-section">
        {attendance_history?.length>0?(Array.isArray(attendance_history) &&
          attendance_history?.map((item, i) => (
            <div className="nav-bg rounded-md mt-3">
              <div className="flex justify-between items-center p-2 ">
                <div>
                  <p className="text-[14px] gray-text font-medium">
                    Continuous attendance day
                  </p>
                  <p className="fs-sm text-whites">{item.date}</p>
                </div>
                <div className="flex items-center rounded-2xl color-yellow-bg-200 p-1 w-[40%]">
                  <img src={Coins} alt="" className="w-5" />
                  <p className=" text-[14px]  text-center flex m-auto font-medium">
                    {item.amount}
                  </p>
                </div>
              </div>
            </div>
          ))):(

            <EmptyData/>
          )}
      </div>
    </>
  );
};

export default AttendanceHistory;
