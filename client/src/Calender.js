import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

const START_YEAR = 2020;

function ScrollPicker({ items, selectedItem, onChange, label }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const itemHeight = 40;

  useEffect(() => {
    // Scroll to the selected item when the component is first rendered or when selectedItem changes
    const selectedIndex = items.indexOf(selectedItem);
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    }
  }, [selectedItem, items]);

  const handleScroll = (e) => {
    const scrollPos = e.target.scrollTop;
    const selectedIndex = Math.round(scrollPos / itemHeight);
    if (selectedIndex >= 0 && selectedIndex < items.length) {
      onChange(items[selectedIndex]);
    }
  };

  const handleItemClick = (index) => {
    onChange(items[index]);
    if (itemRefs.current[index]) {
      itemRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-whites mb-2">{label}</span>
      <div
        ref={containerRef}
        className="w-24 h-[200px] z-10 overflow-y-scroll scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollSnapType: "y mandatory" }}
      >
        <div style={{ height: itemHeight * 2 }} />
        {items.map((item, index) => (
          <div
            key={item}
            ref={(el) => (itemRefs.current[index] = el)}
            onClick={() => handleItemClick(index)}
            className={`h-10 flex items-center justify-center cursor-pointer ${
              selectedItem === item ? "text-white font-bold" : "text-gray-500"
            }`}
            style={{
              scrollSnapAlign: "center",
              height: itemHeight,
              lineHeight: `${itemHeight}px`,
            }}
          >
            {item}
          </div>
        ))}
        <div style={{ height: itemHeight * 2 }} />
      </div>
    </div>
  );
}

const pad = (n) => String(n).padStart(2, "0");

function Calendar({ onDateSelect, onValueChange }) {
  // Local date use karo (UTC se IST me raat ko date galat aati thi)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // Months are 0-based
  const currentDay = now.getDate();

  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState(pad(currentMonth));
  const [selectedDay, setSelectedDay] = useState(pad(currentDay));
  const [isOpen, setIsOpen] = useState(false);

  // Years: START_YEAR se current year tak (dynamic)
  const years = Array.from(
    { length: Math.max(currentYear - START_YEAR + 1, 1) },
    (_, i) => String(START_YEAR + i),
  );

  const yearNum = parseInt(selectedYear, 10);
  const monthNum = parseInt(selectedMonth, 10);

  // Months: current year me sirf current month tak
  const maxMonth = yearNum === currentYear ? currentMonth : 12;
  const months = Array.from({ length: maxMonth }, (_, i) => pad(i + 1));

  // Days: us mahine ke asli din, current month me aaj tak
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const maxDay =
    yearNum === currentYear && monthNum === currentMonth
      ? Math.min(currentDay, daysInMonth)
      : daysInMonth;
  const days = Array.from({ length: maxDay }, (_, i) => pad(i + 1));

  // Month/day invalid ho jaye (year ya month badalne par) to last valid par le aao
  useEffect(() => {
    if (!months.includes(selectedMonth)) {
      setSelectedMonth(months[months.length - 1]);
    }
  }, [selectedYear, selectedMonth, months.length]);

  useEffect(() => {
    if (!days.includes(selectedDay)) {
      setSelectedDay(days[days.length - 1]);
    }
  }, [selectedYear, selectedMonth, selectedDay, days.length]);

  const handleConfirm = () => {
    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;

    if (onDateSelect) onDateSelect(selectedDate);
    if (onValueChange) onValueChange(selectedDate);
    setIsOpen(false);
  };

  return (
    <div className="">
      <div className={isOpen ? "overlay-section block" : "hidden"}></div>

      <div className="nav-bg cursor-pointer flex justify-between items-center p-2 rounded-md">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="border rounded gray-50 border-none w-full text-left"
        >
          {`${selectedYear}-${selectedMonth}-${selectedDay}`}
        </button>
        <span>
          <IoIosArrowDown className="text-base text-gray" />
        </span>
      </div>

      {isOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 m-auto w-full min-w-content h-[300px] z-50 rounded-t-xl shadow-lg "
          style={{ backgroundColor: "#1f1f1f" }}
        >
          <div
            className="flex justify-between px-4 py-2 items-center rounded-t-xl"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            <h2
              onClick={() => setIsOpen(false)}
              className="text-gray-500 font-bold cursor-pointer"
            >
              Cancel
            </h2>
            <h2 className="text-whites font-bold text-md">Choose a Date</h2>
            <h2
              onClick={handleConfirm}
              className="text-[#26B2E6] font-bold cursor-pointer"
            >
              Confirm
            </h2>
          </div>
          <div className="flex justify-around ">
            <ScrollPicker
              items={years}
              selectedItem={selectedYear}
              onChange={setSelectedYear}
              // label="Year"
            />
            <ScrollPicker
              items={months}
              selectedItem={selectedMonth}
              onChange={setSelectedMonth}
              // label="Month"
            />
            <ScrollPicker
              items={days}
              selectedItem={selectedDay}
              onChange={setSelectedDay}
              // label="Day"
            />
          </div>

          <div className=" absolute bottom-[134px] h-10 w-full  bg-[#2A2A2A] "></div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
