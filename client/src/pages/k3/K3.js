import React, {
  useEffect,
  useState,
  useCallback,
  Fragment,
  useRef,
} from "react";
import {
  IoIosArrowBack,
  IoIosArrowDropright,
  IoIosArrowForward,
  IoIosCheckmarkCircle,
} from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";

import { IoCloseCircleOutline } from "react-icons/io5";
import { PiCopySimpleBold } from "react-icons/pi";
import { FaCircleQuestion } from "react-icons/fa6";
import "./k3.css";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { FaMinus, FaPlus } from "react-icons/fa";

import TimeImg from "../../assets/time.png";
import TimeActiveImg from "../../assets/time_aactive.png";

import N1 from "../../assets/n1.png";
import N2 from "../../assets/n2.png";
import N3 from "../../assets/n3.png";
import N4 from "../../assets/n4.png";
import N5 from "../../assets/n5.png";
import N6 from "../../assets/n6.png";

import { useDispatch, useSelector } from "react-redux";
import { userDetail } from "../../store/reducer/authReducer";
import CopyCopmponent from "../../components/CopyCopmponent";
import { k3History, k3PeriodList } from "../../store/reducer/gameReducer";
import { k3Bet } from "../../store/reducer/betReducer";
import io from "socket.io-client";
import Audio1 from "../../assets/audio/di1.mp3";
import Audio2 from "../../assets/audio/di2.mp3";
import debounce from "lodash/debounce";

import { host } from "../../store/reducer/api";

import HeaderInfo from "../wingo/HeaderInfo";
import Loader from "../../components/Loader";
import EmptyData from "../activity/EmptyData";

const WinImg = "https://i.ibb.co/TMnbvp0N/win-popup.png";
const LoseImg = "https://i.ibb.co/8zTQQmx/loss-popup.png";

const BallData = [
  {
    number: 3,
    x: 207.36,
  },
  {
    number: 4,
    x: 69.12,
  },
  {
    number: 5,
    x: 34.56,
  },
  {
    number: 6,
    x: 20.74,
  },
  {
    number: 7,
    x: 13.83,
  },
  {
    number: 8,
    x: 9.88,
  },
  {
    number: 9,
    x: 8.3,
  },
  {
    number: 10,
    x: 7.68,
  },
  {
    number: 11,
    x: 7.68,
  },
  {
    number: 12,
    x: 8.3,
  },
  {
    number: 13,
    x: 9.88,
  },
  {
    number: 14,
    x: 13.83,
  },
  {
    number: 15,
    x: 20.74,
  },
  {
    number: 16,
    x: 34.56,
  },
  {
    number: 17,
    x: 69.12,
  },
  {
    number: 18,
    x: 207.36,
  },
];

const xData = [1, 5, 10, 20, 50, 100];

const imgData = {
  1: N1,
  2: N2,
  3: N3,
  4: N4,
  5: N5,
  6: N6,
};

const getImageFromNumber = (number) => {
  if (number) {
    return number
      ?.toString()
      ?.split("")
      .map((num) => imgData[num]);
  } else {
    throw new Error("Input is not a valid number or string");
  }
};
const socket = io(host);
const K3 = () => {
  const { bannergetData } = useSelector((state) => state.user);
  const { userInfo } = useSelector((state) => state.auth);
  const { k3PeriodListData, k3HistoryData } = useSelector(
    (state) => state.game
  );
  const { loader } = useSelector((state) => state.bet);
  const [activeTime, setActiveTime] = useState("1Min");
  const [activeX, setActiveX] = useState(0);
  const [messages, setMessage] = useState("");
  const [gameHistory, setGameHistory] = useState("ghistory");
  const [openPopup, setOpenPopup] = useState(false);
  const [openTime, setOpenTime] = useState(null);
  const [openHowtoPlay, setHowtoPlay] = useState(false);
  const [selectTab, setSelectTab] = useState(1);
  const [refershPopup, setRefeshPopup] = useState(false);
  const [betAlert, setBetAlert] = useState(false);
  const [pageno, setPage] = useState(1);
  const [pageto, setPageto] = useState(10);
  const [typeid1, setTypeid1] = useState(1);
  const [secondtime1, setSecondtime1] = useState(0);
  const [secondtime2, setSecondtime2] = useState(0);
  const [minutetime2, setMinutetime2] = useState(0);
  const [changeTime, setChangeTime] = useState(false);
  const [changeDice, setChangeDice] = useState(true);
  const [details, setDetails] = useState(null);
  const [copyPopup, setCopyPopup] = useState(false);
  const [winResult, setWinResult] = useState(null);
  const [resultPopup, setResultPopup] = useState(false);
  const [activeVoice, setActiveVoice] = useState(true);
  const intervalRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleK3Minut = async (data) => {
    setActiveTime(data);
    localStorage.setItem("k3minute", data);
    let match = data.match(/\d+/);
    let number = match ? parseInt(match[0], 10) : null;
    setTypeid1(number);
    setPage(1);
    setPageto(10);
    debouncedDispatch(dispatch, number, pageno, pageto);
  };
  const handleGameHistory = (data) => {
    setGameHistory(data);
    setPage(1);
    setPageto(10);
  };

  const [isChecked, setIsChecked] = useState(true);
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const [balance, setBalance] = useState(1);
  const [multiplier, setMultiplier] = useState(1);

  const balanceOptions = [1, 10, 100, 1000];

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
    const k3minutes = localStorage.getItem("k3minute");
    if (k3minutes !== null) {
      setActiveTime(k3minutes);
      setTypeid1(extractNumber(k3minutes));
    }
    const voiceState = localStorage.getItem("voice");
    if (voiceState !== null) {
      setActiveVoice(JSON.parse(voiceState));
    }

    if (typeid1 !== null) {
      debouncedDispatch(dispatch, typeid1, pageno, pageto);
      openAudio();
    }

    // if(openPopup){
    //     document.body.style.overflow = 'hidden';
    //    }

    //    return () => {
    //     document.body.style.overflow = 'auto'; // or 'visible' depending on your default
    //   };
  }, [activeTime, resultPopup, openPopup, winResult]);

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

  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [selectedNumbers3, setSelectedNumbers3] = useState([]);

  let totalAmount =
    selectedNumbers.length > 0
      ? selectedNumbers.length * balance * multiplier
      : balance * multiplier;
  totalAmount =
    selectedNumbers3.length > 0
      ? selectedNumbers3.length * totalAmount
      : totalAmount;

  let totalbalance =
    selectedNumbers.length > 0 ? selectedNumbers.length * balance : balance;
  totalbalance =
    selectedNumbers3.length > 0 ? selectedNumbers3.length * balance : balance;

  const numbers1 = [11, 22, 33, 44, 55, 66];
  const numbers3 = [1, 2, 3, 4, 5, 6];
  const numbers33 = [1111, 2222, 3333, 4444, 5555, 6666];

  var selectBets = [...selectedNumbers, ...selectedNumbers3];
  const selectBet = selectBets.join(",");

  const handleBet = async () => {
    dispatch(
      k3Bet({ typeid1, selectTab, selectBet, totalbalance, multiplier })
    ).then((res) => {
      setBetAlert(true);
      setOpenPopup(false);
      setMessage(res.payload.message);
      setBalance(1);
      setMultiplier(1);
      setActiveX(0);
      setSelectedNumbers([]);
      setSelectedNumbers3([]);
      setTimeout(() => {
        setMessage("");
      }, 3000);
      dispatch(userDetail());
      debouncedDispatch(dispatch, typeid1, pageno, pageto);
      setTimeout(() => {
        setBetAlert(false);
      }, 2000);
    });
  };

  const handleSelectNumber = (number) => {
    setSelectedNumbers((prevSelected) =>
      prevSelected.includes(number)
        ? prevSelected.filter((n) => n !== number)
        : [...prevSelected, number]
    );
    setTimeout(() => {
      setOpenPopup(true);
    }, 100);
  };
  const handleSelectNumber3 = (number) => {
    setSelectedNumbers3((prevSelected) => {
      const isSingleDigit = number < 10;
      const correspondingNumber = isSingleDigit
        ? number * 10 + number
        : Math.floor(number / 10);

      // Determine if the number or its corresponding number is selected
      const isNumberSelected = prevSelected.includes(number);
      const isCorrespondingNumberSelected =
        prevSelected.includes(correspondingNumber);

      if (isNumberSelected) {
        // If the number is already selected, remove it and its corresponding number
        return prevSelected.filter(
          (n) => n !== number && n !== correspondingNumber
        );
      } else if (number == "s") {
        return prevSelected.filter((n) => n !== "b").concat("s");
      } else if (number == "b") {
        // If 'b' is selected, remove 's' if present
        return prevSelected.filter((n) => n !== "s").concat("b");
      } else if (number == "l") {
        // If 'b' is selected, remove 's' if present
        return prevSelected.filter((n) => n !== "c").concat("l");
      } else if (number == "c") {
        // If 'b' is selected, remove 's' if present
        return prevSelected.filter((n) => n !== "l").concat("c");
      } else {
        // If the number is not selected, add it and remove the corresponding number if it's selected
        return [
          ...prevSelected.filter((n) => n !== correspondingNumber),
          number,
        ];
      }
    });
    setTimeout(() => {
      setOpenPopup(true);
    }, 100);
  };

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

  const debouncedDispatch = useCallback(
    debounce((dispatch, typeid1, pageno, pageto) => {
      dispatch(k3PeriodList({ typeid1, pageno, pageto }));
      dispatch(k3History({ typeid1, pageno, pageto }));
    }, 500),
    [dispatch, typeid1]
  );

  const debouncedDispatchResult = useCallback(
    debounce((dispatch, typeid1, pageno, pageto) => {
      dispatch(k3History({ typeid1, pageno, pageto })).then((res) => {
        if (res?.payload.data?.gameslist[0]?.status == 1) {
          setWinResult(true);
          dispatch(userDetail());
        } else {
          setWinResult(false);
        }
      });
    }, 500),
    [dispatch, typeid1]
  );
  useEffect(() => {
    dispatch(userDetail());
  }, []);

  useEffect(() => {
    // Dispatch userDetail only once when the component mounts

    setTimeout(() => {
      setRefeshPopup(false);
    }, 2000);

    const handler = (msg) => {
      setPage(1);
      setPageto(10);
      // Realtime data

      if (msg?.data[1]?.period == k3HistoryData?.data?.gameslist[0]?.stage) {
        setResultPopup(true);
        debouncedDispatchResult(dispatch, typeid1, pageno, pageto);
        setChangeDice(true);
      }
      if (typeid1 === 1 && Array.isArray(msg?.data) && msg.game == 1) {
        debouncedDispatch(dispatch, typeid1, pageno, pageto);
        setChangeTime(true);
        setChangeDice(true);

        //console.log("server data received");
      }

      if (typeid1 == 3 && Array.isArray(msg?.data) && msg.game == 3) {
        debouncedDispatch(dispatch, typeid1, pageno, pageto);
        setChangeTime(true);
        setChangeDice(true);
      }

      if (typeid1 == 5 && Array.isArray(msg?.data) && msg.game == 5) {
        debouncedDispatch(dispatch, typeid1, pageno, pageto);
        setChangeTime(true);
        setChangeDice(true);
      }
      if (typeid1 == 10 && Array.isArray(msg?.data) && msg?.game == 10) {
        debouncedDispatch(dispatch, typeid1, pageno, pageto);
        setChangeTime(true);
        setChangeDice(true);
      }
    };

    socket.on("data-server-k3", handler);

    return () => {
      socket.off("data-server-k3", handler);
    };
  }, [dispatch, debouncedDispatch, debouncedDispatchResult, k3HistoryData]);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // time count
    if (typeid1 == 1) {
      socket.current = io.connect(host); // Your server's URL
      // Define the event name directly based on typeid1
      const eventName = `timeUpdate_11`;
      socket.current.on(eventName, (data) => {
        if (!data) {
          return;
        }
        const { minute, secondtime1, secondtime2 } = data;
        setMinutetime2(minute);
        setSecondtime1(secondtime1);
        setSecondtime2(secondtime2);

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
      //console.log("k3 3 min");
      socket.current = io.connect(host); // Your server's URL
      // Define the event name directly based on typeid1
      const eventName = `timeUpdate_3`;
      socket.current.on(eventName, (data) => {
        if (!data) {
          return;
        }
        const { minute, secondtime1, secondtime2 } = data;

        setMinutetime2(minute);
        setSecondtime1(secondtime1);
        setSecondtime2(secondtime2);

        if (
          minute == 0 &&
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

        setMinutetime2(minute);
        setSecondtime1(secondtime1);
        setSecondtime2(secondtime2);

        if (
          minute == 0 &&
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

        setMinutetime2(minute);
        setSecondtime1(secondtime1);
        setSecondtime2(secondtime2);

        // Handle open time logic based on received data
        if (
          minute == 0 &&
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

        if (minute === 9 && secondtime1 === 5 && secondtime2 === 9) {
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
          socket.current.disconnect();
          socket.current = null;
        }
      }
    };
  }, [typeid1, activeVoice]);

  const fetchNewData = async (pageno, pageto) => {
    await dispatch(k3PeriodList({ typeid1, pageno, pageto }));
    await dispatch(k3History({ typeid1, pageno, pageto }));
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

  const [diceValues, setDiceValues] = useState([1, 2, 3]);

  const rollDice = () => {
    setDiceValues(diceValues.map(() => Math.floor(Math.random() * 6) + 1));
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

  // Use effect to roll dice at an interval
  useEffect(() => {
    const interval = setInterval(rollDice, 100); // Change dice every second
    return () => clearInterval(interval);
  }, [diceValues, changeTime, changeDice, pageno, pageto]);

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
      {!userInfo && <Loader />}
      <HeaderInfo
        handleRefersh={handleRefersh}
        money={Number(userInfo?.money_user).toFixed(2)}
        handleVoice={handleVoice}
        activeVoice={activeVoice}
      />
      <div className="container-section relative mt-[-75px]">
        {/* time tabs */}
        <div className="grid grid-cols-12 bg-popup-nav rounded-xl">
          <div
            className={`col-span-3 cursor-pointer  flex items-center flex-col justify-center py-2 ${
              activeTime == "1Min" ? "blue-linear2" : ""
            } rounded-xl`}
            onClick={() => handleK3Minut("1Min")}
          >
            <img
              src={activeTime == "1Min" ? TimeActiveImg : TimeImg}
              alt=""
              className="w-10"
            />
            <p
              className={`text-center  fs-sm font-sans leading-4 ${
                activeTime == "1Min" ? "text-white" : "gray-100"
              }`}
            >
              K3 Lotre <br /> 1Min
            </p>
          </div>
          <div
            className={`col-span-3  cursor-pointer flex items-center flex-col justify-center py-2  rounded-xl  ${
              activeTime == "3Min" ? "blue-linear2" : ""
            }`}
            onClick={() => handleK3Minut("3Min")}
          >
            <img
              src={activeTime == "3Min" ? TimeActiveImg : TimeImg}
              alt=""
              className="w-10"
            />
            <p
              className={`text-center  fs-sm font-sans leading-4 ${
                activeTime == "3Min" ? "text-white" : "gray-100"
              }`}
            >
              K3 Lotre <br /> 3Min
            </p>
          </div>
          <div
            className={`col-span-3  cursor-pointer flex items-center flex-col justify-center py-2  rounded-xl  ${
              activeTime == "5Min" ? "blue-linear2" : ""
            }`}
            onClick={() => handleK3Minut("5Min")}
          >
            <img
              src={activeTime == "5Min" ? TimeActiveImg : TimeImg}
              alt=""
              className="w-10"
            />
            <p
              className={`text-center  fs-sm font-sans leading-4 ${
                activeTime == "5Min" ? "text-white" : "gray-100"
              }`}
            >
              K3 Lotre <br /> 5Min
            </p>
          </div>
          <div
            className={`col-span-3  cursor-pointer flex items-center flex-col justify-center py-2  rounded-xl  ${
              activeTime == "10Min" ? "blue-linear2" : ""
            }`}
            onClick={() => handleK3Minut("10Min")}
          >
            <img
              src={activeTime == "10Min" ? TimeActiveImg : TimeImg}
              alt=""
              className="w-10"
            />
            <p
              className={`text-center  fs-sm font-sans leading-4 ${
                activeTime == "10Min" ? "text-white" : "gray-100"
              }`}
            >
              K3 Lotre <br /> 10Min
            </p>
          </div>
        </div>

        {/* wingo tim */}
        <div className="relative">
          <div className="bg-light p-3 mt-5">
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
                      fill=""
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
                <h3 className="heading-h5 text-lg font-semibold mt-2 text-whites">
                  {k3PeriodListData?.period}
                </h3>
              </div>
              {/* period */}
              <div className="flex flex-col items-end">
                <p className="fs-sm gray-100">Time remaining</p>
                <div className="flex items-center mt-2">
                  <span className="bg-[#E6EBF0] text-lg mx-[2px] font-semibold w-5 text-center color-l rounded">
                    0
                  </span>
                  <span
                    className="bg-[#E6EBF0] text-lg mx-[2px] font-semibold w-5 text-center color-l rounded"
                    id="minute"
                  >
                    {minutetime2}
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

            <div className="bgs-green k3tl-box mt-5">
              <div className="box">
                {changeDice ? (
                  <>
                    {Array.isArray(k3PeriodListData?.data?.gameslist)
                      ? Array.isArray(k3PeriodListData?.data?.gameslist) &&
                        String(k3PeriodListData?.data?.gameslist[0]?.result)
                          .split("")
                          .map((value, index) => (
                            <div key={index}>
                              <div className={`num${value} rotate-dice`}></div>
                            </div>
                          ))
                      : diceValues.map((value, index) => (
                          <div key={index}>
                            <div className={`num${value} rotate-dice`}></div>
                          </div>
                        ))}
                  </>
                ) : (
                  diceValues.map((value, index) => (
                    <div key={index}>
                      <div className={`num${value} rotate-dice`}></div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-center mt-4">
              <button
                className={` fs-sm   w-full  py-3 rounded-t-md ${
                  selectTab == 1
                    ? "bg-color-l2 text-white"
                    : "bg-[#E6EBF0] gray-100"
                }`}
                onClick={() => setSelectTab(1)}
              >
                Total
              </button>
              <button
                className={` fs-sm  mx-1 w-full  py-3 rounded-t-md ${
                  selectTab == 2
                    ? "bg-color-l2 text-white"
                    : "bg-[#E6EBF0] gray-100"
                }`}
                onClick={() => {
                  setSelectTab(2);
                  setSelectedNumbers([]);
                  setSelectedNumbers3([]);
                }}
              >
                2 same
              </button>
              <button
                className={` fs-sm mr-1 w-full  py-3 rounded-t-md ${
                  selectTab == 3
                    ? "bg-color-l2 text-white"
                    : "bg-[#E6EBF0] gray-100"
                }`}
                onClick={() => {
                  setSelectTab(3);
                  setSelectedNumbers([]);
                  setSelectedNumbers3([]);
                }}
              >
                3 same
              </button>
              <button
                className={` fs-sm  w-full  py-3 rounded-t-md ${
                  selectTab == 4
                    ? "bg-color-l2 text-white"
                    : "bg-[#E6EBF0] gray-100"
                }`}
                onClick={() => {
                  setSelectTab(4);
                  setSelectedNumbers([]);
                  setSelectedNumbers3([]);
                }}
              >
                Different
              </button>
            </div>
            {selectTab == 1 && (
              <div>
                <div className="grid grid-cols-12 gap-2 ball-section mt-3">
                  {BallData.map((item, i) => (
                    <div
                      className="col-span-3 flex flex-col justify-center items-center num "
                      key={i}
                    >
                      <div
                        className="flex flex-col justify-center items-center cursor-pointer ball"
                        onClick={() => handleSelectNumber(item.number)}
                      >
                        <div className="text">{item.number}</div>
                      </div>
                      <div className="fs-sm gray-100">{item.x}X</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center mt-4">
                  <button
                    className={` fs-sm   w-full  py-2 rounded-md bg-yellow`}
                    onClick={() => handleSelectNumber3("b")}
                  >
                    Big <br />
                    1.92X{" "}
                  </button>
                  <button
                    className={` fs-sm  mx-1 w-full  py-2 rounded-md bgs-blue-500`}
                    onClick={() => handleSelectNumber3("s")}
                  >
                    Small <br />
                    1.92X{" "}
                  </button>
                  <button
                    className={` fs-sm  mr-1 w-full  py-2 rounded-md bgs-red-200`}
                    onClick={() => handleSelectNumber3("l")}
                  >
                    Odd <br />
                    1.92X{" "}
                  </button>
                  <button
                    className={` fs-sm   w-full  py-2 rounded-md bgs-green`}
                    onClick={() => handleSelectNumber3("c")}
                  >
                    Even <br />
                    1.92X{" "}
                  </button>
                </div>
              </div>
            )}
            {selectTab == 2 && (
              <div>
                <p className="fs-sm gray-50 flex items-center mt-2">
                  2 matching numbers: odds(13.83){" "}
                  <FaCircleQuestion className="ms-1 color-red-200" />
                </p>
                <div className="flex space-x-2 mt-2">
                  {numbers1.map((number) => (
                    <button
                      key={number}
                      onClick={() => handleSelectNumber(number)}
                      className={`relative p-2 w-14 h-10 flex items-center justify-center rounded-md ${
                        selectedNumbers.includes(number)
                          ? "bg-purple-500 text-white"
                          : "bg-purple-900 gray-100"
                      }`}
                    >
                      {number}
                      {selectedNumbers.includes(number) && (
                        <span className="absolute bottom-[0px] text-xl right-[0px]">
                          <IoIosCheckmarkCircle />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="fs-sm gray-50 flex items-center my-2">
                  A pair of unique numbers: odds(69.12){" "}
                  <FaCircleQuestion className="ms-1 color-red-200" />
                </p>
                <div className="flex space-x-2 mb-2">
                  {numbers1.map((number) => (
                    <button
                      key={number}
                      onClick={() => handleSelectNumber3(number)}
                      className={`relative p-2 w-14 h-10 flex items-center justify-center rounded-md ${
                        selectedNumbers3.includes(number)
                          ? "bg-red-500 text-white"
                          : "bg-red-900 gray-100"
                      }`}
                    >
                      {number}
                      {selectedNumbers3.includes(number) && (
                        <span className="absolute bottom-0 text-xl right-0">
                          <IoIosCheckmarkCircle />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2 ">
                  {numbers3.map((number) => (
                    <button
                      key={number}
                      onClick={() => handleSelectNumber3(number)}
                      className={`relative p-2 w-14 h-10 flex items-center justify-center rounded-md ${
                        selectedNumbers3.includes(number)
                          ? "bg-green-500 text-white"
                          : "bg-green-900 gray-100"
                      }`}
                    >
                      {number}
                      {selectedNumbers3.includes(number) && (
                        <span className="absolute bottom-0 text-xl right-0">
                          <IoIosCheckmarkCircle />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectTab == 3 && (
              <div>
                <p className="fs-sm gray-50 flex items-center mt-2">
                  3 of the same number: odds(207.36){" "}
                  <FaCircleQuestion className="ms-1 color-red-200" />
                </p>
                <div className="flex space-x-2 mt-2">
                  {numbers33.map((number) => (
                    <button
                      key={number}
                      onClick={() => handleSelectNumber(number)}
                      className={`relative p-2 w-12 h-10 flex items-center justify-center rounded-md ${
                        selectedNumbers.includes(number)
                          ? "bg-purple-500 text-white"
                          : "bg-purple-900 gray-100"
                      }`}
                    >
                      {number}
                      {selectedNumbers.includes(number) && (
                        <span className="absolute bottom-[0px] text-xl right-[0px]">
                          <IoIosCheckmarkCircle />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="fs-sm gray-50 flex items-center my-2">
                  Any 3 of the same number: odds(34.56){" "}
                  <FaCircleQuestion className="ms-1 color-red-200" />
                </p>
                <div className="flex space-x-2 mb-2">
                  <button
                    onClick={() => handleSelectNumber3("@3")}
                    className={`relative p-2 w-full h-10 flex items-center justify-center rounded-md ${
                      selectedNumbers3.includes("@3")
                        ? "bg-red-500 text-white"
                        : "bg-red-900 gray-100"
                    }`}
                  >
                    Any 3 of the same number: odds
                    {selectedNumbers3.includes("@3") && (
                      <span className="absolute bottom-0 text-xl right-0">
                        <IoIosCheckmarkCircle />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {selectTab == 4 && (
              <div>
                <p className="fs-sm gray-50 flex items-center mt-2">
                  3 different numbers: odds(34.56){" "}
                  <FaCircleQuestion className="ms-1 color-red-200" />
                </p>
                <div className="flex space-x-2 mt-2">
                  {numbers3.map((number) => (
                    <button
                      key={number}
                      onClick={() => handleSelectNumber(number)}
                      className={`relative p-2 w-14 h-10 flex items-center justify-center rounded-md ${
                        selectedNumbers.includes(number)
                          ? "bg-purple-500 text-white"
                          : "bg-purple-900 gray-100"
                      }`}
                    >
                      {number}
                      {selectedNumbers.includes(number) && (
                        <span className="absolute bottom-[0px] text-xl right-[0px]">
                          <IoIosCheckmarkCircle />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="fs-sm gray-50 flex items-center my-2">
                  3 continuous numbers: odds(8.64){" "}
                  <FaCircleQuestion className="ms-1 color-red-200" />
                </p>
                <div className="flex space-x-2 mb-2">
                  <button
                    onClick={() => handleSelectNumber3("@u@")}
                    className={`relative p-2 w-full h-10 flex items-center justify-center rounded-md ${
                      selectedNumbers3.includes("@u@")
                        ? "bg-red-500 text-white"
                        : "bg-red-900 gray-100"
                    }`}
                  >
                    3 continuous numbers
                    {selectedNumbers3.includes("@u@") && (
                      <span className="absolute bottom-0 text-xl right-0">
                        <IoIosCheckmarkCircle />
                      </span>
                    )}
                  </button>
                </div>
                <p className="fs-sm gray-50 flex items-center my-2">
                  2 different numbers: odds(6.91){" "}
                  <FaCircleQuestion className="ms-1 color-red-200" />
                </p>
                <div className="flex space-x-2 mb-2">
                  {numbers3.map((number) => (
                    <button
                      key={number}
                      onClick={() => handleSelectNumber3(number)}
                      className={`relative p-2 w-14 h-10 flex items-center justify-center rounded-md ${
                        selectedNumbers3.includes(number)
                          ? "bg-purple-500 text-white"
                          : "bg-purple-900 gray-100"
                      }`}
                    >
                      {number}
                      {selectedNumbers3.includes(number) && (
                        <span className="absolute bottom-0 text-xl right-0">
                          <IoIosCheckmarkCircle />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* bet period section */}

          {openTime && (
            <div className="flex items-center justify-center absolute z-10 m-auto top-0 bottom-0 left-0 right-0 ">
              <span className="text-[120px] colors bg-[#E6EBF0] text-blue font-medium rounded-xl  w-28  h-[150px] flex items-center justify-center mr-5">
                0
              </span>
              <span className="ms-5 text-[120px] colors bg-[#E6EBF0] text-blue font-medium rounded-xl  w-28  h-[150px] flex items-center justify-center">
                {secondtime2}
              </span>
            </div>
          )}

          <div className={openTime ? "overlay-section2 block" : "hidden"}></div>
        </div>

        {/* game history */}

        <div className="grid mt-5 grid-cols-12 gap-3">
          <div className="col-span-4 ">
            <button
              className={` flex justify-center items-center h-full w-full py-2 border-none rounded-lg ${
                gameHistory == "ghistory"
                  ? " text-base blue-linear text-white font-medium "
                  : "bg-light text-sm gray-100"
              }`}
              onClick={() => handleGameHistory("ghistory")}
            >
              Game history
            </button>
          </div>
          <div className="col-span-4 ">
            <button
              className={` flex justify-center items-center h-full w-full py-2 border-none rounded-lg ${
                gameHistory == "chart"
                  ? "text-base blue-linear  font-medium text-white"
                  : "bg-light text-sm gray-100"
              }`}
              onClick={() => handleGameHistory("chart")}
            >
              Chart
            </button>
          </div>
          <div className="col-span-4 ">
            <button
              className={` flex justify-center items-center h-full w-full py-2 border-none rounded-lg ${
                gameHistory == "mhistory"
                  ? " text-base blue-linear text-white font-medium "
                  : "bg-light text-sm gray-100"
              }`}
              onClick={() => handleGameHistory("mhistory")}
            >
              My history
            </button>
          </div>
        </div>
        {/* result game history */}

        {gameHistory == "ghistory" && (
          <div>
            <div className="grid grid-cols-12 nav-bg text-white rounded-t-md p-2 mt-5">
              <div className="col-span-4 flex text-center justify-center">
                <h5 className="heading-h5 text-base">Period</h5>
              </div>

              <div className="col-span-4  text-center justify-center">
                <h5 className="heading-h5 text-base">Sum</h5>
              </div>
              <div className="col-span-4  text-center justify-center">
                <h5 className="heading-h5 text-base">Results</h5>
              </div>
            </div>

            {Array.isArray(k3PeriodListData?.data?.gameslist) &&
              k3PeriodListData?.data?.gameslist.map((item, i) => (
                <div className="grid grid-cols-12 bg-light p-2 py-3" key={i}>
                  <div className="col-span-4 flex text-center justify-center items-center">
                    <span className="text-sm gray-100 relative flex">
                      {item?.period}
                    </span>
                  </div>
                  <div className="col-span-1 text-center justify-center items-center">
                    <span className="text-sm gray-100  ">
                      {String(item.result)
                        .split("")
                        .reduce((acc, digit) => acc + parseInt(digit), 0)}
                    </span>
                  </div>
                  <div className="col-span-2  text-center justify-center  items-center">
                    <span className="text-sm gray-100  ">
                      {String(item.result)
                        .split("")
                        .reduce((acc, digit) => acc + parseInt(digit), 0) > 10
                        ? "Big"
                        : "Small"}
                    </span>
                  </div>
                  <div className="col-span-2  text-center justify-center  items-center">
                    <span className="text-sm gray-100">
                      {String(item.result)
                        .split("")
                        .reduce((acc, digit) => acc + parseInt(digit), 0) %
                        2 ==
                      0
                        ? "Even"
                        : "Odd"}
                    </span>
                  </div>
                  <div className="col-span-3 flex text-center justify-center  items-center">
                    <span className="fs-sm gray-100  flex justify-center items-center">
                      {getImageFromNumber(item.result).map((img, i) => (
                        <img
                          src={img}
                          alt=""
                          key={i}
                          className="w-[20px] h-[20px] mx-1"
                        />
                      ))}
                    </span>
                  </div>
                </div>
              ))}
            <div className="bg-light p-6 flex items-center justify-center mt-5">
              <button
                className={`rounded-md p-2 mr-4 ${
                  pageto / 10 >= 2
                    ? "bg-color-l2 text-whites"
                    : " bg-blues text-whites"
                } `}
                disabled={pageto / 10 > 1 ? false : true}
                onClick={handleDecrease}
              >
                <Link>
                  {" "}
                  <IoIosArrowBack className="text-lg" />
                </Link>
              </button>
              <span className="fs-sm gray-100">
                {pageto / 10}/{k3PeriodListData?.page}
              </span>
              <button
                className={`rounded-md p-2 ms-4 ${
                  k3PeriodListData?.page
                    ? "bg-color-l2 text-white"
                    : "bg-[#E6EBF0]"
                } `}
                disabled={k3PeriodListData?.page > pageto / 10 ? false : true}
                onClick={handleIncrease}
              >
                <Link>
                  {" "}
                  <IoIosArrowForward className="text-lg text-whites" />
                </Link>
              </button>
            </div>
          </div>
        )}

        {gameHistory == "chart" && (
          <div>
            <div className="grid grid-cols-12 nav-bg text-white rounded-t-md p-2 mt-5">
              <div className="col-span-4 flex text-center justify-center">
                <h5 className="heading-h5 text-base">Period</h5>
              </div>

              <div className="col-span-4  text-center justify-center">
                <h5 className="heading-h5 text-base">Results</h5>
              </div>
              <div className="col-span-4  text-center justify-center">
                <h5 className="heading-h5 text-base">Number</h5>
              </div>
            </div>
            {Array.isArray(k3PeriodListData?.data?.gameslist) &&
              k3PeriodListData?.data?.gameslist.map((item, i) => (
                <div className="grid grid-cols-11 bg-light p-2 py-3" key={i}>
                  <div className="col-span-4 flex text-center justify-center items-center">
                    <span className="text-sm gray-100  relative flex">
                      {item.period}
                    </span>
                  </div>

                  <div className="col-span-3 flex text-center justify-center  items-center">
                    <span className="fs-sm gray-100  flex justify-center items-center">
                      {getImageFromNumber(item.result).map((img, i) => (
                        <img
                          src={img}
                          alt=""
                          key={i}
                          className="w-[20px] h-[20px] mx-1"
                        />
                      ))}
                    </span>
                  </div>
                  <div className="col-span-4  text-center justify-center  items-center">
                    <span className="text-sm gray-100">
                      {new Set(String(item.result)).size == 1
                        ? "3 same numbers"
                        : new Set(String(item.result)).size == 2
                        ? "2 same numbers"
                        : new Set(String(item.result)).size == 3
                        ? "3 different numbers"
                        : item.result}
                    </span>
                  </div>
                </div>
              ))}
            <div className="bg-light p-6 flex items-center justify-center mt-5">
              <button
                className={`rounded-md p-2 mr-4 ${
                  pageto / 10 >= 2
                    ? "bg-color-l2 color-orange"
                    : " bg-blues text-whites"
                } `}
                disabled={pageto / 10 > 1 ? false : true}
                onClick={handleDecrease}
              >
                <Link>
                  {" "}
                  <IoIosArrowBack className="text-lg" />
                </Link>
              </button>
              <span className="fs-sm gray-100">
                {pageto / 10}/{k3PeriodListData?.page}
              </span>
              <button
                className={`rounded-md p-2 ms-4 ${
                  k3PeriodListData?.page
                    ? "bg-color-l2 color-orange"
                    : " bg-[#E6EBF0]"
                } `}
                disabled={k3PeriodListData?.page > pageto / 10 ? false : true}
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
              <Link className="text-blue fs-sm border rounded-lg border-[#F5CC2C] px-3 py-1 flex item-center items-end text-whites">
                Details <IoIosArrowDropright className="mb-[2px]" />
              </Link>
            </div>

            {k3HistoryData?.data?.gameslist?.length > 0 ? (
              Array.isArray(k3HistoryData?.data?.gameslist) &&
              k3HistoryData?.data?.gameslist?.map((item, i) => (
                <div key={i}>
                  <div
                    className="  flex items-center justify-between"
                    onClick={() => handleDetail(i)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`flex font-semibold justify-center items-center h-10 w-10 rounded-lg mr-2
    ${
      /* 🔹 background colour */
      item.bet.split(",")[0] === "c"
        ? "bgs-green"
        : item.bet.split(",")[0] === "l"
        ? "bgs-red-200"
        : item.bet.split(",")[0] === "b"
        ? "color-yellow-bg-200"
        : "bgs-blue-500"
    }
    ${
      /* 🔹 font‑size  */
      ["b", "s", "c", "l"].includes(item.bet.split(",")[0])
        ? "text-[14px]"
        : "text-base"
    }
  `}
                      >
                        {item.bet.split(",")[0] === "c"
                          ? "Even"
                          : item.bet.split(",")[0] === "l"
                          ? "Odd"
                          : item.bet.split(",")[0] === "b"
                          ? "Big"
                          : item.bet.split(",")[0] === "s"
                          ? "Small"
                          : item.bet.split(",")[0]}
                      </div>

                      <div>
                        <h3 className="heading-h3 gray-50 text-md">
                          {item?.stage}
                        </h3>
                        <p className="fs-sm gray-100">{item.time}</p>
                      </div>
                    </div>
                    {item.status !== 0 && (
                      <div className="flex flex-col items-end">
                        <div
                          className={`min-w-[80px] text-center border px-3 py-[2px] rounded-md text-sm  ${
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
                    <h2 className="heading-h2 gray-50 text-lg">Details</h2>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2 rounded-md">
                      <span className=" gray-100 ">Order number</span>
                      <span className=" gray-100 flex item-center">
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
                      <span className=" gray-100 ">Period</span>
                      <span className=" gray-100 ">{item.stage}</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className=" gray-100 ">Purchase amount</span>
                      <span className=" gray-100 ">₹{item.money}</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className=" gray-100 ">Quantiy</span>
                      <span className=" gray-100 ">{item.amount}</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className="gray-100 ">Amount after tax</span>
                      <span className="color-red-200 ">₹{item.price}</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className="gray-100 ">Tax</span>
                      <span className="gray-100 ">₹{item.fee}</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className="gray-100 ">Result</span>
                      {item.status !== 0 && (
                        <div className=" flex text-center justify-center  items-center">
                          {getImageFromNumber(item.result).map((img, i) => (
                            <img
                              src={img}
                              alt=""
                              key={i}
                              className="w-[20px] h-[20px] mx-1"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className=" flex flex-col    bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <p className="gray-100">Select</p>
                      <span className=" gray-100 flex">
                        {item.typeGame}:{" "}
                        {item.bet.split(",")[0] == "c"
                          ? "Even"
                          : item.bet.split(",")[0] == "l"
                          ? "Odd"
                          : item.bet.split(",")[0] == "b"
                          ? "Big"
                          : item.bet.split(",")[0] == "s"
                          ? item.bet
                              .split(",")
                              .map((char) => mappings[char])
                              .join(" ")
                          : item.bet}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className=" gray-100 ">Status</span>
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
                    <div className="flex items-center justify-between  bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className=" gray-100 ">Win/loss</span>
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
                    <div className="flex items-center justify-between  bg-[#E6EBF0] p-1 mb-2  rounded-md">
                      <span className=" gray-100 ">Order time</span>
                      <span className=" gray-100 ">{item.time}</span>
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
                    ? "bg-color-l2 text-white"
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
              <span className="fs-sm gray-100">
                {pageto / 10}/{k3HistoryData?.page}
              </span>
              <button
                className={`rounded-md p-2 ms-4 ${
                  k3HistoryData?.page
                    ? "bg-color-l2 text-white"
                    : "bg-[#E6EBF0]"
                } `}
                disabled={k3HistoryData?.page > pageto / 10 ? false : true}
                onClick={handleIncrease}
              >
                <Link>
                  {" "}
                  <IoIosArrowForward className="text-lg text-whites" />
                </Link>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* <div className={openPopup ? "overlay-section block" : "hidden"}></div> */}

      {/* popups */}
      <div
        className={`bg-light z-[12]  items-center transition ease-in-out delay-150 justify-center fixed bottom-0 rounded-t-2xl filter-section w-[24.7rem] ${
          openPopup ? "flex" : "hidden"
        }`}
      >
        <div className=" rounded-t-2xl text-whites overflow-hidden w-full ">
          {selectTab == 1 && (
            <div className="px-4 pt-4 ">
              <h5>Total:</h5>
              <div className="flex items-center flex-wrap ">
                {selectedNumbers.map((item, i) => (
                  <div
                    key={i}
                    className={`w-7 mt-2 h-7 mx-1 fs-sm rounded-full flex items-center justify-center ${
                      i % 2 == 0 ? "bgs-red-200" : "bgs-green"
                    }`}
                  >
                    {item}
                  </div>
                ))}
                {selectedNumbers3?.map((item, i) => (
                  <div
                    key={i}
                    className={` mt-2 mx-1 w-10 py-1 fs-sm rounded-md flex items-center justify-center ${
                      item == "l"
                        ? "bgs-red-200"
                        : item == "c"
                        ? "bgs-green"
                        : item == "b"
                        ? "bg-yellow"
                        : "bgs-blue-500"
                    }`}
                  >
                    {item == "l"
                      ? "Odd"
                      : item == "c"
                      ? "Even"
                      : item == "b"
                      ? "Big"
                      : "Small"}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectTab == 2 && (
            <div className="px-4 pt-4">
              <h5>{selectedNumbers.length > 0 ? "2 matching numbers:" : ""}</h5>

              <div className="flex items-center flex-wrap ">
                {selectedNumbers?.map((item, i) => (
                  <div
                    key={i}
                    className={` mt-2 mx-1 w-8 py-1 fs-sm rounded-md flex items-center justify-center bgs-violet`}
                  >
                    {item}
                  </div>
                ))}
              </div>
              {selectedNumbers3.filter((num) => num >= 10 && num < 100).length >
                0 &&
                selectedNumbers3.filter((num) => num >= 0 && num < 10).length >
                  0 && (
                  <>
                    <h5>A unique number:</h5>
                    <div className="flex items-center flex-wrap ">
                      {selectedNumbers3
                        .filter((num) => num >= 10 && num < 100)
                        .map((item, i) => (
                          <>
                            <div
                              key={i}
                              className={`  mt-2 mx-1 fs-sm rounded-md flex items-center justify-center `}
                            >
                              <span className="bgs-red-200 p-1 px-2 rounded-s-md">
                                {item}
                              </span>{" "}
                              <span className="bgs-green p-1 px-2 rounded-e-md">
                                {selectedNumbers3
                                  .filter((num) => num >= 0 && num < 10)
                                  .join(", ")}
                              </span>
                            </div>
                          </>
                        ))}
                    </div>
                  </>
                )}
            </div>
          )}
          {selectTab == 3 && (
            <div className="px-4 pt-4">
              <h5>
                {selectedNumbers.length > 0 ? "3 of the same number:" : ""}
              </h5>

              <div className="flex items-center flex-wrap ">
                {selectedNumbers?.map((item, i) => (
                  <div
                    key={i}
                    className={` mt-2 mx-1 w-10 py-1 fs-sm rounded-md flex items-center justify-center bgs-violet`}
                  >
                    {item}
                  </div>
                ))}
              </div>
              {selectedNumbers3.length > 0 && (
                <>
                  <h5>Any 3 of the same number:</h5>
                  <div className="flex items-center flex-wrap ">
                    {selectedNumbers3.map((item, i) => (
                      <>
                        <div
                          key={i}
                          className={`  mt-2 mx-1 py-1 px-5 fs-sm rounded-md flex items-center justify-center bgs-red-200`}
                        >
                          {item == "@3" ? "3 continuous numbers" : item}
                        </div>
                      </>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {selectTab == 4 && (
            <div className="px-4 pt-4">
              {selectedNumbers.length > 2 && (
                <>
                  <h5>3 different numbers:</h5>

                  <div className="flex items-center flex-wrap ">
                    {selectedNumbers?.map((item, i) => (
                      <div
                        key={i}
                        className={` mt-2 mx-1 w-7 py-1 fs-sm rounded-md flex items-center justify-center bgs-violet`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedNumbers3.map((item, i) => (
                <Fragment key={i}>
                  {item == "@u@" && (
                    <>
                      <h5>3 continuous numbers:</h5>
                      <div className="flex items-center flex-wrap ">
                        <>
                          <div
                            key={i}
                            className={`  mt-2 mx-1 py-1 px-5 fs-sm rounded-md flex items-center justify-center bgs-red-200`}
                          >
                            3 continuous numbers
                          </div>
                        </>
                      </div>
                    </>
                  )}
                </Fragment>
              ))}

              {selectedNumbers3.filter((item) => item !== "@u@").length > 1 && (
                <>
                  <h5 className="mt-1">2 different numbers:</h5>
                  <div className="flex items-center flex-wrap ">
                    {selectedNumbers3
                      .filter((item) => item !== "@u@")
                      .map((item, i) => (
                        <div
                          key={i}
                          className={`  mt-2 mx-1 py-1 px-5 fs-sm rounded-md flex items-center justify-center bgs-violet`}
                        >
                          {item}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}
          <div className="p-4  ">
            <div className="flex justify-between items-center mb-4">
              <span>Balance</span>
              <div className="flex space-x-2">
                {balanceOptions.map((value) => (
                  <button
                    key={value}
                    onClick={() => setBalance(value)}
                    className={`text-base mx-1 px-2 py-[3px]  rounded-md ${
                      balance === value
                        ? "bg-color-l2 color-orange"
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
                  className={`color-orange text-lg p-[3px] font-bold mx-1  flex items-center justify-center rounded-md 
                     bg-color-l2
                      `}
                >
                  <FaMinus className="svg-white" />
                </button>
                <input
                  type="number"
                  value={multiplier}
                  className="w-20 text-center bgs-body outline-none border sky-border] mx-3"
                  name=""
                  id=""
                  onChange={(e) => setMultiplier(e.target.value)}
                />
                <button
                  onClick={() => setMultiplier(multiplier + 1)}
                  className={`color-orange text-lg  p-[3px] font-bold mx-1  flex items-center justify-center rounded-md  
                     bg-color-l2
                      `}
                >
                  <FaPlus className="svg-white" />
                </button>
              </div>
            </div>

            <div className=" items-center flex justify-end mb-5 ">
              {xData.map((item, i) => (
                <button
                  className={` text-base mx-1 px-2 py-[3px]  rounded-md ${
                    activeX === i
                      ? "bg-color-l2 color-orange"
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
                    className={`w-4 h-4 text-whites ${
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
                <span className="gray-100 ms-2 mr-2 text-sm cursor-pointer">
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
              className="bg-[#E6EBF0] text-whites w-[40%] p-2 text-sm font-medium"
              onClick={() => {
                setOpenPopup(false);
                setSelectedNumbers3([]);
                setSelectedNumbers([]);
              }}
            >
              Cancel
            </button>
            <button
              className={` w-[60%] p-2 bg-color-l2 color-orange text-sm font-medium `}
              disabled={loader ? true : false}
              onClick={handleBet}
            >
              Total amount ₹{totalAmount.toFixed(2)}
            </button>
          </div>
        </div>
      </div>

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
            style={{ position: "absolute", top: "37%" }}
          >
            <p
              className={` text-[2rem] text-center font-bold ${
                winResult ? "text-white" : "color-slate-500"
              }`}
            >
              {winResult ? "Congratulations" : "Sorry"}
            </p>

            <div className="fs-sm gray-100  flex justify-center items-center mt-3">
              {Array.isArray(k3PeriodListData?.data?.gameslist) &&
                getImageFromNumber(
                  k3PeriodListData?.data?.gameslist[0]?.result
                ).map((img, i) => (
                  <img
                    src={img}
                    alt=""
                    key={i}
                    className="w-[20px] h-[20px] mx-1"
                  />
                ))}
            </div>
            <div className="flex justify-center items-center mt-2">
              <span
                className={`text-sm w-14 text-center py-[1px] text-white rounded-md ${
                  winResult
                    ? "color-yellow-bg-200"
                    : "bgs-slate-500 border border-white"
                }`}
              >
                {(Array.isArray(k3PeriodListData?.data?.gameslist) &&
                  String(k3PeriodListData?.data?.gameslist[0].result)
                    .split("")
                    .reduce((acc, digit) => acc + parseInt(digit), 0)) > 10
                  ? "Big"
                  : "Small"}
              </span>
              <span
                className={`text-sm w-7 h-7 text-center mx-2  text-white rounded-full flex justify-center items-center ${
                  winResult
                    ? "color-yellow-bg-200"
                    : "bgs-slate-500 border border-white"
                }`}
              >
                {Array.isArray(k3PeriodListData?.data?.gameslist) &&
                  String(k3PeriodListData?.data?.gameslist[0].result)
                    .split("")
                    .reduce((acc, digit) => acc + parseInt(digit), 0)}
              </span>
              <span
                className={`text-sm w-14 text-center py-[1px] text-white rounded-md ${
                  winResult
                    ? "color-yellow-bg-200"
                    : "bgs-slate-500 border border-white"
                }`}
              >
                {(Array.isArray(k3PeriodListData?.data?.gameslist) &&
                  String(k3PeriodListData?.data?.gameslist[0].result)
                    .split("")
                    .reduce((acc, digit) => acc + parseInt(digit), 0)) %
                  2 ==
                0
                  ? "Even"
                  : "Odd"}
              </span>
            </div>
            <div>
              {winResult ? (
                <div className=" color-red-200 mt-5 text-center font-bold">
                  <p>Bonus</p>
                  <p className="text-[1.5rem] relative top-[-3px] font-bold">
                    ₹
                    {Array.isArray(k3HistoryData?.data?.gameslist) &&
                      k3HistoryData?.data?.gameslist[0]?.get}
                  </p>
                </div>
              ) : (
                <p className="text-[2rem] gray-color mt-5 text-center font-medium">
                  Lose
                </p>
              )}
            </div>
            <p
              className={`fs-sm gray-100 text-center font-semibold ${
                winResult ? "mt-1" : "mt-3"
              }`}
            >
              Period: K3 {typeid1} Minute{" "}
              {Array.isArray(k3PeriodListData?.data?.gameslist) &&
                k3PeriodListData?.data?.gameslist[0]?.period}
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
            className="color-white absolute bottom-[15%] text-2xl"
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
          <div className=" blue-linear w-full text-center text-white text-xl py-2  rounded-t-2xl">
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

export default K3;
