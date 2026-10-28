import { useEffect, useMemo, useRef, useState } from "react";
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

const ITEM_HEIGHT = 56.67;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 283.35

const TransAction = () => {
  const { transactionHistoryData } = useSelector((state) => state.promotion);

  const [activeIndex, setActiveIndex] = useState(0);
  const [openAll, setOpenAll] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchLevel, setSearchLevel] = useState(null); // null = All
  const [dataAll, setDataAll] = useState("All");

  const pickerRef = useRef(null);
  const dispatch = useDispatch();

  /* ---------- 1. Dropdown items data se generate ---------- */
  const items = useMemo(() => {
    const details = (transactionHistoryData || [])
      .map((d) => d?.detail)
      .filter(Boolean);

    // unique + sorted (case-insensitive), "All" sabse pehle
    const unique = Array.from(
      new Map(details.map((d) => [d.toLowerCase(), d])).values(),
    ).sort((a, b) => a.localeCompare(b));

    return ["All", ...unique];
  }, [transactionHistoryData]);

  /* ---------- 2. Mount par sirf ek baar dispatch ---------- */
  useEffect(() => {
    dispatch(transactionHistory());
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- 3. Picker position sync ---------- */
  useEffect(() => {
    if (!pickerRef.current) return;
    const translateY =
      -(activeIndex * ITEM_HEIGHT) + (CONTAINER_HEIGHT / 2 - ITEM_HEIGHT / 2);
    pickerRef.current.style.transform = `translateY(${translateY}px)`;
  }, [activeIndex]);

  /* ---------- 4. Click handler ---------- */
  const handleClick = (index) => {
    setActiveIndex(index);
    const value = items[index];
    setDataAll(value);
    setSearchLevel(value === "All" ? null : value);
  };

  const handleOpenAll = () => setOpenAll((prev) => !prev);

  const handleConfirm = () => {
    setOpenAll(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  /* ---------- 5. Robust filter ---------- */
  const filteredData = useMemo(() => {
    if (!Array.isArray(transactionHistoryData)) return [];

    return transactionHistoryData.filter((item) => {
      // date match
      const itemDate = item?.time ? item.time.split(" ")[0] : "";
      const matchesDate = selectedDate ? itemDate === selectedDate : true;

      // level match (case-insensitive, partial)
      const matchesLevel =
        searchLevel === null
          ? true
          : (item?.detail || "")
              .toLowerCase()
              .includes(searchLevel.toLowerCase());

      return matchesDate && matchesLevel;
    });
  }, [transactionHistoryData, selectedDate, searchLevel]);

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
        {filteredData.length === 0 && (
          <div className="text-center text-gray-400 mt-6 text-sm">
            No transaction found
          </div>
        )}

        {filteredData.map((item, i) => (
          <div
            className="nav-bg rounded-lg mt-3 pb-4 text-gray-200"
            key={item.id ?? i}
          >
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

      {/* Overlay + Picker */}
      <div className={openAll ? "overlay-section block" : "hidden"}></div>
      <div className={openAll ? "block" : "hidden"}>
        <Container
          className="nav-bg rounded-t-xl"
          style={{ backgroundColor: "#1f1f1f" }}
        >
          <div
            className="rounded-t-xl flex justify-between p-2 px-2 sticky top-0 z-50"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            <button className="text-whites" onClick={handleOpenAll}>
              Cancel
            </button>
            <button className="text-[#26B2E6]" onClick={handleConfirm}>
              Confirm
            </button>
          </div>

          <PickerContainer>
            <div className="absolute top-1/2 left-0 right-0 h-[56.67px] -translate-y-1/2 border-t border-b border-gray-600 bg-[#2A2A2A] pointer-events-none" />

            <Picker ref={pickerRef}>
              {items.map((item, index) => (
                <Item
                  key={`${item}-${index}`}
                  onClick={() => handleClick(index)}
                  active={index === activeIndex}
                >
                  {item}
                </Item>
              ))}
            </Picker>
          </PickerContainer>
        </Container>
      </div>
    </>
  );
};

export default TransAction;
