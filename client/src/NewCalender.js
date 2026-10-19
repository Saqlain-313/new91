import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

function NewCalendar() {
  const now = new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(now);
  const [visibleMonth, setVisibleMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const generateMonths = () => {
    const start = new Date(2022, 1);
    const end = new Date(2025, 4);
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

  const isSelected = (date) => {
    if (selectedDates.length === 2) {
      const [start, end] = selectedDates;
      return date >= start && date <= end;
    }
    return selectedDates.some(
      (d) =>
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    );
  };

  const handleDateClick = (date) => {
    let newSelectedDates;

    if (selectedDates.length === 2) {
      newSelectedDates = [date];
    } else if (selectedDates.length === 1) {
      const [start] = selectedDates;
      if (date < start) {
        newSelectedDates = [date, start];
      } else {
        newSelectedDates = [start, date];
      }
    } else {
      newSelectedDates = [date];
    }

    setSelectedDates(newSelectedDates);
    setSelectedDate(date);

    // Log the first selected date
    if (newSelectedDates.length === 1) {
      //console.log("First date selected:", newSelectedDates[0]);
    }
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

    const isApril2025 = year === 2025 && month === 3;
    const isMarch2025 = year === 2025 && month === 2;
    const isMay2025 = year === 2025 && month === 4;

    return (
      <div
        key={`${year}-${month}`}
        className="mb-4"
        ref={(el) => (monthRefs.current[index] = el)}
      >
        <div className="text-center py-2 text-gray-100 font-medium">
          {year}/{month + 1}
        </div>

        {visibleMonth.year === year && visibleMonth.month === month && (
          <div className="absolute inset-0 flex items-center justify-center text-9xl text-gray-400 pointer-events-none -z-10">
            {month + 1}
          </div>
        )}

        <div className="grid grid-cols-7 gap-0 relative">
          {Array.from({ length: startingDay }).map((_, index) => (
            <div key={`empty-${index}`} className="h-10"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const isStartDay = isApril2025 && day === 11;
            const isDisabled = isMay2025 && day >= 28;

            return (
              <div
                key={`day-${day}`}
                className={`h-10 flex flex-col items-center justify-center text-sm cursor-pointer
      ${(() => {
                    if (selectedDates.length === 2) {
                      const [start, end] = selectedDates;
                      if (date.getTime() === start.getTime() || date.getTime() === end.getTime()) {
                        return "bg-yellow-500 text-white rounded my-0.5";
                      }
                      if (date > start && date < end) {
                        return "bg-[#393838] text-white my-0.5";
                      }
                    } else if (selectedDates.length === 1 && date.getTime() === selectedDates[0].getTime()) {
                      return "bg-[#393838] text-white my-0.5";
                    }
                    return "";
                  })()}
      ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
    `}
                onClick={() => !isDisabled && handleDateClick(date)}
                role="gridcell"
                tabIndex="-1"
              >
                <span>{day}</span>

                {selectedDates.length > 0 && date.getTime() === selectedDates[0].getTime() && (
                  <span className="text-xs text-grey-100">Start</span>
                )}

                {selectedDates.length === 2 && date.getTime() === selectedDates[1].getTime() && (
                  <span className="text-xs text-grey-100">End</span>
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
        className="nav-bg cursor-pointer flex justify-between items-center p-2 rounded-md border border-gray-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="w-full text-left">
          {`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`}
        </span>
        <IoIosArrowDown className="text-base text-gray" />
      </div>

      {isOpen && (
        <>
          {/* Black background overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div className="fixed inset-x-0 bottom-0 bg-[#131111] max-w-[25rem] mx-auto z-50 rounded-t-3xl shadow-lg">
            <div className="flex flex-col h-[70vh]">
              <div className="p-4 calenderbg sticky top-0 z-50 rounded-t-3xl text-white">
                <div className="text-lg font-semibold text-center">Calendar</div>
                <div className="text-sm text-gray-400 text-center">
                  {visibleMonth.year}/{visibleMonth.month + 1}
                </div>
                <div className="van-calendar__weekdays grid grid-cols-7 py-2">
                  {weekdays.map((day) => (
                    <span key={day} className="text-xs text-center text-gray-50">
                      {day}
                    </span>
                  ))}
                </div>
                <button
                  className="absolute top-2 right-2 text-3xl text-white"
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </button>
              </div>

              <div
                className="overflow-y-auto scroll-smooth px-2 "
                style={{
                  maxHeight: "400px",
                  scrollBehavior: "smooth", // ensures inline CSS smooth behavior
                  WebkitOverflowScrolling: "touch", // optional for iOS smoothness
                  scrollPaddingTop: "80px", // optional: avoids clipping top content
                }}
                ref={scrollContainerRef}
                onScroll={handleScroll}
              >
                {months.map(({ year, month }, index) => renderMonth(year, month, index))}
              </div>

              <div className="p-2">
                <button
                  type="button"
                  className="w-full calenderbutton bg-blue-600 text-white py-2 rounded-full font-medium"
                  onClick={() => setIsOpen(false)}
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

export default NewCalendar;