import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import Calendar from "../../Calender";
import CustomeNavbar from "../../components/CustomeNavbar";
import { transactionHistory } from "../../store/reducer/promotionReducer";

const Container = styled.div`
  position: fixed;
  width: 100%;
  max-width: 24.7rem;
  height: 400px;
  overflow: hidden;
  margin: 0 auto;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
`;

const PickerContainer = styled.div`
  height: 320px;
  position: relative;
  overflow: hidden;
`;

const Picker = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(${(props) => props.translateY}px);
  transition: transform 0.3s ease-out;
`;

const Item = styled.div`
  height: 56.67px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => (props.active ? "#fff" : "#606877")};
  transition: color 0.3s;
  cursor: pointer;
  font-weight: ${(props) => (props.active ? "bold" : "normal")};
  font-size: 14px;
`;

const TransAction = () => {
  const { transactionHistoryData } = useSelector((state) => state.promotion);
  const [activeIndex, setActiveIndex] = useState(0);
  const pickerRef = useRef(null);
  const [openAll, setOpenAll] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchLevel, setSearchLevel] = useState(null);
  const [dataAll, setDataAll] = useState("All");

  const dispatch = useDispatch();

  const handleOpenAll = () => {
    setOpenAll(!openAll);
  };

  const items = [
    "All",
    "Bet",
    "Agent Commission",
    "Win",
    "Red envelope",
    "Deposit",
    "Withdraw",
    "Cancel withdrawal",
    "Attendance bonus",
    "Agent's red envelope",
    "Withdrawal rejected",
    "Deposit gift",
    "Manual deposit",
    "Sign up bonus",
    "Bonus",
    "First deposit bonus",
    "First deposit rebate",
    "Investment and financial management",
    "Financial income",
    "Financial capital",
    "Capital",
    "Mission rewards",
    "Game moved in",
    "Game moved out",
    "Winning slots",
    "Bank binding bonus",
    "Game refunded",
    "USDT deposit",
    "Betting rebate",
    "VIP level up reward",
    "VIP monthly reward",
    "VIP deposit bonus",
    "Bonus deduction",
    "Manual withdrawal",
    "One-Click rebate",
    "Slots Jackpot",
    "Bind mobile phone rewards",
    "XOSO issue canceled",
    "Bind email rewards",
    "Weekly Award",
    "C2C Withdraw Awards",
    "C2C Withdraw",
    "C2C Withdraw Back",
    "C2C Recharge",
    "C2C Recharge Awards",
    "Newbie gift pack",
    "Tournament Rewards",
    "Return Awards",
    "New members receive bonuses on their first deposit loss",
    "New members get bonuses by playing games",
    "Daily rewards",
    "Turntable Awards",
    "Partner rewards",
    "ARPay Cash Back",
    "Join channel rewards",
    "Recharge Replenishment",
    "Withdrawal Reward",
  ];

  const handleClick = (index) => {
    setActiveIndex(index);
    setDataAll(items[index]);
    setSearchLevel(index === 0 ? null : items[index]);

    if (pickerRef.current) {
      const itemHeight = 56.67; // Fixed item height
      const containerHeight = 250; // Picker container height
      const visibleItems = 5; // Number of items visible at once
      const translateY =
        -(index * itemHeight) + (containerHeight / 2 - itemHeight / 2);

      pickerRef.current.style.transform = `translateY(${translateY}px)`;
    }
  };

  useEffect(() => {
    handleClick(activeIndex);
    dispatch(transactionHistory());
    window.scrollTo(0, 0);
  }, [activeIndex]);

  const filteredData = transactionHistoryData?.filter((item) => {
    const itemDate = `${item.time.split(" ")[0]}`;
    const matchesDate =
      selectedDate !== null ? itemDate === selectedDate : true;
    const matchesLevel =
      searchLevel !== null ? item.detail === searchLevel : true;
    return matchesLevel && matchesDate;
  });

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  return (
    <>
      <CustomeNavbar name="Transaction history" />

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
          <div className="col-span-6 nav-bg rounded">
            <Calendar
              onDateSelect={handleDateSelect}
              onValueChange={handleDateSelect}
            />
          </div>
        </div>
      </div>

      <div className="container-section mt-5">
        {Array.isArray(transactionHistoryData) &&
          filteredData.map((item, i) => (
            <div className="nav-bg rounded-lg mt-3 pb-4 text-gray-200" key={i}>
              <div className="w-full blue-linear p-2 text-black font-medium rounded-t-md">
                {item.detail}
              </div>
              <div className="mt-3 bg-[rgb(14_18_24)] min-h-[1.7rem] px-3 py-1 flex justify-between items-center rounded-sm mx-2 text-whites text-sm">
                <span className="fs-sm font-medium">Detail</span>
                <span className="fs-sm font-medium">{item.detail}</span>
              </div>
              <div className="mt-1 bg-[rgb(14_18_24)] min-h-[1.7rem] px-3 py-1 flex justify-between items-center rounded-sm mx-2 text-whites text-sm">
                <span className="fs-sm font-medium">Time</span>
                <span className="fs-sm font-medium">{item.time}</span>
              </div>
              <div className="mt-1 bg-[rgb(14_18_24)] min-h-[1rem] px-3 py-1 flex justify-between items-center rounded-sm mx-2 text-whites text-sm">
                <span className="fs-sm font-medium">Balance</span>
                <span className="text-sm font-medium color-green">
                  ₹
                  {Number(item?.balance).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* Overlay and Picker */}
      <div className={openAll ? "overlay-section block" : "hidden"}></div>
      <div className={openAll ? "block" : "hidden"}>
        <Container
          className="nav-bg rounded-t-xl "
          style={{ backgroundColor: "#1f1f1f" }}
        >
          {/* Fixed header */}
          <div
            className="rounded-t-xl flex justify-between p-2 px-2  sticky top-0 z-50"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            <button className="text-whites" onClick={handleOpenAll}>
              Cancel
            </button>
            <button className="text-[#26B2E6]" onClick={handleOpenAll}>
              Confirm
            </button>
          </div>

          {/* Picker content */}
          <PickerContainer>
            {/* <div className="absolute top-0 left-0 right-0 h-[85px] bg-[#2A2A2A] pointer-events-none"></div> */}
            <div className="absolute bottom-44 left-0 right-0 h-[40px] border-t border-b border-gray-600 bg-[#2A2A2A] pointer-events-none"></div>

            <Picker ref={pickerRef}>
              {items.map((item, index) => (
                <Item
                  key={index}
                  onClick={() => handleClick(index)}
                  active={index === activeIndex}
                >
                  {item}
                </Item>
              ))}
            </Picker>
          </PickerContainer>

          {/* <div className="picker-botom-hilight"></div> */}
        </Container>
      </div>
    </>
  );
};

export default TransAction;
