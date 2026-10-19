import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
import { wingoHistory } from "../../store/reducer/gameReducer";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineSmallDash } from "react-icons/ai";
import { FaRegDotCircle } from "react-icons/fa";
import { MdSportsSoccer } from "react-icons/md";
import CustomeNavbar from "../../components/CustomeNavbar";

const GameStatistics = () => {
  const [activeTabs, setActiveTabs] = useState("today");

  const { wingoHistoryData } = useSelector((state) => state.game);
  const dispatch = useDispatch();

  const parseDate = (dateString) => {
    const date = new Date(dateString);
    // Ignore time by resetting hours, minutes, seconds, and milliseconds
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Helper function to get the start of the day
  const startOfDay = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Helper function to get the start of the week (assuming week starts on Sunday)
  const startOfWeek = (date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    return startOfDay(start);
  };

  // Helper function to get the start of the month
  const startOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);

  // Get today's date
  const today = startOfDay(new Date());

  // Get yesterday's date
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Get the start of this week
  const weekStart = startOfWeek(new Date());

  // Get the start of this month
  const monthStart = startOfMonth(new Date());

  // Filter data based on a date range
  const filterData = (gameslist, periodStart, periodEnd = new Date()) => {
    return gameslist
      .filter((game) => {
        const gameDate = parseDate(game.today);
        return gameDate >= periodStart && gameDate < periodEnd;
      })
      .reduce(
        (acc, game) => {
          acc.idCount += 1;
          acc.getSum += parseFloat(game.get);
          acc.amountSum += parseFloat(game.money);
          return acc;
        },
        { idCount: 0, getSum: 0, amountSum: 0 }
      );
  };

  let todayData, yesterdayData, weekData, monthData;
  if (Array.isArray(wingoHistoryData?.gameslist)) {
    // Filter today's data
    todayData = filterData(wingoHistoryData?.gameslist, today);

    // Filter yesterday's data
    yesterdayData = filterData(wingoHistoryData?.gameslist, yesterday, today);

    // Filter this week's data
    weekData = filterData(wingoHistoryData?.gameslist, weekStart);

    // Filter this month's data
    monthData = filterData(wingoHistoryData?.gameslist, monthStart);
  }

  //console.log("yesterdayData", yesterdayData);

  useEffect(() => {
    let typeid1 = 15;
    dispatch(wingoHistory({ typeid1 }));
  }, [dispatch]);

  const handle = () => {
    window.history.back();
  };
  return (
    <>
      <CustomeNavbar name="Game statistics" />

      <div className="container-section mt-5">
        <div className="flex items-center justify-between">
          <button
            className={`${
              activeTabs == "today"
                ? "blue-linear font-bold text-white"
                : " gray-50 bg-body"
            }  rounded-full p w-[24%] heading-h4  p-1 flex items-center justify-center `}
            onClick={() => setActiveTabs("today")}
          >
            Today
          </button>
          <button
            className={`${
              activeTabs == "yesterday"
                ? "blue-linear font-bold text-white"
                : "bg-body gray-50"
            }  rounded-full p w-[24%] heading-h4  p-1  flex items-center justify-center`}
            onClick={() => setActiveTabs("yesterday")}
          >
            Yesterday
          </button>
          <button
            className={`${
              activeTabs == "this-week"
                ? "blue-linear font-bold text-white"
                : "bg-body gray-50"
            }  rounded-full p w-[24%] heading-h4  p-1  flex items-center justify-center`}
            onClick={() => setActiveTabs("this-week")}
          >
            This week
          </button>
          <button
            className={`${
              activeTabs == "this-month"
                ? "blue-linear font-bold text-white"
                : "bg-body gray-50"
            }  rounded-full p w-[24%] heading-h4  p-1  flex items-center justify-center`}
            onClick={() => setActiveTabs("this-month")}
          >
            This month
          </button>
        </div>

        {activeTabs == "today" && (
          <div>
            <div className="bg-body rounded-md mt-3 flex justify-center items-center flex-col h-32">
              <h3 className="text-[22.4px] font-bold color-yellow-200">
                ₹{todayData?.amountSum?.toFixed(2)}
              </h3>
              <p className="text-base gray-100">Total bet</p>
            </div>
            {todayData?.idCount > 0 && (
              <div className="bg-body rounded-md p-4 mt-3">
                <h2 className="flex items-center text-base font-bold text-whites">
                  <MdSportsSoccer className="text-blue text-2xl mr-1 mb-1" />
                  lottery
                </h2>

                <ul className="">
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="text-blue  rounded-full fs-sm mr-1 border-b" />
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 text-blue fs-sm" />
                      </div>
                      <p className="gray-100 heading-h4 ">Total bet </p>
                    </div>
                    <span className=" heading-h4 text-whites">
                      ₹{Number(todayData?.amountSum)?.toFixed(2)}
                    </span>
                  </li>
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="text-blue  rounded-full fs-sm mr-1 border-b" />
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 text-blue fs-sm" />
                      </div>
                      <p className="gray-100 heading-h4 ">Number of bets</p>
                    </div>
                    <span className=" heading-h4  text-whites">
                      {todayData?.idCount}
                    </span>
                  </li>
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="text-blue  rounded-full fs-sm mr-1 border-b" />
                      </div>
                      <p className="gray-100 heading-h4 ">Winning amount</p>
                    </div>
                    <span className=" heading-h4  color-l">
                      ₹{Number(todayData?.getSum)?.toFixed(2)}
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
        {activeTabs == "yesterday" && (
          <div>
            <div className="bg-body rounded-md mt-3 flex justify-center items-center flex-col h-32">
              <h3 className="text-[22.4px] font-bold color-yellow-200">
                ₹{yesterdayData?.amountSum?.toFixed(2)}
              </h3>
              <p className="text-base gray-100">Total bet</p>
            </div>
            {yesterdayData?.idCount > 0 && (
              <div className="bg-body rounded-md p-4 mt-3">
                <h2 className="flex items-center text-base font-bold text-whites">
                  <MdSportsSoccer className="text-blue text-2xl mr-1 mb-1" />
                  lottery
                </h2>

                <ul className="">
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="text-blue  rounded-full fs-sm mr-1 border-b" />
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 text-blue fs-sm" />
                      </div>
                      <p className="gray-100 heading-h4 ">Total bet </p>
                    </div>
                    <span className=" heading-h4 text-whites">
                      ₹{Number(yesterdayData?.amountSum)?.toFixed(2)}
                    </span>
                  </li>
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="text-blue  rounded-full fs-sm mr-1 border-b" />
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 text-blue fs-sm" />
                      </div>
                      <p className="gray-100 heading-h4 ">Number of bets</p>
                    </div>
                    <span className=" heading-h4  text-whites">
                      {yesterdayData?.idCount}
                    </span>
                  </li>
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="text-blue  rounded-full fs-sm mr-1 border-b" />
                      </div>
                      <p className="gray-100 heading-h4 ">Winning amount</p>
                    </div>
                    <span className=" heading-h4  color-l">
                      ₹{Number(yesterdayData?.getSum)?.toFixed(2)}
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
        {activeTabs == "this-week" && (
          <div>
            <div className="bg-body rounded-md mt-3 flex justify-center items-center flex-col h-32">
              <h3 className="text-[22.4px] font-bold color-yellow-200">
                ₹{weekData?.amountSum?.toFixed(2)}
              </h3>
              <p className="text-base gray-100">Total bet</p>
            </div>
            {weekData?.idCount > 0 && (
              <div className="bg-body rounded-md p-4 mt-3">
                <h2 className="flex items-center text-base font-bold text-whites">
                  <MdSportsSoccer className="text-blue text-2xl mr-1 mb-1" />
                  lottery
                </h2>

                <ul className="">
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="text-blue  rounded-full fs-sm mr-1 border-b" />
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 text-blue fs-sm" />
                      </div>
                      <p className="gray-100 heading-h4 ">Total bet </p>
                    </div>
                    <span className=" heading-h4 text-whites">
                      ₹{Number(weekData?.amountSum)?.toFixed(2)}
                    </span>
                  </li>
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="text-blue  rounded-full fs-sm mr-1 border-b" />
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 text-blue fs-sm" />
                      </div>
                      <p className="gray-100 heading-h4 ">Number of bets</p>
                    </div>
                    <span className=" heading-h4  text-whites">
                      {weekData?.idCount}
                    </span>
                  </li>
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="text-blue  rounded-full fs-sm mr-1 border-b" />
                      </div>
                      <p className="gray-100 heading-h4 ">Winning amount</p>
                    </div>
                    <span className=" heading-h4  color-l">
                      ₹{Number(weekData?.getSum)?.toFixed(2)}
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
        {activeTabs == "this-month" && (
          <div>
            <div className="bg-body rounded-md mt-3 flex justify-center items-center flex-col h-32">
              <h3 className="text-[22.4px] font-bold color-yellow-200">
                ₹{monthData?.amountSum?.toFixed(2)}
              </h3>
              <p className="text-base gray-100">Total bet</p>
            </div>
            {monthData?.idCount > 0 && (
              <div className="bg-body rounded-md p-4 mt-3">
                <h2 className="flex items-center text-base font-bold text-whites">
                  <MdSportsSoccer className="text-blue text-2xl mr-1 mb-1" />
                  lottery
                </h2>

                <ul className="">
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="text-blue rounded-full fs-sm mr-1 border-b" />
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 text-blue fs-sm" />
                      </div>
                      <p className="gray-100 heading-h4 ">Total bet </p>
                    </div>
                    <span className=" heading-h4 text-whites">
                      ₹{Number(monthData?.amountSum)?.toFixed(2)}
                    </span>
                  </li>
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="text-blue  rounded-full fs-sm mr-1 border-b" />
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 text-blue fs-sm" />
                      </div>
                      <p className="gray-100 heading-h4 ">Number of bets</p>
                    </div>
                    <span className=" heading-h4  text-whites">
                      {monthData?.idCount}
                    </span>
                  </li>
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="text-blue  rounded-full fs-sm mr-1 border-b" />
                      </div>
                      <p className="gray-100 heading-h4 ">Winning amount</p>
                    </div>
                    <span className=" heading-h4  color-l">
                      ₹{Number(monthData?.getSum)?.toFixed(2)}
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default GameStatistics;
