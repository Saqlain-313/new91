import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { MdDashboard } from "react-icons/md";
import { PiCopySimpleBold } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import wallet from "../../assets/e-wallet.png";
import paytm from "../../assets/paytm.jpg";
import upi from "../../assets/upi.png";
import usd from "../../assets/usdt.png";
import CalendarUpdate from "../../components/CalenderUpdate";
import CopyCopmponent from "../../components/CopyCopmponent";
import CustomeNavbar from "../../components/CustomeNavbar";
import FilterName from "../../components/FilterName";
import { rechargeList } from "../../store/reducer/userReducer";
import EmptyData from "../activity/EmptyData";
import TopFilter from "../promotion/TopFilter";

const RechargeHistory = () => {
  const [openAll, setOpenAll] = useState(false);
  const { rechargelistData } = useSelector((state) => state.user);
  const [searchLevel, setSearchLevel] = useState(null);
  const dispatch = useDispatch();
  const [dataAll, setDataAll] = useState("All");
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [copyPopup, setCopyPopup] = useState(false);
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

  const filteredData = rechargelistData?.recharge?.filter((item) => {
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
    { name: "To Be Paid", level: 0 },
    { name: "Complete", level: 1 },
    { name: "Failed", level: 2 },
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
    dispatch(rechargeList());
    window.scrollTo(0, 0);
  }, [dispatch]);

  const itemss = [
    { name: "All", icon: <MdDashboard /> },
    { name: "UPI-QRpay", icon: wallet },
    { name: "Wake UP-APP", icon: paytm },
    { name: "UPI-PayTM", icon: upi },
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
      return `${start.toLocaleDateString(
        undefined,
        formatOptions,
      )} - ${end.toLocaleDateString(undefined, formatOptions)}`;
    }
    // return "Select Date Range";
  };
  return (
    <>
      <CustomeNavbar name="Deposit history" />

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
            className="col-span-6 bg-body flex cursor-pointer justify-between items-center p-2 rounded-md"
            onClick={handleOpenAll}
          >
            <span className="text-sm gray-50" onClick={handleOpenAll}>
              {dataAll}
            </span>
            <span>
              <IoIosArrowDown className="text-sm text-black" />
            </span>
          </div>
          <div className="col-span-6 bg-body">
            <CalendarUpdate
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
          </div>
        </div>
      </div>

      <div className="container-section mt-5">
        {filteredData?.length > 0 ? (
          Array.isArray(rechargelistData?.recharge) &&
          filteredData?.map((item, i) => (
            <div className="bg-body rounded-md pb-3 mb-4 p-2" key={i}>
              <div className="flex justify-between items-center px-2 text-sm py-1 rounded-sm sky-border border-b">
                <span className="text-sm font-medium bg-green-500 p-1 px-4 rounded-md mb-1">
                  Deposit
                </span>
                <span
                  className={`text-sm  p-1 rounded ${
                    item.status === 0
                      ? "text-blue-400 "
                      : item.status === 1
                        ? "text-green-500 "
                        : "text-red-500 "
                  }`}
                >
                  {item.status === 0
                    ? "To Be Paid"
                    : item.status === 1
                      ? "Succeed"
                      : "Failed"}
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center gray-100 text-sm px-2">
                <span className="text-sm font-medium">Balance</span>
                <span className="fs-sm font-medium color-yellow-200">
                  {item.type === "USDT"
                    ? `$${(Number(item?.money) / 93).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : `₹${Number(item?.money).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} `}
                </span>
              </div>

              <div className="flex justify-between items-center mt-3 gray-100 text-sm px-2">
                <span className="text-sm font-medium">Type</span>
                <span className="fs-sm font-medium">{item.type}</span>
              </div>
              <div className="flex justify-between items-center mt-3 gray-100 text-sm px-2">
                <span className="text-sm font-medium">Time</span>
                <span className="fs-sm font-medium">{item.today}</span>
              </div>
              <div className="flex justify-between items-center mt-3 gray-100 text-sm px-2">
                <span className="text-sm font-medium">Order number</span>
                <span className="text-sm font-medium flex items-center">
                  {item.id_order}{" "}
                  <PiCopySimpleBold
                    className="ms-1 mt-[3px]"
                    onClick={() => copyToClipCode(item.id_order)}
                  />
                </span>
              </div>
              {item.status === 0 && (
                <Link
                  to={`https://h5support.chennai91.co//deposite?token=${Cookies.get(
                    "auth",
                  )}&order=${item.id_order}&amount=${
                    item.money
                  }&data=${encodeURIComponent(
                    JSON.stringify({
                      id_order: item.id_order,
                      money: item.money,
                    }),
                  )}`}
                  className="blue-linear w-full rounded-full text-whites py-1 mt-3 text-base font-semibold flex justify-center items-center"
                >
                  Submit Receipt
                </Link>
              )}
            </div>
          ))
        ) : (
          <EmptyData />
        )}
      </div>

      <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />
    </>
  );
};

export default RechargeHistory;
