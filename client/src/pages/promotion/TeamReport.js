import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { LuSearch } from "react-icons/lu";
import { PiCopySimpleBold } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import CopyCopmponent from "../../components/CopyCopmponent";
import CustomeNavbar from "../../components/CustomeNavbar";
import Calendar from "../../components/NewCalender";
import { myTeamReportSubordinate } from "../../store/reducer/promotionReducer";

const Container = styled.div`
  position: fixed;
  width: 100%;
  max-width: 24.7rem;
  height: 300px;
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

const TeamReport = () => {
  const { mySubordinateData } = useSelector((state) => state.promotion);
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(0);
  const pickerRef = useRef(null);
  const [openAll, setOpenAll] = useState(false);
  const [copyPopup, setCopyPopup] = useState(false);

  const [searchInput, setSearchInput] = useState(null);
  const [searchDate, setSearchDate] = useState(null);
  const [searchLevel, setSearchLevel] = useState(null);
  const [searchLevels, setSearchLevels] = useState("All");
  const [nonDate, setNonDate] = useState(null);

  let filteredData = mySubordinateData?.datas?.filter((item) => {
    const matchesId =
      searchInput !== null
        ? item?.userId?.toString().includes(searchInput)
        : true;
    const match = searchLevels?.match(/\d+/);
    const number = match ? parseInt(match[0], 10) : null;
    const matchesLevel =
      number !== null ? item.userLevel.toString().includes(searchLevel) : true;

    return matchesId && matchesLevel;
  });

  let filteredDataLevel = mySubordinateData?.levelData?.filter((item) => {
    const match = searchLevels?.match(/\d+/);
    const number = match ? parseInt(match[0], 10) : null;
    const matchesLevel =
      number !== null ? item.level.toString().includes(searchLevel) : true;

    return matchesLevel;
  });

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleOpenAll = () => {
    setOpenAll(!openAll);
  };

  const items = [
    "All",
    "Tier 1",
    "Tier 2",
    "Tier 3",
    "Tier 4",
    "Tier 5",
    "Tier 6",
  ];

  const handleClick = (index) => {
    setActiveIndex(index);
    let match = items[index].match(/\d+/);
    const number = match ? parseInt(match[0], 10) : null;
    setSearchLevels(items[index]);
    setSearchLevel(Number(number));

    if (pickerRef.current) {
      const itemHeight = 56.67;
      const containerHeight = 320;
      const translateY =
        -(index * itemHeight) + (containerHeight / 2 - itemHeight / 2);
      pickerRef.current.style.transform = `translateY(${translateY}px)`;
    }
  };

  useEffect(() => {
    handleClick(activeIndex);
    const getYesterdayDate = () => {
      const today = new Date();
      today.setDate(today.getDate() - 1);

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };
    if (nonDate === null) {
      setSearchDate(getYesterdayDate());
    }
  }, [activeIndex, mySubordinateData, dispatch]);

  const submitDate = (date) => {
    dispatch(myTeamReportSubordinate(date));
  };

  const handleDateSelect = (date) => {
    setSearchDate(date);
    setNonDate(date);
  };

  useEffect(() => {
    if (searchDate) {
      submitDate(searchDate);
    }
  }, [searchDate]);

  const copyToClipCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopyPopup(true);
    setTimeout(() => {
      setCopyPopup(false);
    }, 1500);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <CustomeNavbar name="Subordinate data" />
      <div className="container-section">
        <div className="flex nav-bg rounded-md mt-2 justify-between p-2">
          <input
            type="text"
            name=""
            id=""
            placeholder="Search subordinate UID "
            className="placeholder:gray-100 text-sm font-medium bg-transparent focus:outline-none p-1"
            value={searchInput}
            onChange={handleSearchChange}
          />
          <button className="bg-blues rounded-3xl px-5 mr-2 ">
            <LuSearch className="text-black" />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-2 mt-2">
          <div
            className="col-span-6 nav-bg flex cursor-pointer justify-between items-center p-2 rounded-md"
            onClick={handleOpenAll}
          >
            <span className="text-base text-white">{searchLevels}</span>
            <span>
              <IoIosArrowDown className="text-base gray-text" />
            </span>
          </div>
          <div className="col-span-6">
            <Calendar
              onDateSelect={handleDateSelect}
              onValueChange={handleDateSelect}
            />
          </div>
        </div>

        <div className="mt-2 bg-popup-nav min-h-[250px] p-4 rounded-lg space-y-5">
          {/* Row 1 */}
          <div className="flex justify-between">
            <div className="text-center w-[50%]">
              <h5 className="text-xl font-semibold text-white">
                {searchLevels === "All"
                  ? mySubordinateData?.total_recharge_count || 0
                  : filteredDataLevel?.[0]?.total_recharge_count || 0}
              </h5>
              <p className="text-sm text-gray-300 mt-1">Deposit number</p>
            </div>
            <div className="text-center w-[50%] border-l border-slate-500 pl-4">
              <h5 className="text-xl font-semibold text-white">
                {searchLevels === "All"
                  ? parseFloat(
                      mySubordinateData?.total_recharge_amount || 0,
                    ).toFixed(2)
                  : parseFloat(
                      filteredDataLevel?.[0]?.total_recharge_amount || 0,
                    ).toFixed(2)}
              </h5>
              <p className="text-sm text-gray-300 mt-1">Deposit amount</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex justify-between">
            <div className="text-center w-[50%]">
              <h5 className="text-xl font-semibold text-white">
                {searchLevels === "All"
                  ? mySubordinateData?.better_number || 0
                  : filteredDataLevel?.[0]?.better_number || 0}
              </h5>
              <p className="text-sm text-gray-300 mt-1">Number of bettors</p>
            </div>
            <div className="text-center w-[50%] border-l border-slate-500 pl-4">
              <h5 className="text-xl font-semibold text-white">
                {searchLevels === "All"
                  ? mySubordinateData?.total_bet_count || 0
                  : filteredDataLevel?.[0]?.total_bet_count || 0}
              </h5>
              <p className="text-sm text-gray-300 mt-1">Total bet</p>
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex justify-between">
            <div className="text-center w-[50%] px-2">
              <h5 className="text-xl font-semibold text-white">
                {searchLevels === "All"
                  ? mySubordinateData?.total_first_recharge_count || 0
                  : filteredDataLevel?.[0]?.total_first_recharge_count || 0}
              </h5>
              <p className="text-sm text-gray-300 mt-1">
                Number of people making first deposit
              </p>
            </div>
            <div className="text-center w-[50%] border-l border-slate-500 pl-4">
              <h5 className="text-xl font-semibold text-white">
                {searchLevels === "All"
                  ? mySubordinateData?.sum_total_first_recharge_count || 0
                  : filteredDataLevel?.[0]?.total_first_recharge_amount || 0}
              </h5>
              <p className="text-sm text-gray-300 mt-1">First deposit amount</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-section mt-5">
        {Array.isArray(filteredData) &&
          filteredData.map((item, i) => (
            <div className="nav-bg rounded-md mt-3 pb-7 px-3 pt-1" key={i}>
              <div className="mt-3 flex justify-between items-center rounded-sm text-sm pb-2 border-b border-[--grey-200]">
                <span className="text-sm font-medium p-1 flex items-center">
                  UID: {item?.userId}{" "}
                  <PiCopySimpleBold
                    className="ms-1 mt-[3px]"
                    onClick={() => copyToClipCode(item.userId)}
                  />
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center text-white text-sm">
                <span className="text-sm font-medium">Level</span>
                <span className="text-sm font-medium">{item?.userLevel}</span>
              </div>
              <div className="flex justify-between items-center mt-3 text-white text-sm">
                <span className="text-sm font-medium">Deposit Amount</span>
                <span className="text-sm font-medium color-yellow-200">
                  {item.totalRechargeAmount}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 text-white text-sm">
                <span className="text-sm font-medium">Bet Amount</span>
                <span className="text-sm font-medium color-yellow-200">
                  {item.totalBetAmount}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 text-white text-sm">
                <span className="text-sm font-medium">Commission</span>
                <span className="fs-sm font-medium color-yellow-200">
                  {item.totalCommsionsAmount}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 text-white text-sm">
                <span className="text-sm font-medium">Time</span>
                <span className="text-sm font-medium flex items-center">
                  {formatDate(Number(item.dates))}{" "}
                </span>
              </div>
            </div>
          ))}
      </div>

      {/* Overlay and Picker */}
      <div className={openAll ? "overlay-section block" : "hidden"}></div>
      <div className={openAll ? "block" : "hidden"}>
        <Container className="nav-bg min-w-content rounded-t-xl">
          {/* Fixed header */}
          <div
            className="rounded-t-xl flex justify-between p-2 px-3 sticky top-0 z-50"
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
            <div className="absolute bottom-36 left-0 right-0 h-[40px] bg-[#2A2A2A] pointer-events-none"></div>

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
        </Container>
      </div>

      <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />
    </>
  );
};

export default TeamReport;
