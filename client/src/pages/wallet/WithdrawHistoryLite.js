import React, { useState, useEffect } from "react";
import { PiCopySimpleBold } from "react-icons/pi";
import CopyCopmponent from "../../components/CopyCopmponent";
import { useDispatch, useSelector } from "react-redux";
import { withdrawalHistory } from "../../store/reducer/userReducer";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { RiFileCopy2Fill } from "react-icons/ri";
import EmptyData from "../activity/EmptyData";

const WithdrawHistoryLite = () => {
  const { withdrawHistoryData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [copyPopup, setCopyPopup] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const copyToClipCode = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopyPopup(true);
        setTimeout(() => {
          setCopyPopup(false);
        }, 1500);
      })
      .catch((err) => {
        console.error("Failed to copy the text: ", err);
      });
  };

  useEffect(() => {
    dispatch(withdrawalHistory());
    window.scrollTo(0, 0);
  }, [dispatch]);

  // Take only the first 5 items from the withdrawal history data
  const limitedWithdrawData = (withdrawHistoryData || []).slice(0, 5);

  const handleViewMore = () => {
    navigate("/wallet/WithdrawalHistory"); // Redirect to the main withdrawal history page
  };

  return (
    <>
      <div className="flex items-start justify-start mt-5 gap-2 ml-5 text-whites">
        <RiFileCopy2Fill className="text-[#FB5959] size-6" /> Withdraw History
      </div>
      <div className="container-section mt-2 ">
        {limitedWithdrawData?.length > 0 ? (
          limitedWithdrawData.map((item, i) => (
            <div className="bg-body rounded-md pb-7 mb-4 p-2" key={i}>
              <div className="flex justify-between items-center px-2 text-sm py-1 rounded-sm sky-border border-b">
                <span className="text-sm font-bold bg-red-500 p-2 px-4 rounded-md">
                  Withdraw
                </span>
                <span
                  className={`text-sm font-bold p-1 rounded ${
                    item.status === 0
                      ? "color-yellow-200"
                      : item.status === 1
                      ? "color-green"
                      : "color-red-200"
                  }`}
                >
                  {item.status === 0
                    ? "Processing"
                    : item.status === 1
                    ? "Completed"
                    : "Reject"}
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center gray-text text-xs px-2">
                <span className="fs-sm font-medium">Balance</span>
                <span
                  className={`fs-sm font-medium ${
                    item.status === 0
                      ? "color-yellow-200"
                      : item.status === 1
                      ? "color-yellow-200"
                      : "color-yellow-200"
                  }`}
                >
                  {item.type === "BANK CARD"
                    ? `₹${Number(item?.money).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : `$${(Number(item?.money) / 94).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </span>
              </div>

              <div className="flex justify-between items-center mt-3 gray-text text-xs px-2">
                <span className="fs-sm font-medium">Type</span>
                <span className="fs-sm font-medium">{item.type}</span>
              </div>
              <div className="flex justify-between items-center mt-3 gray-text text-xs px-2">
                <span className="fs-sm font-medium">Time</span>
                <span className="fs-sm font-medium">{item.today}</span>
              </div>
              <div className="flex justify-between items-center mt-3 gray-text text-xs px-2">
                <span className="fs-sm font-medium">Order number</span>
                <span className="fs-sm font-medium flex items-center">
                  {item.id_order}{" "}
                  <PiCopySimpleBold
                    className="ms-1 mt-[3px]"
                    onClick={() => copyToClipCode(item.id_order)}
                  />
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 text-whites fs-sm px-3">
                <span className="fs-sm font-medium">Remark</span>
                {item?.remark == 0 && (
                  <span className="fs-sm font-medium flex items-center">
                    {item?.remark == 0 ? "" : item?.remark}
                  </span>
                )}
              </div>
              {item?.remark !== "0" && (
                <div className="rounded-md w-[95%] h-16 border border-color-slat m-2 mt-3 ps-2 fs-sm overflow-hidden font-medium color-yellow-200">
                  <span className="fs-sm font-medium flex items-center">
                    {item.remark}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-400">
            <EmptyData />
          </div>
        )}

        {limitedWithdrawData?.length > 0 && ( // Only show button if there's data
          <button
            onClick={handleViewMore}
            className="blue-linear w-full rounded-full text-black py-2 mt-5 text-lg font-semibold flex justify-center items-center"
          >
            View More
          </button>
        )}
      </div>

      <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />
    </>
  );
};

export default WithdrawHistoryLite;
