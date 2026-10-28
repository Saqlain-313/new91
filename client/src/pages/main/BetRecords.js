import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

import { AiOutlineSmallDash } from "react-icons/ai";
import { FaRegDotCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

import { BiHeartCircle } from "react-icons/bi";
import { MdSportsBasketball, MdSportsSoccer } from "react-icons/md";
import { PiApplePodcastsLogo, PiTelevisionSimpleFill } from "react-icons/pi";

import EightImg from "../../assets/eight.png";
import FiveImg from "../../assets/five.png";
import FourImg from "../../assets/four.png";
import NineImg from "../../assets/nine.png";
import OneImg from "../../assets/one.png";
import SevenImg from "../../assets/seven.png";
import SixImg from "../../assets/six.png";
import ThreeImg from "../../assets/three.png";
import TwoImg from "../../assets/two.png";
import ZeroImg from "../../assets/zero.png";
import { wingoHistory } from "../../store/reducer/gameReducer";

import N1 from "../../assets/n1.png";
import N2 from "../../assets/n2.png";
import N3 from "../../assets/n3.png";
import N4 from "../../assets/n4.png";
import N5 from "../../assets/n5.png";
import N6 from "../../assets/n6.png";
import Calendar from "../../Calender";
import CustomeNavbar from "../../components/CustomeNavbar";
import FilterType from "../../components/FilterType";
import { userDetail } from "../../store/reducer/authReducer";
import { gameHistory } from "../../store/reducer/spribeGameReducer";

const WingoImg = "https://i.ibb.co/zVZgB3R4/wingo.png";
const k3Img = "https://i.ibb.co/tNYcJVL/K3.png";
const FivedImg = "https://i.ibb.co/Wp47LJKC/5D.png";
const TrxImg = "https://i.ibb.co/7NNbggVw/motoracing.png";
// const carImg = "https://i.ibb.co/7NNbggVw/motoracing.png";
const ImgData = [
  ZeroImg,
  OneImg,
  TwoImg,
  ThreeImg,
  FourImg,
  FiveImg,
  SixImg,
  SevenImg,
  EightImg,
  NineImg,
];

// name = getGameKey() ka output (neeche dekho)
const allDate = [
  {
    img: null,
    title: "All",
    name: null,
  },
  {
    img: WingoImg,
    title: "Win Go",
    name: "wingo",
  },
  {
    img: TrxImg,
    title: "TRX",
    name: "trx",
  },
  {
    img: FivedImg,
    title: "5D",
    name: "5d",
  },
  {
    img: k3Img,
    title: "K3",
    name: "k3",
  },
];

const imgData = {
  1: N1,
  2: N2,
  3: N3,
  4: N4,
  5: N5,
  6: N6,
};
const getImageFromNumber = (number) => {
  if (number === null || number === undefined || number === "") return [];
  return String(number)
    .split("")
    .map((num) => imgData[num])
    .filter(Boolean);
};

// "wingo10" -> "wingo", "5D 1" -> "5d", "K3 1" -> "k3", "cargame"/"trx" -> "trx"
const getGameKey = (game) => {
  const g = String(game || "")
    .toLowerCase()
    .trim();
  if (g.startsWith("wingo")) return "wingo";
  if (g.startsWith("trx") || g.startsWith("cargame")) return "trx";
  if (g.startsWith("5d")) return "5d";
  if (g.startsWith("k3")) return "k3";
  return g;
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);

  // Extract year, month, and day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1
  const day = String(date.getDate()).padStart(2, "0");

  // Format as "YYYY-MM-DD"
  return `${year}-${month}-${day}`;
};

// Kisi bhi value (string / Date / timestamp) ko "YYYY-MM-DD" me convert karta hai
const toDateStr = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  if (/^\d{10,}$/.test(String(value))) {
    return formatDate(new Date(Number(value)));
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return formatDate(d);
};

// Wingo/TRX me `today` hota hai, 5D/K3 me sirf `time`
const getItemTime = (item) => item?.today || item?.time || "";

const getTimestamp = (item) => {
  const v = getItemTime(item);
  if (!v) return 0;
  if (/^\d{10,}$/.test(String(v))) return Number(v);
  const t = new Date(String(v).replace(" ", "T")).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const BetRecords = () => {
  const { gameHistoryData } = useSelector((state) => state.spribeGame);
  const { wingoHistoryData } = useSelector((state) => state.game);
  const { userInfo } = useSelector((state) => state.auth);
  const [openAll, setOpenAll] = useState(false);

  const [isName, setIsName] = useState(null);

  const [searchLevel, setSearchLevel] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  // new
  const [activeIndex, setActiveIndex] = useState(0);

  const dispatch = useDispatch();

  const handleOpenAll = () => {
    setOpenAll(!openAll);
  };

  const handleClick = (data) => {
    setIsName(data);
    setSearchLevel(data);
  };

  const selectedTitle =
    allDate.find((item) => item.name === searchLevel)?.title || "All";

  const filteredData = Array.isArray(wingoHistoryData?.gameslist)
    ? wingoHistoryData.gameslist
        .filter((item) => {
          const matchesDate = selectedDate
            ? toDateStr(getItemTime(item)) === toDateStr(selectedDate)
            : true; // Show all if no date is selected

          const matchesLevel = searchLevel
            ? getGameKey(item.game) === searchLevel
            : true; // Show all if no game type is selected

          return matchesLevel && matchesDate;
        })
        // latest bet sabse upar
        .sort((a, b) => getTimestamp(b) - getTimestamp(a))
    : [];

  const filteredThirdParty = Array.isArray(gameHistoryData)
    ? gameHistoryData.filter((item) => {
        if (!selectedDate) return true;
        return toDateStr(getItemTime(item)) === toDateStr(selectedDate);
      })
    : [];

  useEffect(() => {
    let typeid1 = 15;
    dispatch(wingoHistory({ typeid1 }));
  }, [dispatch, isName]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleClicks = (index, item) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    let phone = userInfo?.phone_user;
    dispatch(gameHistory({ phone: phone }));
    dispatch(userDetail());
  }, [dispatch]);

  //   8273142996

  const items = [
    { name: "Lottery", icon: <MdSportsBasketball /> },
    { name: "Casino", icon: <PiTelevisionSimpleFill /> },
    {
      name: "Sports",
      icon: <MdSportsSoccer />,
    },
    { name: "Rummy", icon: <BiHeartCircle /> },
    { name: "Slots", icon: <PiApplePodcastsLogo /> },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <CustomeNavbar name="Bet history" />

      <FilterType
        items={items}
        activeIndex={activeIndex}
        onActiveChange={handleClicks}
      />

      <div className="container-section">
        <div className="grid grid-cols-12 gap-2 mt-2">
          <div
            className="col-span-6 nav-bg flex cursor-pointer justify-between items-center p-2 rounded-md"
            onClick={handleOpenAll}
          >
            <span className="text-base text-whites">{selectedTitle}</span>
            <span>
              <IoIosArrowDown className="text-base text-whites" />
            </span>
          </div>
          <div className="col-span-6 nav-bg">
            <Calendar
              onDateSelect={handleDateSelect}
              onValueChange={handleDateSelect}
            />
          </div>
        </div>
      </div>

      {activeIndex === 0 ? (
        <div className="container-section mt-5">
          {filteredData.map((data, i) => {
            const gameKey = getGameKey(data.game);
            return (
              <div
                className="nav-bg rounded-xl  mt-3 pb-4 pt-3"
                key={data.id_product || i}
              >
                <div className="flex justify-between items-center px-3">
                  <h3 className="heading-h3 font-semibold text-whites">
                    {data.game === "wingo10"
                      ? "Wingo 30 sec"
                      : data.game === "cargame"
                        ? "Moto Bike"
                        : data.game}
                  </h3>

                  <p
                    className={`text-base   ${
                      data.status === 0
                        ? "color-yellow-200"
                        : data.status === 1
                          ? "color-green"
                          : "color-red-200"
                    }`}
                  >
                    {data.status === 0
                      ? "Pending"
                      : data.status === 1
                        ? "Win"
                        : "Lose"}
                  </p>
                </div>
                <p className="fs-sm px-3 text-whites border-b border-color-slat leading-5">
                  {getItemTime(data)}
                </p>
                <ul className="px-2 mt-2">
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                        {i < 5 ? (
                          <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 blue-color-300 fs-sm" />
                        ) : (
                          ""
                        )}
                      </div>
                      <p className="text-whites text-sm ">Type </p>
                    </div>
                    <span className=" text-sm text-whites">{data.game}</span>
                  </li>
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                        {i < 5 ? (
                          <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 blue-color-300 fs-sm" />
                        ) : (
                          ""
                        )}
                      </div>
                      <p className="text-whites text-sm ">Poriod </p>
                    </div>
                    <span className=" text-sm  text-whites">{data.stage}</span>
                  </li>
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                        {i < 5 ? (
                          <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 blue-color-300 fs-sm" />
                        ) : (
                          ""
                        )}
                      </div>
                      <p className="text-whites text-sm ">Order number</p>
                    </div>
                    <span className=" text-sm  text-whites">
                      {data.id_product}
                    </span>
                  </li>
                  <li className="flex  justify-between">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                        {i < 5 ? (
                          <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 blue-color-300 fs-sm" />
                        ) : (
                          ""
                        )}
                      </div>
                      <p className="text-whites text-sm ">Select</p>
                    </div>
                    <span className=" text-sm  text-whites">
                      {data.bet == "x"
                        ? "Green"
                        : data.bet == "t"
                          ? "Voilet"
                          : data.bet == "b"
                            ? "Big"
                            : data.bet == "n"
                              ? "Small"
                              : data.bet == "d"
                                ? "Red"
                                : data.bet}
                    </span>
                  </li>
                  <li className="flex  justify-between">
                    <div className="flex leading-3">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      </div>
                      <p className="text-whites text-sm ">Total bet</p>
                    </div>
                    <span className=" text-sm  text-whites">
                      ₹{data.amount}
                    </span>
                  </li>
                </ul>

                <div className="line-two"></div>
                <div className="px-3">
                  <div className="flex mb-5">
                    <div className="flex  flex-col items-center mt-[3px] mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 blue-color-300 fs-sm" />
                    </div>
                    <p className="text-whites text-base ">Lottery Result</p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex ">
                      <div className="flex  flex-col items-center mt-[3px] mr-1">
                        <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      </div>
                      {/* wingo / trx */}
                      {(gameKey === "wingo" || gameKey === "trx") && (
                        <div className="flex  items-center">
                          <img
                            src={ImgData[data.result]}
                            className="w-8"
                            alt=""
                          />
                          <span
                            className={` text-base p-1 ms-2 rounded-md px-2  ${
                              data.result >= 4 ? "bg-yellow" : "bgs-blue-500"
                            }`}
                          >
                            {data.result >= 4 ? "Big" : "Small"}
                          </span>
                          <span
                            className={`text-base p-1 ms-2 rounded-md px-2 ${
                              data.result == "0"
                                ? "bg-red-voilet"
                                : data.result == "5"
                                  ? "bg-green-voilet"
                                  : data.result == 1 ||
                                      data.result == 3 ||
                                      data.result == 7 ||
                                      data.result == 9
                                    ? "bgs-green"
                                    : "bgs-red-200"
                            }`}
                          >
                            {data.result == "0"
                              ? "Voilet Red"
                              : data.result == "5"
                                ? "Voilet Green"
                                : data.result == 1 ||
                                    data.result == 3 ||
                                    data.result == 7 ||
                                    data.result == 9
                                  ? "Green"
                                  : "Red"}
                          </span>
                        </div>
                      )}
                      {/* 5D */}
                      {gameKey === "5d" && (
                        <div className="flex  items-center">
                          {String(data.result ?? "")
                            .split("")
                            .map((item, idx) => (
                              <img
                                src={ImgData[item]}
                                className="w-8 mr-1"
                                alt=""
                                key={idx}
                              />
                            ))}
                        </div>
                      )}
                      {/* K3 */}
                      {gameKey === "k3" && (
                        <div className="flex  items-center">
                          {getImageFromNumber(data.result).map((img, idx) => (
                            <img
                              src={img}
                              alt=""
                              className="w-[20px] h-[20px] mx-1"
                              key={idx}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex item-center justify-between mb-4 mx-3 mt-5">
                  <div className="bg-popup-nav  w-[48%] p-2 py-3 rounded-md flex justify-center items-center flex-col">
                    <p className="text-sm">₹{data.money}</p>
                    <p className="text-sm">Actual amount</p>
                  </div>

                  <div className="bg-popup-nav w-[48%] p-2 rounded-md  flex justify-center items-center flex-col">
                    <p className="text-sm">
                      ₹{data.status == 1 ? data.get : 0.0}
                    </p>
                    <p className="text-sm">Winnings</p>
                  </div>
                </div>
                <div className="flex item-center justify-between mb-3 mx-3">
                  <div className="bg-popup-nav  w-[48%] p-2 py-3 rounded-md flex justify-center items-center flex-col">
                    <p className="text-sm">₹{data.fee}</p>
                    <p className="text-sm">Handling fee</p>
                  </div>

                  <div className="bg-popup-nav w-[48%] p-2 rounded-md  flex justify-center items-center flex-col">
                    <p
                      className={`text-sm  ${
                        data.status == 1 ? "text-white" : "white"
                      }`}
                    >
                      {data.status == 2 ? "-" : ""}₹
                      {data.status == 1
                        ? (Number(data.get) - Number(data.amount)).toFixed(2)
                        : Number(data.amount).toFixed(2)}
                    </p>
                    <p className="text-sm">Profit/loss</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="container-section mt-5">
          {filteredThirdParty.map((data, i) => (
            <div className="nav-bg rounded-xl  mt-3 pb-4 pt-3" key={i}>
              <div className="flex justify-between items-center px-3">
                <h3 className="heading-h3 font-semibold text-whites">
                  {data.game === "wingo10" ? "Wingo 30 sec" : data.game}
                </h3>

                <p
                  className={`text-base   ${
                    data.status === 0
                      ? "color-yellow-200"
                      : data.status === 1
                        ? "color-green"
                        : "color-red-200"
                  }`}
                >
                  {data.status === 0
                    ? "Pending"
                    : data.status === 1
                      ? "Win"
                      : "Lose"}
                </p>
              </div>
              <p className="fs-sm px-3 text-whites border-b border-color-slat leading-5">
                {getItemTime(data)}
              </p>
              <ul className="px-2 mt-2">
                <li className="flex  justify-between">
                  <div className="flex ">
                    <div className="flex  flex-col items-center mt-[3px] mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      {i < 5 ? (
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 blue-color-300 fs-sm" />
                      ) : (
                        ""
                      )}
                    </div>
                    <p className="text-whites text-sm ">Type </p>
                  </div>
                  <span className=" text-sm text-whites">{data.game_type}</span>
                </li>
                <li className="flex  justify-between">
                  <div className="flex ">
                    <div className="flex  flex-col items-center mt-[3px] mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      {i < 5 ? (
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 blue-color-300 fs-sm" />
                      ) : (
                        ""
                      )}
                    </div>
                    <p className="text-whites text-sm ">Game name </p>
                  </div>
                  <span className=" text-sm  text-whites">
                    {data.game_name}
                  </span>
                </li>
                <li className="flex  justify-between">
                  <div className="flex ">
                    <div className="flex  flex-col items-center mt-[3px] mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      {i < 5 ? (
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 blue-color-300 fs-sm" />
                      ) : (
                        ""
                      )}
                    </div>
                    <p className="text-whites text-sm ">Order number</p>
                  </div>
                  <span className=" text-sm  text-whites">
                    {data.game_round}
                  </span>
                </li>

                <li className="flex  justify-between">
                  <div className="flex leading-3">
                    <div className="flex  flex-col items-center mt-[3px] mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      {i < 5 ? (
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 blue-color-300 fs-sm" />
                      ) : (
                        ""
                      )}
                    </div>
                    <p className="text-whites text-sm ">Game provider</p>
                  </div>
                  <span className=" text-sm  text-whites">{data.provider}</span>
                </li>
                <li className="flex  justify-between">
                  <div className="flex ">
                    <div className="flex  flex-col items-center mt-[3px] mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      {i < 5 ? (
                        <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 blue-color-300 fs-sm" />
                      ) : (
                        ""
                      )}
                    </div>
                    <p className="text-whites text-sm ">Select</p>
                  </div>
                  <span className=" text-sm  text-whites">
                    <img src={data.icon} className="w-5" alt="" />
                  </span>
                </li>
                <li className="flex  justify-between">
                  <div className="flex leading-3">
                    <div className="flex  flex-col items-center mt-[3px] mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                    </div>
                    <p className="text-whites text-sm ">Bet Amount</p>
                  </div>
                  <span className=" text-sm  text-whites">
                    ₹{data.bet_amount}
                  </span>
                </li>
              </ul>

              <div className="line-two"></div>
              <div className="px-3">
                <div className="flex mb-5">
                  <div className="flex  flex-col items-center mt-5 mr-1">
                    <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                    <AiOutlineSmallDash className="rotate-90 mt-[2px] mr-1 blue-color-300 fs-sm" />
                  </div>
                  <p className="text-whites text-base mt-5 ">Third party </p>
                </div>

                <div className="flex items-center">
                  <div className="flex ">
                    <div className="flex  flex-col items-center mt-[3px] mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                    </div>
                    {/* wingo  */}
                  </div>
                </div>
              </div>
              <div className="flex item-center justify-between mb-4 mx-3 mt-5">
                <div className="bg-popup-nav  w-[48%] p-2 py-3 rounded-md flex justify-center items-center flex-col">
                  <p className="text-sm">₹{data.bet_amount}</p>
                  <p className="text-sm">Actual amount</p>
                </div>

                <div className="bg-popup-nav w-[48%] p-2 rounded-md  flex justify-center items-center flex-col">
                  <p className="text-sm">
                    ₹{data.status == 1 ? data.win_amount : 0.0}
                  </p>
                  <p className="text-sm">Winnings</p>
                </div>
              </div>
              <div className="flex item-center justify-between mb-3 mx-3">
                <div className="bg-popup-nav  w-[48%] p-2 py-3 rounded-md flex justify-center items-center flex-col">
                  <p className="text-sm">₹{0}</p>
                  <p className="text-sm">Handling fee</p>
                </div>

                <div className="bg-popup-nav w-[48%] p-2 rounded-md  flex justify-center items-center flex-col">
                  <p
                    className={`text-sm  ${
                      data.status == 1 ? "text-white" : "white"
                    }`}
                  >
                    {data.status == 2 ? "-" : ""}₹
                    {data.status == 1
                      ? (
                          Number(data.win_amount) - Number(data.bet_amount)
                        ).toFixed(2)
                      : Number(data.bet_amount).toFixed(2)}
                  </p>
                  <p className="text-sm">Profit/loss</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={openAll ? "overlay-section block" : "hidden"}></div>
      {openAll && (
        <div className="fixed z-[20] bottom-0 left-0 right-0 p-3 m-auto w-[24.7rem] rounded-t-xl bg-[#1d1d2a]  shadow-lg">
          <div className="grid grid-cols-12 gap-2 mt-2 mx-2">
            {allDate.map((item, i) => (
              <div
                key={i}
                className={`col-span-6 flex cursor-pointer  items-center p-2 rounded-md
                        ${isName === item.name ? "bg-color-l2" : "nav-bg"}
                        `}
                onClick={() => {
                  handleClick(item.name);
                  handleOpenAll();
                }}
              >
                {item.img ? (
                  <img src={item.img} alt="" className="w-10 h-10" />
                ) : (
                  <div className="w-10 h-10" />
                )}
                <p className="ms-3 text-whites">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default BetRecords;
