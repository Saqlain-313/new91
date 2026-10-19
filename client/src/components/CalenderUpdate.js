import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

function CalendarUpdate({ onDateSelect, selectedDates = [] }) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const [isOpen, setIsOpen] = useState(false);
  const [internalSelectedDates, setInternalSelectedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(now);
  const [visibleMonth, setVisibleMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const generateMonths = () => {
    const start = new Date(2025, 0); // Jan 2025
    start.setHours(0, 0, 0, 0);
    const end = new Date(); // current date
    end.setHours(0, 0, 0, 0);
    const months = [];
    const current = new Date(start);

    while (current <= end) {
      months.push({ year: current.getFullYear(), month: current.getMonth() });
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  const months = generateMonths();
  const scrollContainerRef = useRef(null);
  const monthRefs = useRef([]);

  useEffect(() => {
    if (isOpen && monthRefs.current.length > 0) {
      // Scroll to current month
      const currentMonthIndex = months.findIndex(
        (m) => m.year === now.getFullYear() && m.month === now.getMonth()
      );
      if (currentMonthIndex !== -1) {
        const targetElement = monthRefs.current[currentMonthIndex];
        if (targetElement && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = targetElement.offsetTop;
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDates.length > 0) {
      const normalizedDates = selectedDates.map((date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
      });
      setInternalSelectedDates(normalizedDates);
      if (selectedDates[0]) {
        setSelectedDate(normalizedDates[0]);
      }
    } else {
      setInternalSelectedDates([]);
    }
  }, [selectedDates]);

  const isSelected = (date) => {
    if (internalSelectedDates.length === 2) {
      const [start, end] = internalSelectedDates;
      return date >= start && date <= end;
    }
    return internalSelectedDates.some((d) => d.getTime() === date.getTime());
  };

  const handleDateClick = (date) => {
    let newSelectedDates;

    if (internalSelectedDates.length === 2) {
      newSelectedDates = [date];
    } else if (internalSelectedDates.length === 1) {
      const [start] = internalSelectedDates;

      if (date.getTime() === start.getTime()) {
        newSelectedDates = [date];
      } else if (date > start && date <= now) {
        newSelectedDates = [start, date];
      } else if (date < start && date <= now) {
        newSelectedDates = [date];
      } else {
        return;
      }
    } else {
      newSelectedDates = [date];
    }

    setInternalSelectedDates(newSelectedDates);
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (onDateSelect) {
      onDateSelect(internalSelectedDates);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setInternalSelectedDates([]);
    onDateSelect([]);
    setIsOpen(false);
  };

  const handleScroll = () => {
    const scrollTop = scrollContainerRef.current?.scrollTop ?? 0;
    for (let i = 0; i < monthRefs.current.length; i++) {
      const el = monthRefs.current[i];
      if (el && el.offsetTop - scrollTop >= -50) {
        const { year, month } = months[i];
        setVisibleMonth({ year, month });
        break;
      }
    }
  };

  const renderMonth = (year, month, index) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const isCurrentMonth =
      year === now.getFullYear() && month === now.getMonth();

    return (
      <div
        key={`${year}-${month}`}
        className="mb-4"
        ref={(el) => (monthRefs.current[index] = el)}
      >
        <div className="text-center py-2 text-gray-50 font-medium">
          {year}/{month + 1}
        </div>

        {visibleMonth.year === year && visibleMonth.month === month && (
          <div className="absolute inset-0 flex items-center justify-center text-9xl text-[#dd9138] opacity-80 pointer-events-none z-50">
            {month + 1}
          </div>
        )}

        <div className="grid grid-cols-7 gap-0 relative">
          {Array.from({ length: startingDay }).map((_, index) => (
            <div key={`empty-${index}`} className="h-10 "></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            const isFutureDate = date > now;

            const isDisabled = isFutureDate;

            return (
              <div
                key={`day-${day}`}
                className={`h-16 flex flex-col rounded items-center text-black justify-center text-md cursor-pointer
                  ${(() => {
                    if (internalSelectedDates.length === 2) {
                      const [start, end] = internalSelectedDates;
                      if (
                        date.getTime() === start.getTime() ||
                        date.getTime() === end.getTime()
                      ) {
                        return "bg-gray-300 text-black rounded my-0.5 ";
                      }
                      if (date > start && date < end) {
                        return "bg-gray-200 text-black my-0.5";
                      }
                    } else if (
                      internalSelectedDates.length === 1 &&
                      date.getTime() === internalSelectedDates[0].getTime()
                    ) {
                      return "bg-gray-300 text-black my-0.5 ";
                    }
                    return "";
                  })()}
                  ${isDisabled ? "opacity-80 cursor-not-allowed" : ""}
                `}
                onClick={() => !isDisabled && handleDateClick(date)}
                role="gridcell"
                tabIndex="-1"
              >
                <span>{day}</span>

                {internalSelectedDates.length > 0 &&
                  date.getTime() === internalSelectedDates[0].getTime() && (
                    <span className="text-xs text-black ">Start</span>
                  )}

                {internalSelectedDates.length === 2 &&
                  date.getTime() === internalSelectedDates[1].getTime() && (
                    <span className="text-xs text-black ">End</span>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div
        className="bg-light cursor-pointer flex justify-between items-center p-2 rounded-md  "
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="w-full gray-50 text-left">
          {internalSelectedDates.length > 0
            ? `${internalSelectedDates[0].toLocaleDateString()}`
            : "Select Date"}
          {internalSelectedDates.length === 2 &&
            ` to ${internalSelectedDates[1].toLocaleDateString()}`}
        </span>
        <IoIosArrowDown className="text-base gray-100" />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div className="fixed inset-x-0 bottom-0 bg-[#f6f6f6] max-w-[25rem] mx-auto z-50 rounded-t-3xl shadow-lg">
            <div className="flex flex-col h-[75vh]">
              <div className="p-4 bg-light shadow-md sticky top-0 z-50 rounded-t-3xl text-black">
                <div className="text-lg font-semibold text-center">
                  Calendar
                </div>
                <div className="text-sm text-black text-center">
                  {visibleMonth.year}/{visibleMonth.month + 1}
                </div>
                <div className="van-calendar__weekdays grid grid-cols-7 py-2">
                  {weekdays.map((day) => (
                    <span
                      key={day}
                      className="text-xs text-center text-black"
                    >
                      {day}
                    </span>
                  ))}
                </div>
                <button
                  className="absolute top-2 right-2 text-3xl gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </button>
              </div>

              <div
                className="overflow-y-auto scroll-smooth px-2"
                style={{
                  maxHeight: "400px",
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                  scrollPaddingTop: "80px",
                }}
                ref={scrollContainerRef}
                onScroll={handleScroll}
              >
                {months.map(({ year, month }, index) =>
                  renderMonth(year, month, index)
                )}
              </div>

              <div className="p-2 flex gap-2">
                <button
                  type="button"
                  className="flex-1 w-full calenderbutton blue-linear color-orange py-2 rounded-full font-medium"
                  onClick={handleConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CalendarUpdate;
