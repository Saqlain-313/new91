import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { commissiondatas } from "../../store/reducer/promotionReducer";

import CopyCopmponent from "../../components/CopyCopmponent";
import Calendar from "../../Calender";
import CustomeNavbar from "../../components/CustomeNavbar";
const CommissionDetails = () => {
  const { commissiondatasData } = useSelector((state) => state.promotion);
  const dispatch = useDispatch();
  const [copyPopup, setCopyPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const calculateTotals = async (data) => {
    if (!Array.isArray(data)) {
      return { userLevel: 0, totalBetAmount: 0, totalCommsionsAmount: 0 };
    }
    return data.reduce(
      (totals, item) => {
        totals.userLevel += item.level || 0;
        totals.totalBetAmount += parseFloat(item.amount) || 0;
        totals.totalCommsionsAmount += parseFloat(item.commission) || 0;
        return totals;
      },
      { userLevel: 0, totalBetAmount: 0, totalCommsionsAmount: 0 }
    );
  };

  const filterDataByDate = async (data, date) => {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.filter((item) => {
      if (item.date && item.date !== 0) {
        const itemDate = new Date(item.date).toISOString().split("T")[0];
        return itemDate === date;
      }
      return false;
    });
  };

  const [totals, setTotals] = useState({
    userLevel: 0,
    totalBetAmount: 0,
    totalCommsionsAmount: 0,
  });
  // //console.log("dfff",totals)
  useEffect(() => {
    const fetchTotals = async () => {
      if (commissiondatasData && commissiondatasData.length > 0) {
        const filteredData = selectedDate
          ? await filterDataByDate(commissiondatasData, selectedDate)
          : commissiondatasData;
        const calculatedTotals = await calculateTotals(filteredData);
        setTotals(calculatedTotals);
      }
    };

    fetchTotals();
  }, [selectedDate, commissiondatasData]);

  useEffect(() => {
    dispatch(commissiondatas());
  }, [dispatch]);

  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 since months are zero-based
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const currentDate = getCurrentDate();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };
  return (
    <>
      <CustomeNavbar name="Commission details" />
      <div className="container-section z-10 sticky top-16">
        <div className="grid grid-cols-12 gap-2 mt-2">
          <div className="col-span-12">
            <Calendar
              onDateSelect={handleDateSelect}
              onValueChange={handleDateSelect}
            />
          </div>
        </div>
      </div>

      <div className="container-section mt-5">
        <div className="bg-light rounded-md mt-3 pb-7 px-3 pt-1">
          <p className="fs-sm text-whites py-1"> Settlement successful</p>
          <p className="fs-sm text-whites py-1"> date</p>
          <p className="fs-sm text-whites py-1">
            {" "}
            The commission has been automatically credited your balance
          </p>
          <hr className="border-color-slat mt-1" />
          <div className="mt-3 flex justify-between items-center gray-linear text-black fs-sm p-2">
            <span className="fs-sm">Number of bettors</span>
            <span className="fs-sm  text-black">{totals.userLevel}</span>
          </div>

          <div className=" flex justify-between gray-linear items-center mt-3 text-black fs-sm p-2">
            <span className="fs-sm">Bet Amount</span>
            <span className="fs-sm text-black">
              {totals.totalBetAmount.toFixed(2)}
            </span>
          </div>
          <div className=" flex justify-between gray-linear items-center mt-3 text-black fs-sm p-2">
            <span className="fs-sm">Commission payout</span>
            <span className="fs-sm color-yellow-200">
              {totals.totalCommsionsAmount.toFixed(2)}
            </span>
          </div>
          <div className=" flex justify-between gray-linear items-center mt-3 text-black fs-sm p-2">
            <span className="fs-sm">Time</span>
            <span className="fs-sm  text-black">
              {selectedDate ? selectedDate : currentDate}
            </span>
          </div>
        </div>
      </div>

      <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />
    </>
  );
};

export default CommissionDetails;
