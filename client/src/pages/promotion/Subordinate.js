import React, { useState, useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { newSubordinate } from "../../store/reducer/promotionReducer";
import CustomeNavbar from "../../components/CustomeNavbar";
import EmptyData from "../activity/EmptyData";
export default function Subordinate() {
  const { newSubordinateData } = useSelector((state) => state.promotion);

  const [activeTabs, setActiveTabs] = useState("today");

  const dispatch = useDispatch();

  const filterByDate = (data, activeTabs) => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return data?.filter((item) => {
      const itemDate = new Date(item.today);

      if (activeTabs === "today") {
        return (
          itemDate.getFullYear() === today.getFullYear() &&
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getDate() === today.getDate()
        );
      } else if (activeTabs === "yesterday") {
        return (
          itemDate.getFullYear() === startOfYesterday.getFullYear() &&
          itemDate.getMonth() === startOfYesterday.getMonth() &&
          itemDate.getDate() === startOfYesterday.getDate()
        );
      } else if (activeTabs === "thismonth") {
        return (
          itemDate.getFullYear() === startOfMonth.getFullYear() &&
          itemDate.getMonth() === startOfMonth.getMonth()
        );
      }

      return false; // No filtering if filterType is not matched
    });
  };

  const filteredData = filterByDate(newSubordinateData, activeTabs);

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
      <CustomeNavbar name="New subordinates" />

      <div className="subordinate-record mt-1 container-section">
        <div>
          <div>
            <div className="flex items-center justify-between">
              <button
                className={`${
                  activeTabs == "today"
                    ? "blue-linear text-white"
                    : "bg-light text-[#80849C]"
                }  rounded-lg py-3 w-[33%] text-sm p-2 flex items-center justify-center `}
                onClick={() => setActiveTabs("today")}
              >
                Today
              </button>
              <button
                className={`${
                  activeTabs == "yesterday"
                    ? "blue-linear text-white"
                    : "bg-light text-[#80849C]"
                }  rounded-lg  py-3 w-[30%] text-sm p-2  flex items-center justify-center`}
                onClick={() => setActiveTabs("yesterday")}
              >
                Yesterday
              </button>

              <button
                className={`${
                  activeTabs == "thismonth"
                    ? "blue-linear text-white"
                    : "bg-light text-[#80849C]"
                }  rounded-lg  py-3 w-[30%] text-sm p-2  flex items-center justify-center`}
                onClick={() => setActiveTabs("thismonth")}
              >
                This month
              </button>
            </div>
            {activeTabs === "today" && (
              <div>
                {filteredData?.length > 0 ? (
                  Array.isArray(filteredData) &&
                  filteredData?.map((item, i) => (
                    <div
                      className="bg-light text-[#626678] rounded-md mt-3 pb-7 px-3 pt-1 border-2 border-[#FFF]"
                      key={i}
                    >
                      <div className="mt-3 flex justify-between items-center text-sm">
                        <span className="text-sm font-medium">
                          {formatPhoneNumber(item.phone)}
                        </span>
                        <span className="text-sm font-medium ">
                          UID:{item?.id_user}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3 text-sm">
                        <span className="text-sm font-medium">
                          Direct Subordinate
                        </span>
                        <span className="text-sm font-medium flex items-center">
                          {formatDateString(item.today)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyData />
                )}
              </div>
            )}
            {activeTabs === "yesterday" && (
              <div>
                {filteredData?.length > 0 ? (
                  Array.isArray(filteredData) &&
                  filteredData?.map((item, i) => (
                    <div
                      className="bg-light text-[#626678] rounded-md mt-3 pb-7 px-3 pt-1 border-2 border-[#FFF]"
                      key={i}
                    >
                      <div className="mt-3 flex justify-between items-center text-sm">
                        <span className="text-sm font-medium">
                          {formatPhoneNumber(item.phone)}
                        </span>
                        <span className="text-sm font-medium ">
                          UID:{item?.id_user}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3 text-sm">
                        <span className="text-sm font-medium">
                          Direct Subordinate
                        </span>
                        <span className="text-sm font-medium flex items-center">
                          {formatDateString(item.today)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyData />
                )}
              </div>
            )}
            {activeTabs === "thismonth" && (
              <div>
                {filteredData?.length > 0 ? (
                  Array.isArray(filteredData) &&
                  filteredData?.map((item, i) => (
                    <div
                      className="bg-light text-[#626678] rounded-md mt-3 pb-7 px-3 pt-1 border-2 border-[#FFF]"
                      key={i}
                    >
                      <div className="mt-3 flex justify-between items-center text-sm">
                        <span className="text-sm font-medium">
                          {formatPhoneNumber(item.phone)}
                        </span>
                        <span className="text-sm font-medium ">
                          UID:{item?.id_user}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3 text-sm">
                        <span className="text-sm font-medium">
                          Direct Subordinate
                        </span>
                        <span className="text-sm font-medium flex items-center">
                          {formatDateString(item.today)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyData />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
