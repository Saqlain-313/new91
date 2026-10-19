import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  IoIosArrowBack,
  IoIosArrowDropright,
  IoIosArrowForward,
} from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";

import "./5d.css";
import { PiCopySimpleBold } from "react-icons/pi";

import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { FaMinus, FaPlus } from "react-icons/fa";

import TimeImg from "../../assets/time.png";
import TimeActiveImg from "../../assets/time_aactive.png";

import { useDispatch, useSelector } from "react-redux";
import { userDetail } from "../../store/reducer/authReducer";
import debounce from "lodash/debounce";
import CopyCopmponent from "../../components/CopyCopmponent";
import { d5History, d5PeriodList } from "../../store/reducer/gameReducer";
import { d5Bet } from "../../store/reducer/betReducer";
import io from "socket.io-client";
import Audio1 from "../../assets/audio/di1.mp3";
import Audio2 from "../../assets/audio/di2.mp3";

import { IoCloseCircleOutline } from "react-icons/io5";
import { host } from "../../store/reducer/api";

import HeaderInfo from "../wingo/HeaderInfo";
import EmptyData from "../activity/EmptyData";

const WinImg = "https://i.ibb.co/TMnbvp0N/win-popup.png";
const LoseImg = "https://i.ibb.co/8zTQQmx/loss-popup.png";

const xData = [1, 5, 10, 20, 50, 100];
const socket = io(host);
const FiveD = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { d5PeriodListData, d5HistoryData } = useSelector(
    (state) => state.game
  );
  const { loader } = useSelector((state) => state.bet);
  const [activeTime, setActiveTime] = useState(1);
  const [activeX, setActiveX] = useState(0);
  const [messages, setMessage] = useState("");
  const [gameHistory, setGameHistory] = useState("ghistory");
  const [openPopup, setOpenPopup] = useState(false);
  const [openTime, setOpenTime] = useState(null);
  const [openHowtoPlay, setHowtoPlay] = useState(false);
  const [selectTab, setSelectTab] = useState("a");
  const [refershPopup, setRefeshPopup] = useState(false);
  const [betAlert, setBetAlert] = useState(false);
  const [pageno, setPage] = useState(1);
  const [pageto, setPageto] = useState(10);
  const [typeid1, setTypeid1] = useState(1);
  const [secondtime1, setSecondtime1] = useState(0);
  const [secondtime2, setSecondtime2] = useState(0);
  const [minute2, setMinute2] = useState(0);
  const [changeTime, setChangeTime] = useState(true);
  const [details, setDetails] = useState(null);
  const [copyPopup, setCopyPopup] = useState(false);
  const [winResult, setWinResult] = useState(null);
  const intervalRef = useRef(null);
  const [resultPopup, setResultPopup] = useState(false);
  const [activeVoice, setActiveVoice] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [spinClass, setSpinClass] = useState("");

  const handle5DMinut = async (data) => {
    setActiveTime(data);
    localStorage.setItem("d5minute", data);
    setTypeid1(data);
    setPage(1);
    setPageto(10);
    debouncedDispatch(dispatch, data, pageno, pageto);
    chartFunction();
  };

  const [isChecked, setIsChecked] = useState(true);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const [balance, setBalance] = useState(1);
  const [multiplier, setMultiplier] = useState(1);

  const balanceOptions = [1, 10, 100, 1000];

  const [selectedNumbers, setSelectedNumbers] = useState([]);

  const totalbalance = balance * selectedNumbers?.length;

  const numbers3 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const copyToClipboard = (number) => {
    navigator.clipboard
      .writeText(String(number))
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

  const handleRefersh = () => {
    dispatch(userDetail()).then((res) => {
      if (res.payload.status) {
        setRefeshPopup(true);
      }

      setTimeout(() => {
        setRefeshPopup(false);
      }, 2000);
    });
  };
  let selectBets = selectedNumbers?.join("");
  let selectBet;
  if (!isNaN(selectBets)) {
    selectBet = Number(selectBets);
  } else {
    selectBet = String(selectBets);
  }
  const handleBet = async () => {
    dispatch(
      d5Bet({ typeid1, selectTab, selectBet, balance, multiplier })
    ).then((res) => {
      setBetAlert(true);
      setOpenPopup(false);
      setMessage(res.payload.message);
      setBalance(1);
      setActiveX(0);
      setMultiplier(1);
      setSelectedNumbers([]);
      setTimeout(() => {
        setMessage("");
      }, 3000);
      debouncedDispatch(dispatch, typeid1, pageno, pageto);
      userDispatch(dispatch);
      setTimeout(() => {
        setBetAlert(false);
        setSelectedNumbers([]);
      }, 2000);
    });
  };

  const userDispatch = useCallback(
    debounce(() => {
      dispatch(userDetail());
    }, 500),
    []
  );

  const debouncedDispatch = useCallback(
    debounce((dispatch, typeid1, pageno, pageto) => {
      dispatch(d5PeriodList({ typeid1, pageno, pageto }));
      dispatch(d5History({ typeid1, pageno, pageto }));

      setSpinClass("");
      updateNumbers();
    }, 500),
    [dispatch, typeid1]
  );

  const debouncedDispatchResult = useCallback(
    debounce((dispatch, typeid1, pageno, pageto) => {
      dispatch(d5History({ typeid1, pageno, pageto })).then((res) => {
        if (res?.payload.data?.gameslist[0]?.status == 1) {
          setWinResult(true);
          userDispatch(dispatch);
        } else {
          setWinResult(false);
        }
      });
    }, 500),
    [dispatch, typeid1]
  );

  useEffect(() => {
    dispatch(userDetail());
    if (typeid1 !== null) {
      debouncedDispatch(dispatch, typeid1, pageno, pageto);
      openAudio();
    }

    setTimeout(() => {
      setRefeshPopup(false);
    }, 2000);
  }, []);

  const chartFunction = () => {
    const trendList = document.getElementById("trendList");

    // Clear any existing SVG lines
    const existingSvg = document.querySelector(".svg-line");
    if (existingSvg) {
      existingSvg.remove();
    }

    const activeElements = document.querySelectorAll(".active");
    const svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("class", "svg-line");

    for (let i = 0; i < activeElements.length - 1; i++) {
      const firstActive = activeElements[i];
      const secondActive = activeElements[i + 1];

      const line = document.createElementNS(svgns, "line");
      line.setAttribute(
        "x1",
        `${firstActive.offsetLeft + firstActive.offsetWidth / 2}px`
      );
      line.setAttribute(
        "y1",
        `${firstActive.offsetTop + firstActive.offsetHeight / 2}px`
      );
      line.setAttribute(
        "x2",
        `${secondActive.offsetLeft + secondActive.offsetWidth / 2}px`
      );
      line.setAttribute(
        "y2",
        `${secondActive.offsetTop + secondActive.offsetHeight / 2}px`
      );
      line.setAttribute("stroke", "red");
      line.setAttribute("stroke-width", "2");

      svg.appendChild(line);
    }
    trendList?.appendChild(svg);
  };

  useEffect(() => {
    if (gameHistory !== null) {
      chartFunction();
    }
  }, [gameHistory]);
  useEffect(() => {
    const handler = (msg) => {
      setPage(1);
      setPageto(10);
      // Realtime data

      if (msg?.data[1]?.period == d5HistoryData?.data?.gameslist[0]?.stage) {
        setResultPopup(true);
        debouncedDispatchResult(dispatch, typeid1, pageno, pageto);
        chartFunction();
      }

      if (typeid1 == 1 && Array.isArray(msg?.data) && msg.game == 1) {
        debouncedDispatch(dispatch, typeid1, pageno, pageto);
        setChangeTime(true);
        //console.log("server data received");
        chartFunction();
      }

      if (typeid1 == 3 && Array.isArray(msg?.data) && msg.game == 3) {
        debouncedDispatch(dispatch, typeid1, pageno, pageto);
        setChangeTime(true);
      }

      if (typeid1 == 5 && Array.isArray(msg?.data) && msg.game == 5) {
        debouncedDispatch(dispatch, typeid1, pageno, pageto);
        setChangeTime(true);
        chartFunction();
      }
      if (typeid1 == 10 && Array.isArray(msg?.data) && msg?.game == 10) {
        debouncedDispatch(dispatch, typeid1, pageno, pageto);
        setChangeTime(true);
        chartFunction();
      }
    };

    socket.on("data-server-5d", handler);

    return () => {
      socket.off("data-server-5d", handler);
    };
  }, [
    dispatch,
    activeVoice,
    debouncedDispatch,
    debouncedDispatchResult,
    d5HistoryData,
    selectedNumbers,
  ]);

  // time count

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (typeid1 === 1) {
      socket.current = io.connect(host); // Your server's URL
      // Define the event name directly based on typeid1
      const eventName = `timeUpdate_11`;

      socket.current.on(eventName, (data) => {
        if (!data) {
          return;
        }
        const { minute, secondtime1, secondtime2 } = data;

        setMinute2(minute);
        setSecondtime1(secondtime1);
        setSecondtime2(secondtime2);
        // Handle open time logic based on received data
        if (
          minute === 0 &&
          secondtime1 === 0 &&
          secondtime2 <= 5 &&
          secondtime2 >= 1
        ) {
          setOpenTime(true);
          setOpenPopup(false);
          if (activeVoice) playAudio1();
        } else {
          setOpenTime(false);
        }

        if (minute === 0 && secondtime1 === 5 && secondtime2 === 9) {
          if (activeVoice) playAudio2();
        }
      });

      // Cleanup function when the component unmounts or dependencies change
      return () => {
        socket.current.off(eventName); // Cleanup socket listener
        // Optionally, disconnect the socket if needed
        socket.current.disconnect(); // Disconnect socket when unmounting
      };
    }

    if (typeid1 == 3) {
      socket.current = io.connect(host); // Your server's URL
      // Define the event name directly based on typeid1
      const eventName = `timeUpdate_3`;
      socket.current.on(eventName, (data) => {
        if (!data) {
          return;
        }
        const { minute, secondtime1, secondtime2 } = data;

        setMinute2(minute);
        setSecondtime1(secondtime1);
        setSecondtime2(secondtime2);
        // Handle open time logic based on received data
        if (
          minute === 0 &&
          secondtime1 === 0 &&
          secondtime2 <= 5 &&
          secondtime2 >= 1
        ) {
          setOpenTime(true);
          setOpenPopup(false);
          if (activeVoice) playAudio1();
        } else {
          setOpenTime(false);
        }

        if (minute === 2 && secondtime1 === 5 && secondtime2 === 9) {
          if (activeVoice) playAudio2();
        }
      });

      // Cleanup function when the component unmounts or dependencies change
      return () => {
        socket.current.off(eventName); // Cleanup socket listener
        // Optionally, disconnect the socket if needed
        socket.current.disconnect(); // Disconnect socket when unmounting
      };
    }
    if (typeid1 == 5) {
      socket.current = io.connect(host); // Your server's URL
      // Define the event name directly based on typeid1
      const eventName = `timeUpdate_5`;
      socket.current.on(eventName, (data) => {
        if (!data) {
          return;
        }
        const { minute, secondtime1, secondtime2 } = data;

        setMinute2(minute);
        setSecondtime1(secondtime1);
        setSecondtime2(secondtime2);
        // Handle open time logic based on received data
        if (
          minute === 0 &&
          secondtime1 === 0 &&
          secondtime2 <= 5 &&
          secondtime2 >= 1
        ) {
          setOpenTime(true);
          setOpenPopup(false);
          if (activeVoice) playAudio1();
        } else {
          setOpenTime(false);
        }

        if (minute === 4 && secondtime1 === 5 && secondtime2 === 9) {
          if (activeVoice) playAudio2();
        }
      });

      // Cleanup function when the component unmounts or dependencies change
      return () => {
        socket.current.off(eventName); // Cleanup socket listener
        // Optionally, disconnect the socket if needed
        socket.current.disconnect(); // Disconnect socket when unmounting
      };
    }
    if (typeid1 == 10) {
      socket.current = io.connect(host); // Your server's URL
      // Define the event name directly based on typeid1
      const eventName = `timeUpdate_10`;
      socket.current.on(eventName, (data) => {
        if (!data) {
          return;
        }
        const { minute, secondtime1, secondtime2 } = data;

        setMinute2(minute);
        setSecondtime1(secondtime1);
        setSecondtime2(secondtime2);
        // Handle open time logic based on received data
        if (
          minute === 0 &&
          secondtime1 === 0 &&
          secondtime2 <= 5 &&
          secondtime2 >= 1
        ) {
          setOpenTime(true);
          setOpenPopup(false);
          if (activeVoice) playAudio1();
        } else {
          setOpenTime(false);
        }
        if (minute === 0 && secondtime1 === 5 && secondtime2 === 9) {
          if (activeVoice) playAudio2();
        }
      });

      // Cleanup function when the component unmounts or dependencies change
      return () => {
        socket.current.off(eventName); // Cleanup socket listener
        // Optionally, disconnect the socket if needed
        socket.current.disconnect(); // Disconnect socket when unmounting
      };
    }
    // Cleanup on component unmount or when typeid1 changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        if (socket.current) {
          socket.current.disconnect(); // Disconnect if socket was established
          socket.current = null; // Clean up socket reference
        }
      }
    };
  }, [typeid1, activeVoice]);

  const handleSelectNumber3 = (input) => {
    setSelectedNumbers((prevSelected) => {
      const isNumber = typeof input === "number";
      const isCharacter = typeof input === "string" && input.length === 1;

      if (isNumber) {
        // Remove all strings and add the selected number
        const numbersOnly = prevSelected.filter((n) => typeof n === "number");
        return numbersOnly.includes(input)
          ? numbersOnly.filter((n) => n !== input)
          : [...numbersOnly, input];
      } else if (isCharacter) {
        // Remove all numbers and characters and add the selected character
        let charactersOnly = prevSelected.filter(
          (n) => typeof n === "string" && n.length === 1
        );
        charactersOnly = [];

        const isCharacterSelected = charactersOnly.includes(input);

        if (isCharacterSelected) {
          return charactersOnly.filter((n) => n !== input);
        } else if (input === "s") {
          return ["s"];
        } else if (input === "b") {
          return ["b"];
        } else if (input === "l") {
          return ["l"];
        } else if (input === "c") {
          return ["c"];
        } else {
          return [input];
        }
      }
      return prevSelected;
    });

    setTimeout(() => {
      setOpenPopup(true);
    }, 100);
  };

  const extractNumber = (str) => {
    const match = str?.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  };

  const handleVoice = () => {
    const newVoiceState = !activeVoice;
    setActiveVoice(newVoiceState);
    localStorage.setItem("voice", newVoiceState);
  };

  useEffect(() => {
    const d5minutes = localStorage.getItem("d5minute");
    if (d5minutes !== null) {
      setActiveTime(d5minutes);
      setTypeid1(extractNumber(d5minutes));
    }
    const voiceState = localStorage.getItem("voice");
    if (voiceState !== null) {
      setActiveVoice(JSON.parse(voiceState));
    }
  }, [userDispatch, dispatch, activeTime]);

  const audio1Ref = useRef(new Audio(Audio1));
  const audio2Ref = useRef(new Audio(Audio2));

  const openAudio = () => {
    audio1Ref.current.muted = true;
    audio1Ref.current.play().catch((error) => {
      console.error("Error playing audio1:", error);
    });
    audio2Ref.current.muted = true;
    audio2Ref.current.play().catch((error) => {
      console.error("Error playing audio2:", error);
    });
  };

  const playAudio1 = () => {
    audio1Ref.current.muted = false;
    //console.log("object,", audio1Ref.current.play());
    audio1Ref.current.play().catch((error) => {
      console.error("Error playing audio1:", error);
    });
  };

  const playAudio2 = () => {
    audio2Ref.current.muted = false;
    audio2Ref.current.play().catch((error) => {
      console.error("Error playing audio2:", error);
    });
  };

  const fetchNewData = async (pageno, pageto) => {
    await dispatch(d5History({ typeid1, pageno, pageto }));
    await dispatch(d5PeriodList({ typeid1, pageno, pageto }));
  };

  const handleIncrease = async () => {
    const newPageNo = pageno + 10;
    const newPageTo = pageto + 10;
    setPage(newPageNo);
    setPageto(newPageTo);
    await fetchNewData(newPageNo, newPageTo);
  };

  const handleDecrease = async () => {
    if (pageno > 10) {
      const newPageNo = pageno - 10;
      const newPageTo = pageto - 10;
      setPage(newPageNo);
      setPageto(newPageTo);
      await fetchNewData(newPageNo, newPageTo);
    }
  };

  const handleDetail = (i) => {
    if (details === i) {
      return setDetails(null);
    }
    setDetails(i);
  };

  const mappings = {
    s: "small",
    l: "odd",
    c: "even",
    b: "big",
  };
  // chart numbers
  const initialNumbers = [4, 16, 3, 14, 18, 18, 1, 9, 7, 22];
  const initialNumbers2 = [4, 1, 9, 14, 18, 11, 10, 9, 12, 22];
  const initialNumbers3 = [4, 16, 3, 14, 18, 18, 1, 9, 7, 22];
  const initialNumbers4 = [4, 16, 3, 14, 18, 18, 1, 9, 7, 22];
  const [numbers, setNumbers] = useState(initialNumbers);
  const [number2, setNumber2] = useState(initialNumbers2);
  const [number3, setNumber3] = useState(initialNumbers3);
  const [number4, setNumber4] = useState(initialNumbers4);

  const getRandomNumbers = (length, max) => {
    return Array.from({ length }, () => Math.floor(Math.random() * max) + 1);
  };

  const updateNumbers = () => {
    const newNumbers = getRandomNumbers(numbers.length, 30); // Generate random numbers up to 30
    setNumbers(newNumbers);
    const newNumbers2 = getRandomNumbers(number2.length, 20); // Generate random numbers up to 30
    setNumber2(newNumbers2);
    const newNumbers3 = getRandomNumbers(number3.length, 25); // Generate random numbers up to 30
    setNumber3(newNumbers3);
    const newNumbers4 = getRandomNumbers(number4.length, 29); // Generate random numbers up to 30
    setNumber4(newNumbers4);
  };
  const handleClose = () => {
    setWinResult(null);
    setResultPopup(false);
  };

  useEffect(() => {
    if (resultPopup && (winResult === true || winResult === false)) {
      const timer = setTimeout(() => {
        handleClose(); // 5 sec ke baad popup close
      }, 5000);

      // Cleanup: agar popup close ho jaye ya component unmount ho to timer clear ho
      return () => clearTimeout(timer);
    }
  }, [resultPopup, winResult]);

  return (
    <>
      <HeaderInfo
        handleRefersh={handleRefersh}
        money={Number(userInfo?.money_user).toFixed(2)}
        handleVoice={handleVoice}
        activeVoice={activeVoice}
      />
      <div className="container-section relative mt-[-75px]">
        {/* time tabs */}
        <div className="grid grid-cols-12 bg-[#fff] rounded-xl">
          <div
            className={`col-span-3 cursor-pointer  flex items-center flex-col justify-center py-2 ${
              activeTime == 1 ? "blue-linear2" : ""
            } rounded-xl`}
            onClick={() => handle5DMinut(1)}
          >
            <img
              src={activeTime == 1 ? TimeActiveImg : TimeImg}
              alt=""
              className="w-12"
            />
            <p
              className={`text-center  fs-sm font-sans leading-4 ${
                activeTime == 1 ? "text-white" : "gray-100"
              }`}
            >
              5D Lotre <br /> 1Min
            </p>
          </div>
          <div
            className={`col-span-3  cursor-pointer flex items-center flex-col justify-center py-2  rounded-xl  ${
              activeTime == "3" ? "blue-linear2" : ""
            }`}
            onClick={() => handle5DMinut("3")}
          >
            <img
              src={activeTime == "3" ? TimeActiveImg : TimeImg}
              alt=""
              className="w-12"
            />
            <p
              className={`text-center  fs-sm font-sans leading-4 ${
                activeTime == "3" ? "text-white" : "gray-100"
              }`}
            >
              5D Lotre <br /> 3Min
            </p>
          </div>
          <div
            className={`col-span-3  cursor-pointer flex items-center flex-col justify-center py-2  rounded-xl  ${
              activeTime == "5" ? "blue-linear2" : ""
            }`}
            onClick={() => handle5DMinut("5")}
          >
            <img
              src={activeTime == "5" ? TimeActiveImg : TimeImg}
              alt=""
              className="w-12"
            />
            <p
              className={`text-center  fs-sm font-sans leading-4 ${
                activeTime == "5" ? "text-white" : "gray-100"
              }`}
            >
              5D Lotre <br /> 5Min
            </p>
          </div>
          <div
            className={`col-span-3  cursor-pointer flex items-center flex-col justify-center py-2  rounded-xl  ${
              activeTime == "10" ? "blue-linear2" : ""
            }`}
            onClick={() => handle5DMinut("10")}
          >
            <img
              src={activeTime == "10" ? TimeActiveImg : TimeImg}
              alt=""
              className="w-12"
            />
            <p
              className={`text-center  fs-sm font-sans leading-4 ${
                activeTime == "10" ? "text-white" : "gray-100"
              }`}
            >
              5D Lotre <br /> 10Min
            </p>
          </div>
        </div>

        <div className="bg-light p-3 mt-5 rounded-md">
          <div className="flex justify-between">
            <div>
              <span className="text-sm gray-100">Lottery</span> <br />
              <span className="text-sm gray-100">Results</span> <br />
            </div>
            <div className="flex ">
              <div className="grid grid-cols-10 gap-2">
                {Array.isArray(d5PeriodListData?.data?.gameslist) &&
                  d5PeriodListData?.data?.gameslist[0]?.result
                    ?.split("")
                    .map((data, i) => (
                      <div
                        className="col-span-2 flex justify-center items-center flex-col text-whites"
                        key={i}
                      >
                        <div className="w-9 flex justify-center items-center h-9 bg-[#E6EBF0] rounded-full">
                          {data}
                        </div>
                        <p className="text-center text-sm text-whites">
                          {String.fromCharCode(65 + i)}
                        </p>
                      </div>
                    ))}
              </div>
              <span className="text-whites mx-1  h-9 justify-center items-center flex">
                ={" "}
              </span>
              <div className="w-9 flex justify-center items-center text-sm h-9 bg-color-l2 text-white rounded-full">
                {Array.isArray(d5PeriodListData?.data?.gameslist) &&
                  d5PeriodListData?.data?.gameslist[0]?.result
                    ?.split("")
                    .reduce((acc, digit) => acc + parseInt(digit), 0)}
              </div>
            </div>
          </div>
        </div>

        {/* wingo tim */}
        <div className="bg-light relative p-3 mt-5 rounded-md">
          <div className="flex justify-between  rounded-lg ">
            <div>
              <div className="flex items-center">
                <span className="text-sm gray-100">Period</span>
                <button
                  className="border flex items-center ms-2 border-[--bg-color-l] color-l justify-center rounded-full px-4 py-[1px]"
                  onClick={() => setHowtoPlay(true)}
                >
                  <svg
                    data-v-3e4c6499=""
                    className="color-l"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 36 36"
                    fill="none"
                  >
                    <path
                      data-v-3e4c6499=""
                      d="M23.67 3H12.33C6.66 3 5.25 4.515 5.25 10.56V27.45C5.25 31.44 7.44 32.385 10.095 29.535L10.11 29.52C11.34 28.215 13.215 28.32 14.28 29.745L15.795 31.77C17.01 33.375 18.975 33.375 20.19 31.77L21.705 29.745C22.785 28.305 24.66 28.2 25.89 29.52C28.56 32.37 30.735 31.425 30.735 27.435V10.56C30.75 4.515 29.34 3 23.67 3ZM11.67 18C10.845 18 10.17 17.325 10.17 16.5C10.17 15.675 10.845 15 11.67 15C12.495 15 13.17 15.675 13.17 16.5C13.17 17.325 12.495 18 11.67 18ZM11.67 12C10.845 12 10.17 11.325 10.17 10.5C10.17 9.675 10.845 9 11.67 9C12.495 9 13.17 9.675 13.17 10.5C13.17 11.325 12.495 12 11.67 12ZM24.345 17.625H16.095C15.48 17.625 14.97 17.115 14.97 16.5C14.97 15.885 15.48 15.375 16.095 15.375H24.345C24.96 15.375 25.47 15.885 25.47 16.5C25.47 17.115 24.96 17.625 24.345 17.625ZM24.345 11.625H16.095C15.48 11.625 14.97 11.115 14.97 10.5C14.97 9.885 15.48 9.375 16.095 9.375H24.345C24.96 9.375 25.47 9.885 25.47 10.5C25.47 11.115 24.96 11.625 24.345 11.625Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                  <span className="fs-sm">How to play</span>
                </button>
              </div>
              <h3 className="heading-h5 text-lg font-medium mt-2 text-whites">
                {d5PeriodListData?.period}
              </h3>
            </div>
            {/* period */}
            <div className="flex flex-col items-end">
              <p className="text-sm gray-100">Time remaining</p>
              <div className="flex items-center mt-2">
                <span className="bg-[#E6EBF0] text-lg mx-[2px] font-semibold w-5 text-center color-l rounded">
                  0
                </span>
                <span className="bg-[#E6EBF0] text-lg mx-[2px] font-semibold w-5 text-center color-l rounded">
                  {minute2}
                </span>
                <span className=" bg-light px-1 text-lg mx-[1px] font-semibold color-l">
                  :
                </span>
                <span className="bg-[#E6EBF0] text-lg mx-[2px] font-semibold w-5 text-center color-l rounded">
                  {secondtime1}
                </span>
                <span className="bg-[#E6EBF0] text-lg mx-[2px] font-semibold w-5 text-center color-l rounded">
                  {secondtime2}
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bgs-green d5tl-box mt-5">
              <div className="box">
                {Array.isArray(d5PeriodListData?.data?.gameslist) &&
                  d5PeriodListData?.data?.gameslist[0]?.result
                    ?.split("")
                    .map((data, i) => (
                      <div className={`slot-column `} key={i}>
                        <div className={`slot-transform ${spinClass}`}>
                          {[
                            -2, -1, 0, 1, 2, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1,
                            2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8,
                            9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,

                            -2, -1, 0,
                          ].map((num, index) => (
                            <div key={index} className="slot-num">
                              {num === 0 ? data : num}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
              </div>
            </div>
            {/* <button onClick={handleSpin} disabled={isSpinning}>
                            Spin
                        </button> */}

            <div className="flex items-center mt-4 border-b border-[--gray-400]">
              <button
                className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2 rounded-t-md ${
                  selectTab == "a"
                    ? " bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-blues text-whites"
                }`}
                onClick={() => setSelectTab("a")}
              >
                A
              </button>
              <button
                className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2 rounded-t-md ${
                  selectTab == "b"
                    ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-blues text-whites"
                }`}
                onClick={() => {
                  setSelectTab("b");
                }}
              >
                B
              </button>
              <button
                className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2 rounded-t-md ${
                  selectTab == "c"
                    ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-blues text-whites"
                }`}
                onClick={() => {
                  setSelectTab("c");
                }}
              >
                C
              </button>
              <button
                className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2  rounded-t-md ${
                  selectTab == "d"
                    ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-blues text-whites"
                }`}
                onClick={() => {
                  setSelectTab("d");
                }}
              >
                D
              </button>
              <button
                className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2  rounded-t-md ${
                  selectTab == "e"
                    ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-blues text-whites"
                }`}
                onClick={() => {
                  setSelectTab("e");
                }}
              >
                E
              </button>
              <button
                className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2  rounded-t-md ${
                  selectTab == "f"
                    ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-blues text-whites"
                }`}
                onClick={() => {
                  setSelectTab("f");
                }}
              >
                F
              </button>
              <button
                className={` text-md font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2  rounded-t-md ${
                  selectTab == "total"
                    ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-blues text-whites"
                }`}
                onClick={() => {
                  setSelectTab("total");
                }}
              >
                SUM
              </button>
            </div>
            {selectTab != "total" ? (
              <div>
                <div className="grid grid-cols-12 mt-3 gap-2 text-white ">
                  <div
                    className={`col-span-3 cursor-pointer  rounded-md font-medium text-base p-1 flex justify-between items-center ${
                      selectedNumbers.includes("b")
                        ? "bg-yellow text-white"
                        : " bg-blues text-whites"
                    }`}
                    onClick={() => handleSelectNumber3("b")}
                  >
                    <span>Big</span> <span>1.98</span>
                  </div>
                  <div
                    className={`col-span-3 cursor-pointer  rounded-md font-medium text-base p-1 flex justify-between items-center ${
                      selectedNumbers.includes("s")
                        ? "bgs-blue-500 text-white"
                        : " bg-blues text-whites"
                    }`}
                    onClick={() => handleSelectNumber3("s")}
                  >
                    <span>Small</span> <span>1.98</span>
                  </div>
                  <div
                    className={`col-span-3 cursor-pointer  rounded-md font-medium text-base p-1 flex justify-between items-center ${
                      selectedNumbers.includes("l")
                        ? "bgs-red-200 text-white"
                        : " bg-blues text-whites"
                    }`}
                    onClick={() => handleSelectNumber3("l")}
                  >
                    <span>Odd</span> <span>1.98</span>
                  </div>
                  <div
                    className={`col-span-3 cursor-pointer  rounded-md font-medium text-base p-1 flex justify-between items-center ${
                      selectedNumbers.includes("c")
                        ? "bgs-green text-white"
                        : " bg-blues text-whites"
                    }`}
                    onClick={() => handleSelectNumber3("c")}
                  >
                    <span>Even</span> <span>1.98</span>
                  </div>
                </div>
                <div className="grid grid-cols-10 gap-2 ball-section mt-3">
                  {numbers3.map((number, i) => (
                    <div
                      className="col-span-2 flex flex-col justify-center items-center num "
                      key={i}
                    >
                      <div
                        className={`flex flex-col justify-center items-center cursor-pointer w-10 h-10 rounded-full border border-[--gray-400] ${
                          selectedNumbers.includes(number)
                            ? "bgs-blue-500 text-white"
                            : "gray-100"
                        }`}
                        onClick={() => handleSelectNumber3(number)}
                      >
                        <div className="text">{number}</div>
                      </div>
                      <div className="fs-sm gray-100">9</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-12 mt-3 gap-2 ">
                <div
                  className={`col-span-3 cursor-pointer rounded-md font-medium text-base p-1 flex justify-between items-center ${
                    selectedNumbers.includes("b")
                      ? "bg-yellow text-white"
                      : "text-whites bg-color-l"
                  }`}
                  onClick={() => handleSelectNumber3("b")}
                >
                  <span>Big</span> <span>1.98</span>
                </div>
                <div
                  className={`col-span-3 cursor-pointer  rounded-md font-medium text-base p-1 flex justify-between items-center ${
                    selectedNumbers.includes("s")
                      ? "bgs-blue-500 text-white"
                      : "text-whites bg-color-l"
                  }`}
                  onClick={() => handleSelectNumber3("s")}
                >
                  <span>Small</span> <span>1.98</span>
                </div>
                <div
                  className={`col-span-3 cursor-pointer  rounded-md font-medium text-base p-1 flex justify-between items-center ${
                    selectedNumbers.includes("l")
                      ? "bgs-red-200 text-white"
                      : "text-whites bg-color-l"
                  }`}
                  onClick={() => handleSelectNumber3("l")}
                >
                  <span>Odd</span> <span>1.98</span>
                </div>
                <div
                  className={`col-span-3 cursor-pointer  rounded-md font-medium text-base p-1 flex justify-between items-center ${
                    selectedNumbers.includes("c")
                      ? "bgs-green text-white"
                      : "text-whites bg-color-l"
                  }`}
                  onClick={() => handleSelectNumber3("c")}
                >
                  <span>Even</span> <span>1.98</span>
                </div>
              </div>
            )}

            {openTime && (
              <div className="flex items-center justify-center absolute z-10 m-auto top-0 bottom-0 left-0 right-0 ">
                <span className="text-[120px] colors bg-popup-nav text-blue font-medium rounded-xl  w-28  h-[150px] flex items-center justify-center mr-5">
                  0
                </span>
                <span className="ms-5 text-[120px] colors bg-popup-nav text-blue font-medium rounded-xl  w-28  h-[150px] flex items-center justify-center">
                  {secondtime2}
                </span>
              </div>
            )}
          </div>
          <div className={openTime ? "overlay-section2 block" : "hidden"}></div>
        </div>
        {/* bet period section */}

        {/* game history */}

        <div className="grid mt-5 grid-cols-12 gap-3">
          <div className="col-span-4 ">
            <button
              className={` flex justify-center items-center h-full w-full py-2 border-none rounded-lg ${
                gameHistory == "ghistory"
                  ? " text-base blue-linear text-white font-medium "
                  : "bg-light text-sm gray-100"
              }`}
              onClick={() => setGameHistory("ghistory")}
            >
              Game history
            </button>
          </div>
          <div className="col-span-4 ">
            <button
              className={` flex justify-center items-center h-full w-full py-2 border-none rounded-lg ${
                gameHistory == "chart"
                  ? "text-base blue-linear  text-white font-medium "
                  : "bg-light text-sm gray-100"
              }`}
              onClick={() => setGameHistory("chart")}
            >
              Chart
            </button>
          </div>
          <div className="col-span-4 ">
            <button
              className={` flex justify-center items-center h-full w-full py-2 border-none rounded-lg ${
                gameHistory == "mhistory"
                  ? " text-base blue-linear  text-white font-medium "
                  : "bg-light text-sm gray-100"
              }`}
              onClick={() => setGameHistory("mhistory")}
            >
              My history
            </button>
          </div>
        </div>
        {/* result game history */}

        {gameHistory == "ghistory" && (
          <div>
            <div className="grid grid-cols-12 nav-bg rounded-t-md p-2 text-white mt-5">
              <div className="col-span-5 flex text-center justify-center">
                <h5 className="heading-h5 text-base">Period</h5>
              </div>

              <div className="col-span-5  text-center justify-center">
                <h5 className="heading-h5 text-base">Result</h5>
              </div>
              <div className="col-span-2  text-center justify-center">
                <h5 className="heading-h5 text-base">Total</h5>
              </div>
            </div>

            {Array.isArray(d5PeriodListData?.data?.gameslist) &&
              d5PeriodListData?.data?.gameslist.map((item, i) => (
                <div className="grid grid-cols-12 bg-light p-2 py-3" key={i}>
                  <div className="col-span-5 flex text-center justify-center items-center">
                    <span className="text-sm text-whites relative flex  ">
                      {item.period}
                    </span>
                  </div>
                  <div className="col-span-5 flex text-center justify-center  items-center">
                    {item?.result?.split("").map((data, i) => (
                      <div
                        key={i}
                        className="text-sm text-whites w-6 h-6 flex justify-center items-center border-2 rounded-full  border-[--gray-400]"
                      >
                        {data}
                      </div>
                    ))}
                  </div>
                  <div className="col-span-2  text-center flex justify-center m-auto  items-center">
                    <div className="text-sm w-6 h-6 flex justify-center items-center  rounded-full bg-color-l2 text-white">
                      {String(item.result)
                        .split("")
                        .reduce((acc, digit) => acc + parseInt(digit), 0)}
                    </div>
                  </div>
                </div>
              ))}
            <div className="bg-light p-6 flex items-center justify-center mt-5">
              <button
                className={`rounded-md p-2 mr-4 ${
                  pageto / 10 >= 2
                    ? "bg-[#E6EBF0] text-whites"
                    : "bg-blues text-whites"
                } `}
                disabled={pageto / 10 > 1 ? false : true}
                onClick={handleDecrease}
              >
                <Link>
                  {" "}
                  <IoIosArrowBack className="text-lg" />
                </Link>
              </button>
              <span className="fs-sm text-whites">
                {pageto / 10}/{d5PeriodListData?.page}
              </span>
              <button
                className={`rounded-md p-2 ms-4 ${
                  d5PeriodListData?.page
                    ? "bg-color-l2 text-white"
                    : "bg-[#E6EBF0] text-whites"
                } `}
                disabled={d5PeriodListData?.page > pageto / 10 ? false : true}
                onClick={handleIncrease}
              >
                <Link>
                  {" "}
                  <IoIosArrowForward className="text-lg" />
                </Link>
              </button>
            </div>
          </div>
        )}

        {gameHistory == "chart" && (
          <div>
            <div className="chart-section mt-5  rounded-t-md">
              <div className="bg-light pb-5">
                <div className="flex items-center mt-4 border-b border-[--gray-400] text-white">
                  <button
                    className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2 rounded-t-md ${
                      selectTab == "a"
                        ? " bg-color-l2 text-white after:bg-custom-radial-gradient"
                        : "bg-[#E6EBF0] text-whites"
                    }`}
                    onClick={() => setSelectTab("a")}
                  >
                    A
                  </button>
                  <button
                    className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2 rounded-t-md ${
                      selectTab == "b"
                        ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                        : "bg-[#E6EBF0] text-whites"
                    }`}
                    onClick={() => {
                      setSelectTab("b");
                    }}
                  >
                    B
                  </button>
                  <button
                    className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2 rounded-t-md ${
                      selectTab == "c"
                        ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                        : "bg-[#E6EBF0] text-whites"
                    }`}
                    onClick={() => {
                      setSelectTab("c");
                    }}
                  >
                    C
                  </button>
                  <button
                    className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2  rounded-t-md ${
                      selectTab == "d"
                        ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                        : "bg-[#E6EBF0] text-whites"
                    }`}
                    onClick={() => {
                      setSelectTab("d");
                    }}
                  >
                    D
                  </button>
                  <button
                    className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2  rounded-t-md ${
                      selectTab == "e"
                        ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                        : "bg-[#E6EBF0] text-whites"
                    }`}
                    onClick={() => {
                      setSelectTab("e");
                    }}
                  >
                    E
                  </button>
                  <button
                    className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2  rounded-t-md ${
                      selectTab == "f"
                        ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                        : "bg-[#E6EBF0] text-whites"
                    }`}
                    onClick={() => {
                      setSelectTab("f");
                    }}
                  >
                    F
                  </button>
                </div>
                <div className="mx-2 mt-2">
                  <p className="text-sm text-whites font-normal font-sans">
                    Static (last 100 Periods)
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-whites">Missing</p>
                    <div className="grid grid-cols-10 gap-2">
                      {numbers.map((number, index) => (
                        <span
                          key={index}
                          className="col-span-1 flex justify-center items-center fs-sm text-whites"
                        >
                          {number}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-whites">Avg Missing</p>
                    <div className="grid grid-cols-10 gap-2">
                      {number2.map((number, index) => (
                        <span
                          key={index}
                          className="col-span-1 flex justify-center items-center fs-sm text-whites"
                        >
                          {number}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-whites">Frequency</p>
                    <div className="grid grid-cols-10 gap-2">
                      {number3.map((number, index) => (
                        <span
                          key={index}
                          className="col-span-1 flex justify-center items-center fs-sm text-whites"
                        >
                          {number}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-whites">Max consecutive</p>
                    <div className="grid grid-cols-10 gap-2">
                      {number4.map((number, index) => (
                        <span
                          key={index}
                          className="col-span-1 flex justify-center items-center fs-sm text-whites"
                        >
                          {number}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="container2 bg-light text-white mt-5">
                <div className="flex items-center nav-bg justify-evenly rounded-t-md py-2">
                  <h5 className="heading-h5 text-base font-semibold ">
                    Period
                  </h5>
                  <h5 className="heading-h5 text-base font-semibold ">
                    Number
                  </h5>
                </div>
                <div className="trend-record  w-full">
                  <ul id="trendList" className="w-full mt-5 fivedlist">
                    {Array.isArray(d5PeriodListData?.data?.gameslist) &&
                      d5PeriodListData?.data?.gameslist.map((item, i) => (
                        <li
                          key={i}
                          className="flex justify-between items-center"
                        >
                          <div className="first fs-sm text-whites ">
                            {item?.period}
                          </div>
                          <div className="sec text-sm text-whites ms-2">
                            <span
                              className={`${
                                item?.result?.split("")[0] == 0
                                  ? "active bg-red-voilet"
                                  : ""
                              }`}
                            >
                              0
                            </span>
                            <span
                              className={`${
                                item?.result?.split("")[0] == 1
                                  ? "active bgs-green"
                                  : ""
                              }`}
                            >
                              1
                            </span>
                            <span
                              className={`${
                                item?.result?.split("")[0] == 2
                                  ? "active bgs-red-200"
                                  : ""
                              }`}
                            >
                              2
                            </span>
                            <span
                              className={`${
                                item?.result?.split("")[0] == 3
                                  ? "active bgs-green"
                                  : ""
                              }`}
                            >
                              3
                            </span>
                            <span
                              className={`${
                                item?.result?.split("")[0] == 4
                                  ? "active bgs-red-200"
                                  : ""
                              }`}
                            >
                              4
                            </span>
                            <span
                              className={`${
                                item?.result?.split("")[0] == 5
                                  ? "active bg-green-voilet"
                                  : ""
                              }`}
                            >
                              5
                            </span>
                            <span
                              className={`${
                                item?.result?.split("")[0] == 6
                                  ? "active bgs-red-200"
                                  : ""
                              }`}
                            >
                              6
                            </span>
                            <span
                              className={`${
                                item?.result?.split("")[0] == 7
                                  ? "active bgs-green"
                                  : ""
                              }`}
                            >
                              7
                            </span>
                            <span
                              className={`${
                                item?.result?.split("")[0] == 8
                                  ? "active bgs-red-200"
                                  : ""
                              }`}
                            >
                              8
                            </span>
                            <span
                              className={`${
                                item?.result?.split("")[0] == 9
                                  ? "active bgs-green"
                                  : ""
                              }`}
                            >
                              9
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div
                              className={`third  ${
                                item?.result?.split("")[0] > 4
                                  ? "bg-yellow"
                                  : "bgs-blue-500"
                              }`}
                            >
                              {item?.result?.split("")[0] > 4 ? "H" : "L"}{" "}
                            </div>
                            <div
                              className={`third  ${
                                item?.result?.split("")[0] % 2
                                  ? "bgs-green"
                                  : "bgs-blue-500"
                              }`}
                            >
                              {item?.result?.split("")[0] % 2 ? "O" : "E"}{" "}
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-light p-6 flex items-center justify-center mt-5">
              <button
                className={`rounded-md p-2 mr-4 ${
                  pageto / 10 >= 2
                    ? "bg-[#E6EBF0] text-white"
                    : "bg-blues text-whites"
                } `}
                disabled={pageto / 10 > 1 ? false : true}
                onClick={handleDecrease}
              >
                <Link>
                  {" "}
                  <IoIosArrowBack className="text-lg" />
                </Link>
              </button>
              <span className="fs-sm text-whites">
                {pageto / 10}/{d5PeriodListData?.page}
              </span>
              <button
                className={`rounded-md p-2 ms-4 ${
                  d5PeriodListData?.page
                    ? "bg-color-l2 text-white"
                    : "bg-[#E6EBF0]"
                } `}
                disabled={d5PeriodListData?.page > pageto / 10 ? false : true}
                onClick={handleIncrease}
              >
                <Link>
                  {" "}
                  <IoIosArrowForward className="text-lg" />
                </Link>
              </button>
            </div>
          </div>
        )}

        {gameHistory == "mhistory" && (
          <div className="bg-light p-2 py-3 mt-5">
            <div className="flex items-end justify-end mb-3">
              <Link className="text-blue fs-sm border rounded-lg border-[#F5CC2C] px-3 py-1 flex item-center items-end ">
                Details <IoIosArrowDropright className="mb-[2px]" />
              </Link>
            </div>
            {d5HistoryData?.data?.gameslist?.length > 0 ? (
              Array.isArray(d5HistoryData?.data?.gameslist) &&
              d5HistoryData?.data?.gameslist?.map((item, i) => (
                <div key={i}>
                  <div
                    className="  flex items-center justify-between"
                    onClick={() => handleDetail(i)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`flex justify-center items-center h-10 w-10 rounded-lg mr-2 
                              ${
                                item.bet.split(",")[0] == "c"
                                  ? "bgs-green"
                                  : item.bet.split(",")[0] == "l"
                                  ? "bgs-red-200"
                                  : item.bet.split(",")[0] == "b"
                                  ? "color-yellow-bg-200"
                                  : "bgs-blue-500"
                              }
                              ${
                                /* 🔹 font‑size  */
                                ["b", "s", "c", "l"].includes(
                                  item.bet.split(",")[0]
                                )
                                  ? "text-[14px]"
                                  : "text-base"
                              }
                               `}
                      >
                        {item.bet.split(",")[0] == "c"
                          ? "Even"
                          : item.bet.split(",")[0] == "l"
                          ? "Odd"
                          : item.bet.split(",")[0] == "b"
                          ? "Big"
                          : item.bet.split(",")[0] == "s"
                          ? "Small"
                          : item.bet.split(",")[0]}
                      </div>
                      <div>
                        <h3 className="heading-h3 text-whites text-md">
                          {item?.stage}
                        </h3>
                        <p className="fs-sm text-whites">{item.time}</p>
                      </div>
                    </div>
                    {item.status !== 0 && (
                      <div className="flex flex-col items-end">
                        <div
                          className={`min-w-[80px] text-center border px-3 py-[2px] rounded-md text-sm ${
                            item.status === 1
                              ? "color-green border-green-500"
                              : "color-red-200 border-color-red"
                          }`}
                        >
                          {item.status === 1 ? "Succeed" : " Failed"}
                        </div>
                        <p
                          className={`color-red-200  ${
                            item.status === 1 ? "color-green " : "color-red-200"
                          }`}
                        >
                          {item.status === 1
                            ? "+₹" + item.get
                            : "-₹" + item.price}
                        </p>
                      </div>
                    )}
                  </div>
                  <div
                    className={`mt-3 history-details ${
                      details === i ? "active mb-5" : ""
                    }`}
                  >
                    <h2 className="heading-h2 text-whites text-lg">Details</h2>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2 rounded-md">
                      <span className=" text-whites ">Order number</span>
                      <span className=" text-whites flex item-center">
                        {item.id_product}
                        <PiCopySimpleBold
                          className="mt-[3px]"
                          onClick={() =>
                            copyToClipboard(String(item.id_product))
                          }
                        />
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2 rounded-md">
                      <span className=" text-whites ">Period</span>
                      <span className=" text-whites ">{item.stage}</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className=" text-whites ">Purchase amount</span>
                      <span className=" text-whites ">₹{item.money}</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className=" text-whites ">Quantiy</span>
                      <span className=" text-whites ">{item?.amount}</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className="text-whites ">Amount after tax</span>
                      <span className="color-red-200 ">₹{item.price}</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className="text-whites ">Tax</span>
                      <span className="text-whites ">₹{item.fee}</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className="text-whites ">Result</span>
                      {item.status !== 0 && (
                        <div className=" flex text-center justify-center  items-center">
                          {item?.result?.split("").map((data, i) => (
                            <div className="text-sm text-whites w-6 mr-1 h-6 flex justify-center items-center border-2 rounded-full  border-[--gray-400]">
                              {data}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className=" flex justify-between items-center   bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <p className="text-whites">Select</p>
                      <span className=" text-whites flex">
                        {" "}
                        {item.bet == "c"
                          ? "Even"
                          : item.bet == "l"
                          ? "Odd"
                          : item.bet == "b"
                          ? "Big"
                          : item.bet == "s"
                          ? item.bet
                              .split(",")
                              .map((char) => mappings[char])
                              .join(" ")
                          : item.bet}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className=" text-whites ">Status</span>
                      {item.status !== 0 && (
                        <span
                          className={` color-red-200 ${
                            item.status == 1 ? "color-green" : "color-red-200"
                          }`}
                        >
                          {" "}
                          {item.status === 1 ? "Succeed" : " Failed"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className=" text-whites ">Win/loss</span>
                      {item.status !== 0 && (
                        <span
                          className={` ${
                            item.status === 1 ? "color-green " : "color-red-200"
                          }`}
                        >
                          {item.status === 1
                            ? "+₹" + item.get
                            : "-₹" + item.money}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className=" text-whites ">Order time</span>
                      <span className=" text-whites ">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyData />
            )}
            <div className="bg-light p-6 flex items-center justify-center mt-5">
              <button
                className={`rounded-md p-2 mr-4 ${
                  pageto / 10 >= 2
                    ? "bg-[#E6EBF0] text-white"
                    : "bg-blues text-whites"
                } `}
                disabled={pageto / 10 > 1 ? false : true}
                onClick={handleDecrease}
              >
                <Link>
                  {" "}
                  <IoIosArrowBack className="text-lg" />
                </Link>
              </button>
              <span className="fs-sm text-whites">
                {pageto / 10}/{d5HistoryData?.page}
              </span>
              <button
                className={`rounded-md p-2 ms-4 ${
                  d5HistoryData?.page
                    ? "bg-color-l2 text-white"
                    : "bg-[#E6EBF0]"
                } `}
                disabled={d5HistoryData?.page > pageto / 10 ? false : true}
                onClick={handleIncrease}
              >
                <Link>
                  {" "}
                  <IoIosArrowForward className="text-lg" />
                </Link>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={openPopup ? "overlay-section block" : "hidden"}></div>

      {/* popups */}
      <div
        className={`bg-light z-[12] items-center transition ease-in-out delay-150 justify-center fixed bottom-0 rounded-t-2xl filter-section w-[24.7rem] ${
          openPopup ? "flex" : "hidden"
        }`}
      >
        <div className=" rounded-t-2xl  overflow-hidden w-full ">
          <div className="px-4 pt-4">
            <div className="flex items-center mt-4 text-white border-b border-[--gray-400]">
              <button
                className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2 rounded-t-md ${
                  selectTab == "a"
                    ? " bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-[#E6EBF0] text-whites"
                }`}
                onClick={() => setSelectTab("a")}
              >
                A
              </button>
              <button
                className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2 rounded-t-md ${
                  selectTab == "b"
                    ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-[#E6EBF0] text-whites"
                }`}
                onClick={() => {
                  setSelectTab("b");
                }}
              >
                B
              </button>
              <button
                className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2 rounded-t-md ${
                  selectTab == "c"
                    ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-[#E6EBF0] text-whites"
                }`}
                onClick={() => {
                  setSelectTab("c");
                }}
              >
                C
              </button>
              <button
                className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2  rounded-t-md ${
                  selectTab == "d"
                    ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-[#E6EBF0] text-whites"
                }`}
                onClick={() => {
                  setSelectTab("d");
                }}
              >
                D
              </button>
              <button
                className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2  rounded-t-md ${
                  selectTab == "e"
                    ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-[#E6EBF0] text-whites"
                }`}
                onClick={() => {
                  setSelectTab("e");
                }}
              >
                E
              </button>
              <button
                className={` text-lg font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2  rounded-t-md ${
                  selectTab == "f"
                    ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-[#E6EBF0] text-whites"
                }`}
                onClick={() => {
                  setSelectTab("f");
                }}
              >
                F
              </button>
              <button
                className={` text-md font-bold  w-10 h-10  flex justify-center items-center abc-select relative mr-2  rounded-t-md ${
                  selectTab == "total"
                    ? "bg-color-l2 text-white after:bg-custom-radial-gradient"
                    : "bg-[#E6EBF0] text-whites"
                }`}
                onClick={() => {
                  setSelectTab("total");
                }}
              >
                SUM
              </button>
            </div>
            {selectTab != "total" ? (
              <div>
                <div className="grid grid-cols-12 mt-3 gap-2 ">
                  <div
                    className={`col-span-3 cursor-pointer text-white  rounded-md font-medium text-base p-1 flex justify-between items-center ${
                      selectedNumbers.includes("b")
                        ? "bg-yellow text-white"
                        : "bg-[#E6EBF0] text-whites"
                    }`}
                    onClick={() => handleSelectNumber3("b")}
                  >
                    <span>Big</span> <span>1.98</span>
                  </div>
                  <div
                    className={`col-span-3 cursor-pointer text-white rounded-md font-medium text-base p-1 flex justify-between items-center ${
                      selectedNumbers.includes("s")
                        ? "bgs-blue-500 text-white"
                        : "bg-[#E6EBF0] text-whites"
                    }`}
                    onClick={() => handleSelectNumber3("s")}
                  >
                    <span>Small</span> <span>1.98</span>
                  </div>
                  <div
                    className={`col-span-3 cursor-pointer text-white rounded-md font-medium text-base p-1 flex justify-between items-center ${
                      selectedNumbers.includes("l")
                        ? "bgs-red-200 text-white"
                        : "bg-[#E6EBF0] text-whites"
                    }`}
                    onClick={() => handleSelectNumber3("l")}
                  >
                    <span>Odd</span> <span>1.98</span>
                  </div>
                  <div
                    className={`col-span-3 cursor-pointer text-white rounded-md font-medium text-base p-1 flex justify-between items-center ${
                      selectedNumbers.includes("c")
                        ? "bgs-green text-white"
                        : "bg-[#E6EBF0] text-whites"
                    }`}
                    onClick={() => handleSelectNumber3("c")}
                  >
                    <span>Even</span> <span>1.98</span>
                  </div>
                </div>
                <div className="grid grid-cols-10 gap-2 ball-section mt-3">
                  {numbers3.map((number, i) => (
                    <div
                      className="col-span-2 flex flex-col justify-center items-center num "
                      key={i}
                    >
                      <div
                        className={`flex flex-col justify-center items-center cursor-pointer w-10 h-10 rounded-full border border-[--gray-400] ${
                          selectedNumbers.includes(number)
                            ? "bgs-blue-500 text-white"
                            : "text-whites text-whites"
                        }`}
                        onClick={() => handleSelectNumber3(number)}
                      >
                        <div className="text">{number}</div>
                      </div>
                      <div className="fs-sm text-whites">9</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-12 text-white mt-3 gap-2 ">
                <div
                  className={`col-span-3 cursor-pointer  rounded-md font-medium text-base p-1 flex justify-between items-center ${
                    selectedNumbers.includes("b")
                      ? "bg-yellow text-white"
                      : "bg-[#E6EBF0] text-whites"
                  }`}
                  onClick={() => handleSelectNumber3("b")}
                >
                  <span>Big</span> <span>1.98</span>
                </div>
                <div
                  className={`col-span-3 cursor-pointer  rounded-md font-medium text-base p-1 flex justify-between items-center ${
                    selectedNumbers.includes("s")
                      ? "bgs-blue-500 text-white"
                      : "bg-[#E6EBF0] text-whites"
                  }`}
                  onClick={() => handleSelectNumber3("s")}
                >
                  <span>Small</span> <span>1.98</span>
                </div>
                <div
                  className={`col-span-3 cursor-pointer  rounded-md font-medium text-base p-1 flex justify-between items-center ${
                    selectedNumbers.includes("l")
                      ? "bgs-red-200 text-white"
                      : "bg-[#E6EBF0] text-whites"
                  }`}
                  onClick={() => handleSelectNumber3("l")}
                >
                  <span>Odd</span> <span>1.98</span>
                </div>
                <div
                  className={`col-span-3 cursor-pointer  rounded-md font-medium text-base p-1 flex justify-between items-center ${
                    selectedNumbers.includes("c")
                      ? "bgs-green text-white"
                      : "bg-[#E6EBF0] text-whites"
                  }`}
                  onClick={() => handleSelectNumber3("c")}
                >
                  <span>Even</span> <span>1.98</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4  text-whites">
            <div className="flex justify-between items-center  mb-4">
              <span>Balance</span>
              <div className="flex space-x-2">
                {balanceOptions.map((value) => (
                  <button
                    key={value}
                    onClick={() => setBalance(value)}
                    className={` text-base mx-1 px-2 py-[3px]  rounded-md ${
                      balance === value
                        ? "bg-color-l2 text-white"
                        : "bg-[#E6EBF0] text-whites"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span>Quantity</span>
              <div className="flex items-center ">
                <button
                  onClick={() =>
                    setMultiplier(multiplier > 1 ? multiplier - 1 : 1)
                  }
                  className={` text-lg p-[3px] font-bold mx-1  flex items-center justify-center rounded-md 
               bg-color-l2 text-white
                    `}
                >
                  <FaMinus className="svg-white" />
                </button>
                <input
                  type="number"
                  value={multiplier}
                  className="w-20 text-center bgs-body outline-none border border-black mx-3"
                  name=""
                  id=""
                  onChange={(e) => setMultiplier(e.target.value)}
                />
                <button
                  onClick={() => setMultiplier(multiplier + 1)}
                  className={` text-lg  p-[3px] font-bold mx-1  flex items-center justify-center rounded-md  
                 bg-color-l2 text-white
                    `}
                >
                  <FaPlus className="svg-white" />
                </button>
              </div>
            </div>

            <div className=" items-center flex justify-end mb-5 ">
              {xData.map((item, i) => (
                <button
                  className={`text-base mx-1 px-2 py-[3px]  rounded-md ${
                    activeX === i
                      ? "bg-color-l2 text-white"
                      : "bg-[#E6EBF0] text-whites"
                  }`}
                  key={i}
                  onClick={() => {
                    setActiveX(i);
                    setMultiplier(item);
                  }}
                >
                  X{item}
                </button>
              ))}
            </div>

            <div className="flex items-center mt-4">
              <label className="flex items-center ">
                <input
                  type="checkbox"
                  className="hidden peer"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
                <div className="w-6 h-6 rounded-full border-2 border-[#dd9138] flex items-center justify-center peer-checked:bg-[#dd9138]">
                  <svg
                    className={`w-4 h-4 text-white ${
                      isChecked ? "block" : "hidden"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414L8 11.586l6.793-6.793a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-white ms-2 mr-2 text-sm cursor-pointer">
                  I agree
                </span>{" "}
                <Link className="color-red-200 fs-sm flex items-center">
                  <MdKeyboardDoubleArrowLeft /> Pre-sale rules{" "}
                  <MdKeyboardDoubleArrowRight />
                </Link>
              </label>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <button
              className="bg-[#E6EBF0] gray-100 w-[40%] p-2 text-sm font-medium"
              onClick={() => {
                setOpenPopup(false);
                setSelectedNumbers([]);
              }}
            >
              Cancel
            </button>
            <button
              className={` w-[60%] p-2 bg-color-l2 text-white text-sm font-medium`}
              disabled={loader ? true : false}
              onClick={handleBet}
            >
              Total amount ₹{(totalbalance * multiplier).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
      {/* ${selectBet == "Green" ? "bgs-green" : selectBet == "Red" ? "bgs-red-200" : selectBet == "Voilet" ? "bgs-violet" : selectBet == "b" ? "color-yellow-bg-200" : selectBet == "s" ? "bgs-blue-500" : (selectBet == 1 || selectBet == 3 || selectBet == 5 || selectBet == 7 || selectBet == 9) ? "bgs-green" : "bgs-red-200"}
              `} */}

      <div
        className={resultPopup ? "overlay-section block" : "hidden"}
        onClick={handleClose}
      ></div>

      {/* result popup */}
      {resultPopup && (winResult === true || winResult === false) && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[9999]">
          <img
            src={winResult ? WinImg : LoseImg}
            alt=""
            className="w-[21rem] h-[28rem]"
          />
          <div
            className='"top-[50%] left-[50%]"'
            style={{ position: "absolute", top: "36%" }}
          >
            <p
              className={` text-[1.7rem] text-center font-bold ${
                winResult ? "text-white" : "color-slate-500"
              }`}
            >
              {winResult ? "Congratulations" : "Sorry"}
            </p>

            <p
              className={` text-sm text-center mt-[-2px] ${
                winResult ? "text-white" : "color-slate-500"
              }`}
            >
              Lottery results
            </p>

            <div className="flex items-center justify-center ">
              <button
                className={` text-md font-medium text-whites  w-7 h-8  flex justify-center items-center  relative mr-1 rounded-t-2xl color-yellow-bg-200 text-white`}
              >
                A
              </button>
              <button
                className={` text-md font-medium text-whites  w-7 h-8  flex justify-center items-center relative mr-1 rounded-t-2xl color-yellow-bg-200 text-white`}
              >
                B
              </button>
              <button
                className={` text-md font-medium text-whites  w-7 h-8  flex justify-center items-center  relative mr-1 rounded-t-2xl color-yellow-bg-200 text-white`}
              >
                C
              </button>
              <button
                className={` text-md font-medium text-whites  w-7 h-8  flex justify-center items-center  relative mr-1  rounded-t-2xl color-yellow-bg-200 text-white`}
              >
                D
              </button>
              <button
                className={` text-md font-medium text-whites  w-7 h-8  flex justify-center items-center  relative mr-1   rounded-t-2xl color-yellow-bg-200 text-white`}
              >
                E
              </button>

              <button
                className={` fs-sm text-whites  w-7 h-8  flex justify-center items-center  relative rounded-t-2xl color-yellow-bg-200 text-white`}
              >
                SUM
              </button>
            </div>
            <div className="flex justify-center items-center mt-2">
              {Array.isArray(d5PeriodListData?.data?.gameslist) &&
                d5PeriodListData?.data?.gameslist[0]?.result
                  ?.split("")
                  .map((data, i) => (
                    <span
                      key={i}
                      className={`fs-sm w-6 h-6 mt-[-3px] text-center mx-[4px]  text-white rounded-full flex justify-center items-center border border-white`}
                    >
                      {data}
                    </span>
                  ))}

              <span
                className={`fs-sm w-6 h-6 mt-[-3px] text-center mx-1  text-white rounded-full flex justify-center items-center border border-white`}
              >
                {Array.isArray(d5PeriodListData?.data?.gameslist) &&
                  d5PeriodListData?.data?.gameslist[0]?.result
                    ?.split("")
                    .reduce((acc, digit) => acc + parseInt(digit), 0)}
              </span>
            </div>
            <div>
              {winResult ? (
                <div className=" color-red-200 mt-5 text-center font-bold ">
                  <p>Bonus</p>
                  <p className="text-[1.5rem] relative top-[-3px] font-bold">
                    ₹
                    {Array.isArray(d5HistoryData?.data?.gameslist) &&
                      d5HistoryData?.data?.gameslist[0]?.get}
                  </p>
                </div>
              ) : (
                <p className="text-[2rem] gray-color mt-5 text-center font-medium">
                  Lose
                </p>
              )}
            </div>
            <p
              className={`fs-sm text-whites text-center font-semibold ${
                winResult ? "mt-1" : "mt-3"
              }`}
            >
              Period:5D {typeid1} Minute{" "}
              {Array.isArray(d5PeriodListData?.data?.gameslist) &&
                d5PeriodListData?.data?.gameslist[0]?.period}
            </p>

            <p
              className={`fs-sm mt-14 cursor-pointer flex items-center  ${
                winResult ? "ml-[0px]" : "ml-[-20px]"
              }`}
            >
              <span className="w-5 mr-2 flex h-5 border border-white rounded-full"></span>{" "}
              3 Seconds auto close
            </p>
          </div>
          <button
            className="color-white absolute bottom-[15%] text-3xl"
            onClick={() => handleClose()}
          >
            <IoCloseCircleOutline />
          </button>
        </div>
      )}

      {/* how to play section */}
      <div className={openHowtoPlay ? "overlay-section block" : "hidden"}></div>

      {openHowtoPlay ? (
        <div className="fixed top-32 bg-light w-[270px] flex flex-col justify-center items-center m-auto left-0 right-0 rounded-t-2xl rounded-b-2xl z-30">
          <div className=" blue-linear w-full text-center text-wihte text-xl py-2  rounded-t-2xl">
            How to play
          </div>
          <div className="h-[300px] overflow-auto p-2 fs-sm leading-6 text-whites">
            <p className="font-bold">
              3 minutes 1 issue, 2minutes 55 seconds to order, 5 seconds waiting
              for the draw. It opens all day. The total number of trade is 480
              issues.
            </p>

            <p className="font-bold">
              <font>
                if you spend 100 to trade, after deducting service fee 2%,
                contract amount : 98
              </font>
            </p>
            <p>
              <span>
                1. Select green: if the result shows 1,3,7,9 you will get
                (98*2)=196;If the result shows 5, you will get (98*1.5) 147
              </span>
            </p>
            <p>
              <span>
                2. Select red: if the result shows 2,4,6,8 you will get
              </span>
              <span>(98*2)=196</span>
              <span>;If the result shows 0, you will get</span>
              <span>(98*1.5) 147</span>
            </p>
            <p>
              <span>
                3. Select violet: if the result shows 0 or 5, you will get
              </span>
              <span>(98*2)=196</span>
            </p>
            <p>
              <span>
                4. Select number: if the result is the same as the number you
                selected, you will get
              </span>
              <span>(98*9)=882</span>
            </p>
            <p>
              <span>
                5. Select big: if the result shows 5,6,7,8,9 you will get
              </span>
              <span>(98*2)=196</span>
            </p>
            <p>
              <span>
                6. Select small: if the result shows 0,1,2,3,4 you will get
              </span>
              <span>(98*2)=196</span>
            </p>
          </div>
          <div className="flex justify-center items-center bg-light w-full py-3 rounded-b-2xl">
            <button
              className="blue-linear rounded-full w-40 py-2 text-white"
              onClick={() => setHowtoPlay(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        ""
      )}

      <CopyCopmponent copyPopup={refershPopup} message="Refesh successfully" />
      <CopyCopmponent copyPopup={copyPopup} message="Copy successfully" />
      <div className={`place-bet-popup ${betAlert ? "active" : ""}`}>
        <div className="text-sm">{messages} </div>
      </div>
    </>
  );
};

export default FiveD;
