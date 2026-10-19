import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { LuSearch } from "react-icons/lu";

import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {
  getfetchPromotionDataUser,
  myTeamReportSubordinate,
} from "../../store/reducer/promotionReducer";
import { PiCopySimpleBold } from "react-icons/pi";
import CopyCopmponent from "../../components/CopyCopmponent";
import Calendar from "../../Calender";
import CustomeNavbar from "../../components/CustomeNavbar";
import EmptyData from "../activity/EmptyData";
import PreviousCalendar from "../../PreviousCalender";

const Container = styled.div`
  position: fixed;
  width: 24.7rem;
  height: 300px;
  overflow: hidden;

  margin: 0 auto;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Picker = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(${(props) => props.translateY}px);
  transition: transform 0.3s ease-out;
  z-index: 2;
  position: relative;
`;

const Item = styled.div`
  height: 50.67px; /* one third of container height */
  display: flex;
  justify-content: center;
  align-items: center;

  color: ${(props) => (props.active ? "#000" : "#606877")};
  transition: color 0.3s;
  cursor: pointer;
  font-weight: 700;
`;
const TeamReport = () => {
  const { mySubordinateData, userInfo, userData, levelData, subordinateData } =
    useSelector((state) => state.promotion);
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(0);
  const pickerRef = useRef(null);
  const [openAll, setOpenAll] = useState(false);
  const [copyPopup, setCopyPopup] = useState(false);
  const [searchInput, setSearchInput] = useState(null);
  const [searchDate, setSearchDate] = useState(null); // Assuming you have this date for filtering
  const [searchLevel, setSearchLevel] = useState(null);
  const [searchLevels, setSearchLevels] = useState(null);
  const [nonDate, setNonDate] = useState(null);

  let filteredData = userData?.filter((item) => {
    const matchesId =
      searchInput !== null
        ? item?.userId?.toString().includes(searchInput)
        : true; // Show all if no searchInput is provided
    const match = searchLevels?.match(/\d+/);
    const number = match ? parseInt(match[0], 10) : null;
    const matchesLevel =
      number !== null ? item.level.toString().includes(searchLevel) : true; // Show all if no searchLevel is provided

    return matchesId && matchesLevel;
  });

  let match = searchLevels?.match(/\d+/); // Extract number from "Tier 1", "Tier 2"
  let number = match ? parseInt(match[0], 10).toString() : null;

  let filteredDataLevel =
    number && levelData && levelData[number]
      ? { level: number, ...levelData[number] }
      : null; // Return null if no match is found

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
      const itemHeight = pickerRef.current.children[0].clientHeight;
      const translateY =
        -(index * itemHeight) +
        pickerRef.current.clientHeight / 3 -
        itemHeight / 2;
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

  // this is select date

  const submitDate = (date) => {
    // dispatch(myTeamReportSubordinate(date));
    dispatch(getfetchPromotionDataUser(date));
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

  return (
    <>
      <CustomeNavbar name="Subordinate data" />
      <div className="container-section">
        <div className="flex bg-light rounded-md mt-2 justify-between p-2">
          <input
            type="text"
            name=""
            id=""
            placeholder="Search subordinate UID "
            className="placeholder:gray-100 text-sm font-medium bg-transparent focus:outline-none p-1"
            value={searchInput}
            onChange={handleSearchChange}
          />
          <button className="sheet_nav_bg rounded-3xl px-5 mr-2 ">
            <LuSearch className="text-white text-2xl font-bold" />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-2 mt-2">
          <div
            className="col-span-6 bg-body flex cursor-pointer justify-between items-center p-2 rounded-md"
            onClick={handleOpenAll}
          >
            <span className="text-base text-black" onClick={handleOpenAll}>
              {searchLevels}
            </span>
            <span>
              <IoIosArrowDown className="text-base text-black" />
            </span>
          </div>
          <div className="col-span-6  ">
            <PreviousCalendar
              onDateSelect={handleDateSelect}
              onValueChange={handleDateSelect}
            />
          </div>
        </div>

        <div className="mt-2 bg-[#f95959] p-2 rounded-lg">
          <div className="flex justify-between mt-2 py-2">
            <div className="text-center w-[50%]">
              {searchLevels === "All" ? (
                <h5 className="heading-h5  text-lg text-white">
                  {subordinateData?.total_recharge_count || 0}
                </h5>
              ) : (
                <h5 className="heading-h5  text-lg text-white">
                  {filteredDataLevel?.total_recharge_count || 0}
                </h5>
              )}
              <p className="fs-sm text-white">Deposit number</p>
            </div>
            <div className="text-center  w-[50%] border-l border-slate-500">
              {searchLevels === "All" ? (
                <h5 className="heading-h5 text-lg  text-white">
                  {subordinateData?.total_recharge_amount || 0}
                </h5>
              ) : (
                <h5 className="heading-h5 text-lg  text-white">
                  {filteredDataLevel?.totalRechargeAmount || 0}
                </h5>
              )}
              <p className="fs-sm text-white">Depost amount</p>
            </div>
          </div>
          <div className="flex justify-between mt-3 py-2">
            <div className="text-center w-[50%]">
              {searchLevels === "All" ? (
                <h5 className="heading-h5  text-lg  text-white">
                  {subordinateData?.better_number || 0}{" "}
                </h5>
              ) : (
                <h5 className="heading-h5  text-lg  text-white">
                  {filteredDataLevel?.better_number || 0}{" "}
                </h5>
              )}

              <p className="fs-sm text-white">Number of bettors</p>
            </div>
            <div className="text-center  w-[50%] border-l  border-slate-500 ">
              {searchLevels === "All" ? (
                <h5 className="heading-h5 text-lg  text-white">
                  {subordinateData?.total_bet_amount || 0}
                </h5>
              ) : (
                <h5 className="heading-h5 text-lg  text-white">
                  {filteredDataLevel?.totalBetAmount || 0}
                </h5>
              )}

              <p className="fs-sm text-white">Total bet amount</p>
            </div>
          </div>
          <div className="flex justify-between mt-3 py-2 pb-3">
            <div className="text-center w-[50%] px-2">
              {searchLevels === "All" ? (
                <h5 className="heading-h5  text-lg  text-white">
                  {subordinateData?.total_first_recharge_count || 0}
                </h5>
              ) : (
                <h5 className="heading-h5  text-lg text-white">
                  {filteredDataLevel?.total_first_recharge_count || 0}
                </h5>
              )}
              <p className="fs-sm text-white">
                Number of people making first deposit
              </p>
            </div>
            <div className="text-center  w-[50%] border-l  border-slate-500 ">
              {searchLevels === "All" ? (
                <h5 className="heading-h5 text-lg  text-white">
                  {subordinateData?.first_deposit_amount || 0}
                </h5>
              ) : (
                <h5 className="heading-h5 text-lg  text-white">
                  {filteredDataLevel?.first_deposit_amount || 0}
                </h5>
              )}

              <p className="fs-sm text-white">First deposit amount</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-section mt-5">
        {filteredData?.length > 0 ? (
          Array.isArray(filteredData) &&
          filteredData.map((item, i) => (
            <div className="nav-bg rounded-md mt-3 pb-7 px-3 pt-1" key={i}>
              <div className=" mt-3 flex justify-between items-center rounded-sm  text-sm pb-2 border-b border-[--grey-200]">
                <span className="text-sm font-medium  p-1 flex items-center">
                  UID: {item?.userId}{" "}
                  <PiCopySimpleBold
                    className="ms-1 mt-[3px]"
                    onClick={() => copyToClipCode(item.userId)}
                  />
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center text-white text-sm">
                <span className="text-sm font-medium">Level</span>
                <span className="text-sm font-medium "> {item?.level}</span>
              </div>

              <div className=" flex justify-between items-center mt-3 text-white text-sm">
                <span className="text-sm font-medium">Deposit Amount</span>
                <span className="text-sm font-medium color-yellow-200">
                  {item.totalRechargeAmount}
                </span>
              </div>
              <div className=" flex justify-between items-center mt-3 text-white text-sm">
                <span className="text-sm font-medium">Bet Amount</span>
                <span className="text-sm font-medium color-yellow-200">
                  {item.totalBetAmount}
                </span>
              </div>
              <div className=" flex justify-between items-center  mt-3 text-white text-sm">
                <span className="text-sm font-medium">Commission</span>
                <span className="fs-sm font-medium color-yellow-200">
                  {item.commission}
                </span>
              </div>
              <div className=" flex justify-between items-center  mt-3 text-white text-sm">
                <span className="text-sm font-medium">Time</span>
                <span className="text-sm font-medium flex items-center">
                  {item.dates.split("T")[0]}{" "}
                </span>
              </div>
            </div>
          ))
        ) : (
          <EmptyData />
        )}
      </div>

      {/* all filter bottom */}

      <div className={openAll ? "block" : "hidden"}>
        <Container className="bg-popup rounded-t-xl filter-section z-20">
          <div className="bg-body rounded-t-xl flex justify-between p-2 px-3 relative z-10">
            <button className="text-whites" onClick={handleOpenAll}>
              Cancel
            </button>
            <button className="text-blue" onClick={handleOpenAll}>
              Confirm
            </button>
          </div>
          <Picker ref={pickerRef} translateY={-(activeIndex * 66.67)}>
            {items.map((item, index) => (
              <Item
                className="text-sm"
                key={index}
                active={index === activeIndex}
                onClick={() => handleClick(index)}
              >
                {item}
              </Item>
            ))}
          </Picker>
          <div className="picker-botom-hilight"></div>
        </Container>
      </div>

      <div className={openAll ? "overlay-section block" : "hidden"}></div>

      <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />
    </>
  );
};

export default TeamReport;
