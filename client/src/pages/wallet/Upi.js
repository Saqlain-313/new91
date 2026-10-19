import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomeNavbar from "../../components/CustomeNavbar";
import { getBank } from "../../store/reducer/userReducer";
import { useDispatch, useSelector } from "react-redux";
import EmptyData from "../activity/EmptyData";
import EmptyImg from "../../assets/empty.png";

const Upi = () => {
  const navigate = useNavigate();
  const [upiData, setUpiData] = useState(null);
  const dispatch = useDispatch();
  const { addBankData, withdrawHistoryData } = useSelector(
    (state) => state.user
  );
  useEffect(() => {
    dispatch(getBank());
    try {
      const savedUpi = localStorage.getItem("upiData");
      if (savedUpi) {
        setUpiData(JSON.parse(savedUpi));
      }
    } catch (error) {
      console.error("Failed to parse UPI data from localStorage:", error);
      setUpiData(null);
    }
  }, []);

  return (
    <div className="bgs-body min-h-screen flex flex-col">
      <CustomeNavbar name="UPI payment method" bgClass="bg-light" />

      <div className="flex-1 flex flex-col items-start justify-left p-4">
        {!addBankData?.upi?.length > 0 ? (
          <div className="flex flex-col items-center justify-center w-full mt-16">
            <img
              src={EmptyImg}
              alt=""
              className="w-56 flex items-center justify-center m-auto invert"
            />
            {/* <EmptyData /> */}
            <p className="text-gray-400">No payment method</p>
          </div>
        ) : (
          <div className="bg-body min-h-[200px] rounded-lg px-2 pt-7 pb-12 relative">
            {/* Header Row with logo and tick */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center flex-grow">
                {/* UPI Logo */}
                <img
                  src="https://i.ibb.co/fzBy6hcq/upi-3f9883de.webp"
                  alt="UPI Logo"
                  className="w-20 mr-3 mt-1 flex-shrink-0"
                />
                <span className="text-2xl font-bold text-black">
                  UPI Recipient
                </span>
              </div>
              <div className="bg-cyan-400 rounded-full w-10 h-10 flex items-center justify-center mr-1 mt-1 flex-shrink-0 ml-16">
                <svg width="28" height="28" viewBox="0 0 28 28">
                  <circle cx="14" cy="14" r="14" fill="#22d3ee" />
                  <polyline
                    points="9 15 13 19 19 10"
                    fill="none"
                    stroke="#222"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </div>
            <hr className="border-t border-gray-200 mb-4" />

            {/* Data Section */}
            <div className="text-left mt-3 ml-1">
              <div className="mb-2 text-gray-500 text-base font-medium">
                {addBankData?.upi_name ?? "UPI Name"}
              </div>
              <div className="text-gray-500 text-base">
                {addBankData?.upi ?? "upi@id"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Sticky bottom button */}
      <div className="mx-1 pb-1">
        <button
          className="w-full bg-yellow-500 p-3 text-white font-bold rounded-lg"
          onClick={() => navigate("/wallet/Withdraw/AddUPI")}
        >
          Add payment method
        </button>
      </div>
    </div>
  );
};

export default Upi;
