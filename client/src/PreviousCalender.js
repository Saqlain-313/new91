import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";

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
        className="w-24 h-[200px] overflow-y-scroll scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollSnapType: "y mandatory" }}
      >
        <div style={{ height: itemHeight * 2 }} />
        {items.map((item, index) => (
          <div
            key={index}
            ref={(el) => (itemRefs.current[index] = el)}
            onClick={() => handleItemClick(index)}
            className={`h-10 flex items-center justify-center cursor-pointer ${
              selectedItem === item ? "gray-50 font-bold" : "text-gray-500"
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

function PreviousCalendar({ onDateSelect, onValueChange }) {
  const now = new Date();
  now.setDate(now.getDate() - 1); // 👈 Get yesterday's date
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1; // Months are 0-based
  const currentDay = now.getUTCDate();

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(
    currentMonth.toString().padStart(2, "0")
  );
  const [selectedDay, setSelectedDay] = useState(
    currentDay.toString().padStart(2, "0")
  );
  const [isOpen, setIsOpen] = useState(false);
  // Define years, months, and days based on current date
  const years = Array.from({ length: 6 }, (_, i) =>
    (2020 + i).toString()
  ).filter((year) => parseInt(year) <= currentYear);

  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  ).filter(
    (month) =>
      parseInt(month) <=
      (parseInt(selectedYear) === currentYear ? currentMonth : 12)
  );

  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  ).filter(
    (day) =>
      parseInt(day) <=
      (parseInt(selectedYear) === currentYear &&
      parseInt(selectedMonth) === currentMonth
        ? currentDay
        : 31)
  );

  const handleConfirm = () => {
    const selectedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;

    if (onDateSelect) {
      onDateSelect(selectedDate);
      onValueChange(selectedDate);
    }
    setIsOpen(false);
  };

  return (
    <div className="">
      <div className={isOpen ? "overlay-section block" : "hidden"}></div>

      <div className="bg-light cursor-pointer flex justify-between items-center p-2 rounded-md">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="border rounded gray-50 border-none w-full text-left"
        >
          {`${selectedYear}-${selectedMonth}-${selectedDay}`}
        </button>
        <span>
          <IoIosArrowDown className="text-base gray-50" />
        </span>
      </div>

      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 m-auto w-[24.5rem] z-50 rounded-t-xl shadow-lg bg-body">
          <div className="flex justify-between px-4 py-2 items-center rounded-t-xl bg-light">
            <h2
              onClick={() => setIsOpen(false)}
              className="gray-text cursor-pointer"
            >
              Cancel
            </h2>
            <h2 className="text-whites font-bold text-md">Choose a Date</h2>
            <h2 onClick={handleConfirm} className="text-blue cursor-pointer">
              Confirm
            </h2>
          </div>
          <div className="flex justify-around bg-body">
            <ScrollPicker
              items={years}
              selectedItem={selectedYear}
              onChange={setSelectedYear}
              label="Year"
            />
            <ScrollPicker
              items={months}
              selectedItem={selectedMonth}
              onChange={setSelectedMonth}
              label="Month"
            />
            <ScrollPicker
              items={days}
              selectedItem={selectedDay}
              onChange={setSelectedDay}
              label="Day"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviousCalendar;
