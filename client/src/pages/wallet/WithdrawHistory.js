import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { MdDashboard } from "react-icons/md";
import { PiCopySimpleBold } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import wallet from "../../assets/card.png";
import usd from "../../assets/usdt.png";
import Calendar from "../../components/CalenderUpdate";
import CopyCopmponent from "../../components/CopyCopmponent";
import CustomeNavbar from "../../components/CustomeNavbar";
import FilterName from "../../components/FilterName";
import ServiceRotate from "../../components/ServiceRotate";
import { withdrawalHistory } from "../../store/reducer/userReducer";
import TopFilter from "../promotion/TopFilter";

const WithdrawHistory = () => {
  const { withdrawHistoryData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [openAll, setOpenAll] = useState(false);
  const [searchLevel, setSearchLevel] = useState(null);
  const [copyPopup, setCopyPopup] = useState(false);
  const [dataAll, setDataAll] = useState("All");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectTab, setSelectTab] = useState("All");

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

  const handleOpenAll = () => {
    setOpenAll(!openAll);
  };

  const filteredData = (withdrawHistoryData || [])?.filter((item) => {
    const itemDate = new Date(item.today);
    // Reset time components for proper date comparison
    itemDate.setHours(0, 0, 0, 0);

    // Check status filter
    const matchesLevel =
      searchLevel !== null ? item.status === searchLevel : true;

    // Check payment type filter
    const matchesType = selectTab !== "All" ? item.type === selectTab : true;

    // Check date range filter
    let matchesDate = true;
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);

      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = itemDate >= startDate && itemDate <= endDate;
      } else {
        matchesDate = itemDate.getTime() === startDate.getTime();
      }
    }

    return matchesLevel && matchesType && matchesDate;
  });

  const items = [
    { name: "All", level: null },
    { name: "Processing", level: 0 },
    { name: "Completed", level: 1 },
    { name: "Reject", level: 2 },
  ];

  const handleFilterChange = (name, level) => {
    setDataAll(name);
    setSearchLevel(level);
  };

  const handleDateSelect = (dates) => {
    if (dates.length === 0) {
      setDateRange({ startDate: null, endDate: null });
    } else if (dates.length === 1) {
      setDateRange({ startDate: dates[0], endDate: null });
    } else {
      setDateRange({ startDate: dates[0], endDate: dates[1] });
    }
  };

  useEffect(() => {
    dispatch(withdrawalHistory());
    window.scrollTo(0, 0);
  }, [dispatch]);

  const itemss = [
    { name: "All", icon: <MdDashboard /> },
    { name: "BANK CARD", icon: wallet },
    { name: "USDT", icon: usd },
  ];

  const handleActiveName = (name) => {
    setSelectTab(name);
  };

  // Format date for display
  const formatDisplayDate = () => {
    if (dateRange.startDate) {
      const start = new Date(dateRange.startDate);
      const end = dateRange.endDate ? new Date(dateRange.endDate) : start;
      const formatOptions = { year: "numeric", month: "short", day: "numeric" };

      if (start.getTime() === end.getTime()) {
        return start.toLocaleDateString(undefined, formatOptions);
      }
      return `${start.toLocaleDateString(undefined, formatOptions)} - ${end.toLocaleDateString(undefined, formatOptions)}`;
    }
    // return "Select Date Range";
  };

  return (
    <>
      <CustomeNavbar name="Withdraw history" />
      <ServiceRotate />

      <TopFilter items={itemss} onActiveChange={handleActiveName} />

      <FilterName
        items={items}
        onActiveChange={handleFilterChange}
        openAll={openAll}
        setOpenAll={setOpenAll}
      />

      <div className="container-section">
        <div className="grid grid-cols-12 gap-2 mt-2">
          <div
            className="col-span-6 nav-bg flex cursor-pointer justify-between items-center p-2 rounded-md"
            onClick={handleOpenAll}
          >
            <span className="text-base gray-50">{dataAll}</span>
            <span>
              <IoIosArrowDown className="text-base text-whites" />
            </span>
          </div>
          <div className="col-span-6 nav-bg">
            <Calendar
              onDateSelect={handleDateSelect}
              selectedDates={
                dateRange.startDate
                  ? [
                      dateRange.startDate,
                      dateRange.endDate || dateRange.startDate,
                    ]
                  : []
              }
            />
            {/* <div className="text-center text-sm mt-1 text-gray-300">
              {formatDisplayDate()}
            </div> */}
          </div>
        </div>
      </div>

      <div className="container-section mt-5 ">
        {filteredData?.length > 0 ? (
          filteredData.map((item, i) => (
            <div className="nav-bg rounded-md pb-7 mb-4 p-2" key={i}>
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
              <div className="mt-3 flex justify-between items-center gray-text text-sm px-2">
                <span className="text-sm font-medium">Balance</span>
                <span
                  className={`text-sm font-medium ${
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

              <div className="flex justify-between items-center mt-3 gray-text text-sm px-2">
                <span className="text-sm font-medium">Type</span>
                <span className="text-sm font-medium">{item.type}</span>
              </div>
              <div className="flex justify-between items-center mt-3 gray-text text-sm px-2">
                <span className="text-sm font-medium">Time</span>
                <span className="fs-sm font-medium">{item.today}</span>
              </div>
              <div className="flex justify-between items-center mt-3 gray-text text-sm px-2">
                <span className="text-sm font-medium">Order number</span>
                <span className="text-sm font-medium flex items-center">
                  {item.id_order}{" "}
                  <PiCopySimpleBold
                    className="ms-1 mt-[3px]"
                    onClick={() => copyToClipCode(item.id_order)}
                  />
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 text-whites text-sm px-3">
                <span className="text-sm gray-text font-medium">Remark</span>
                {item?.remark == 0 && (
                  <span className="text-sm font-medium flex items-center">
                    {item?.remark == 0 ? "" : item?.remark}
                  </span>
                )}
              </div>
              {item?.remark != "0" && (
                <div className="rounded-md w-[95%] h-16 border border-color-slat m-2 mt-3 ps-2 text-sm overflow-hidden font-medium color-yellow-200">
                  <span className="text-sm font-medium flex items-center">
                    {item.remark}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-400">
            No records found for the selected filters
          </div>
        )}
      </div>

      <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />
    </>
  );
};

export default WithdrawHistory;
