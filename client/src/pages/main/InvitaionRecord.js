import React, { useEffect } from "react";
import {
  newSubordinate,
} from "../../store/reducer/promotionReducer";
import { useDispatch, useSelector } from "react-redux";
import CustomeNavbar from "../../components/CustomeNavbar";

const InvitaionRecord = () => {
  const { newSubordinateData } = useSelector((state) => state.promotion);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(newSubordinate());
  }, []);

  function formatDateString(dateStr) {
    const date = new Date(dateStr);

    const formattedDate =
      date.getUTCFullYear() +
      "-" +
      String(date.getUTCMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getUTCDate()).padStart(2, "0") +
      " " +
      String(date.getUTCHours()).padStart(2, "0") +
      ":" +
      String(date.getUTCMinutes()).padStart(2, "0") +
      ":" +
      String(date.getUTCSeconds()).padStart(2, "0");

    return formattedDate;
  }

  function formatPhoneNumber(phoneNumber) {
 
    const prefix = phoneNumber.slice(0, 3); // '987'
    const suffix = phoneNumber.slice(-3); // '211'

    return `${prefix}****${suffix}`;
  }

  return (
    <>
      <CustomeNavbar name="Invitation Record"/>
      <div className="container-section">
        {Array.isArray(newSubordinateData) &&
          newSubordinateData?.map((item, i) => (
            <div className="bg-body rounded-md mt-3 pb-7 px-3 pt-1" key={i}>
              <div className="mt-3 flex justify-between items-center gray-50 text-sm">
                <span className="text-sm font-medium">
                  {formatPhoneNumber(item.phone)}
                </span>
                <span className="text-sm font-medium ">
                  UID:{item?.id_user}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 text-whites text-sm">
                <span className="text-sm font-medium">Register time</span>
                <span className="text-sm font-medium flex items-center">
                  {formatDateString(item.today)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 text-whites text-sm">
                <span className="text-sm font-medium">Deposit Amount</span>
                <span className="text-sm font-medium flex items-center text-whites">
                  ₹{item.money}
                </span>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default InvitaionRecord;
