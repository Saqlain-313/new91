import React, { useState, useRef, useEffect, useCallback } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { LuSearch } from "react-icons/lu";

import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {
  myTeamReportSubordinate,
  searchUser, // Import the new searchUser thunk
  clearSearchState, // Import the clearSearchState action
  messageClear, // Assuming you have this action
} from "../../store/reducer/promotionReducer"; // Adjust path as needed
import { PiCopySimpleBold } from "react-icons/pi";
import CopyCopmponent from "../../components/CopyCopmponent";
import Calendar from "../../components/NewCalender";
import CustomeNavbar from "../../components/CustomeNavbar";

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

  color: ${(props) => (props.active ? "#fff" : "#606877")};
  transition: color 0.3s;
  cursor: pointer;
  font-weight: 700;
`;

const SearchSubordinate = () => {
  const dispatch = useDispatch();
  const {
    mySubordinateData,
    loader, // Get loader state
    errorMessage, // Get error message
    successMessage, // Get success message
    searchResults, // Get search results
  } = useSelector((state) => state.promotion); // Access the promotion slice state

  const [activeIndex, setActiveIndex] = useState(0);
  const pickerRef = useRef(null);
  const [openAll, setOpenAll] = useState(false);
  const [copyPopup, setCopyPopup] = useState(false);

  const [searchInput, setSearchInput] = useState(""); // Initialize as empty string
  const [currentPage, setCurrentPage] = useState(1); // For pagination
  const [searchLevels, setSearchLevels] = useState("All"); // Changed initial state
  const [selectedLevel, setSelectedLevel] = useState(null); // Actual number level

  // The 'searchDate' and 'nonDate' logic seems to be for another report,
  // not directly tied to the new searchUser API which doesn't take a date.
  // I'll keep them but note they might not be relevant for `searchUser`.
  const [searchDate, setSearchDate] = useState(null);
  const [nonDate, setNonDate] = useState(null);

  // Function to dispatch the searchUser thunk
  const performSearch = useCallback(
    (id, page) => {
      dispatch(searchUser({ id_user: id, page }));
    },
    [dispatch]
  );

  // Effect for initial load or when search input changes
  useEffect(() => {
    // Dispatch initial search when component mounts or searchInput changes
    // If you want to load all downline initially without a specific ID,
    // call performSearch(null, currentPage);
    // For this specific API, if searchInput is empty, it means "no specific user ID"
    // and it will fetch based on pagination.
    if (searchInput === "") {
        // Fetch paginated downline
        performSearch(null, currentPage);
    } else {
        // Fetch specific user by ID
        performSearch(searchInput, 1); // When searching by ID, reset to page 1
    }
  }, [searchInput, currentPage, performSearch]); // Depend on searchInput and currentPage

  // Clear messages after a short delay
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        dispatch(messageClear());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage, dispatch]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    // Reset page to 1 when search input changes
    setCurrentPage(1);
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
    setSearchLevels(items[index]); // This is for display
    setSelectedLevel(number); // This is the actual level to filter by locally

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
    handleClick(activeIndex); // Set initial active index and level
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
  }, [activeIndex, nonDate]); // Removed mySubordinateData, dispatch from dependencies

  // This is for the old myTeamReportSubordinate API, not the new searchUser
  const submitDate = (date) => {
    dispatch(myTeamReportSubordinate(date));
  };

  const handleDateSelect = (date) => {
    setSearchDate(date);
    setNonDate(date);
  };

  // This useEffect will still run for the `myTeamReportSubordinate` if you intend to keep it.
  useEffect(() => {
    if (searchDate) {
      submitDate(searchDate);
    }
  }, [searchDate]); // Depend on searchDate

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

  // Filter the searchResults based on selectedLevel (local filtering)
  const displayedData = searchResults?.filter((item) => {
    if (selectedLevel === null || selectedLevel === 0) { // 'All' or no specific level selected
      return true;
    }
    // Assuming 'user_level' is the property in your API response for level
    return item.user_level === selectedLevel;
  });

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

       

        {loader && <p className="text-white text-center mt-4">Loading...</p>}
        {/* {errorMessage && (
          <p className="text-red-500 text-center mt-4">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-green-500 text-center mt-4">{successMessage}</p>
        )} */}
      </div>

      <div className="container-section mt-5">
        {Array.isArray(displayedData) && displayedData.length > 0 ? (
          displayedData.map((item, i) => (
            <div className="nav-bg rounded-md mt-3 pb-7 px-3 pt-1" key={i}>
              <div className=" mt-3 flex justify-between items-center rounded-sm text-sm pb-2 border-b border-[--grey-200]">
                <span className="text-sm font-medium p-1 flex items-center">
                  UID: {item?.id_user}{" "}
                  <PiCopySimpleBold
                    className="ms-1 mt-[3px]"
                    onClick={() => copyToClipCode(item.id_user)}
                  />
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center text-white text-sm">
                <span className="text-sm font-medium">Level</span>
                <span className="text-sm font-medium ">{item?.user_level}</span>
              </div>

              <div className=" flex justify-between items-center mt-3 text-white text-sm">
                <span className="text-sm font-medium">Deposit Amount</span>
                <span className="text-sm font-medium color-yellow-200">
                  {item?.totalRecharge}
                </span>
              </div>
              <div className=" flex justify-between items-center mt-3 text-white text-sm">
                <span className="text-sm font-medium">Withdraw Amount</span>
                <span className="text-sm font-medium color-yellow-200">
                  {item?.totalWithdraw}
                </span>
              </div>
              <div className=" flex justify-between items-center mt-3 text-white text-sm">
                <span className="text-sm font-medium">Current Balance</span>
                <span className="fs-sm font-medium color-yellow-200">
                  {item?.money}
                </span>
              </div>
              {/* The API doesn't return totalBetAmount or totalCommsionsAmount or dates,
                  so I'm commenting them out or replacing with available data.
                  Adjust these lines based on your actual API response.
              <div className=" flex justify-between items-center mt-3 text-white text-sm">
                <span className="text-sm font-medium">Bet Amount</span>
                <span className="text-sm font-medium color-yellow-200">
                  {item.totalBetAmount}
                </span>
              </div>
              <div className=" flex justify-between items-center mt-3 text-white text-sm">
                <span className="text-sm font-medium">Commission</span>
                <span className="fs-sm font-medium color-yellow-200">
                  {item.totalCommsionsAmount}
                </span>
              </div>
              <div className=" flex justify-between items-center mt-3 text-white text-sm">
                <span className="text-sm font-medium">Time</span>
                <span className="text-sm font-medium flex items-center">
                  {formatDate(Number(item.dates))}{" "}
                </span>
              </div>
              */}
            </div>
          ))
        ) : (
          <p className="text-white text-center">No subordinate data found.</p>
        )}
      </div>

      

      <div className={openAll ? "overlay-section block" : "hidden"}></div>

      <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />
    </>
  );
};

export default SearchSubordinate;