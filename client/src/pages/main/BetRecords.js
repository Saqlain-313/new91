import React, { useEffect, useState, useRef } from "react";
import { IoIosArrowBack, IoIosArrowDown } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";

import { FaRegDotCircle } from "react-icons/fa";
import ImgNumer1 from "../../assets/five.png";
import { AiOutlineSmallDash } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";

import { MdSportsBasketball, MdSportsSoccer } from "react-icons/md";
import { PiApplePodcastsLogo, PiTelevisionSimpleFill } from "react-icons/pi";
import { BiHeartCircle } from "react-icons/bi";
import styled from "styled-components";

import { wingoHistory } from "../../store/reducer/gameReducer";
import ZeroImg from "../../assets/zero.png";
import OneImg from "../../assets/one.png";
import TwoImg from "../../assets/two.png";
import ThreeImg from "../../assets/three.png";
import FourImg from "../../assets/four.png";
import FiveImg from "../../assets/five.png";
import SixImg from "../../assets/six.png";
import SevenImg from "../../assets/seven.png";
import EightImg from "../../assets/eight.png";
import NineImg from "../../assets/nine.png";

import N1 from "../../assets/n1.png";
import N2 from "../../assets/n2.png";
import N3 from "../../assets/n3.png";
import N4 from "../../assets/n4.png";
import N5 from "../../assets/n5.png";
import N6 from "../../assets/n6.png";
import Calendar from "../../Calender";
import FilterType from "../../components/FilterType";
import CustomeNavbar from "../../components/CustomeNavbar";
import EmptyData from "../activity/EmptyData";

const WingoImg = "https://i.ibb.co/hYR6Xnk/wingo.png";
const k3Img = "https://i.ibb.co/mXdjN2z/k3.png ";
const FivedImg = " https://i.ibb.co/CP7XwY6/fived.png";
const TrxImg = "https://i.ibb.co/GVjVKhP/trx.png";
const carImg = "https://i.ibb.co/5xSm1xPD/car.png";
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

const allDate = [
  {
    img: WingoImg,
    title: "Win Go",
    name: "wingo",
  },
  {
    img: TrxImg,
    title: "Trx Win Go",
    name: "trx",
  },
  {
    img: FivedImg,
    title: "5D",
    name: "d",
  },
  {
    img: k3Img,
    title: "K3",
    name: "K",
  },
  // {
  //   img: carImg,
  //   title: "Racing",
  //   name: "Racing",
  // },
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
  if (number) {
    return number
      ?.toString()
      ?.split("")
      .map((num) => imgData[num]);
  } else {
    throw new Error("Input is not a valid number or string");
  }
};

const BetRecords = () => {
  const { wingoHistoryData } = useSelector((state) => state.game);
  const [openAll, setOpenAll] = useState(false);

  const [isName, setIsName] = useState("wingo");

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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);

    // Extract year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1
    const day = String(date.getDate()).padStart(2, "0");

    // Format as "YYYY-MM-DD"
    return `${year}-${month}-${day}`;
  };

  const filteredData = wingoHistoryData?.gameslist?.filter((item) => {
    const itemDate = `${formatDate()}`;
    const matchesDate =
      selectedDate !== null ? itemDate === selectedDate : true; // Show all if no searchDate is provided

    const matchesLevel =
      searchLevel !== null
        ? item.game.replace(/\d+$/, "") == searchLevel
        : true; // Show all if no searchDate is provided

    return matchesLevel && matchesDate;
  });

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
            className="col-span-6 bg-body flex cursor-pointer justify-between items-center p-2 rounded-md"
            onClick={handleOpenAll}
          >
            <span className="text-base text-whites">All</span>
            <span>
              <IoIosArrowDown className="text-base text-whites" />
            </span>
          </div>
          <div className="col-span-6 bg-body">
            <Calendar
              onDateSelect={handleDateSelect}
              onValueChange={handleDateSelect}
            />
          </div>
        </div>
      </div>

      <div className="container-section mt-5">
        {filteredData?.length > 0 ? (
          Array.isArray(wingoHistoryData?.gameslist) &&
          filteredData?.map((data, i) => (
            <div className="bg-body rounded-xl  mt-3 pb-4 pt-3" key={i}>
              <div className="flex justify-between items-center px-3">
                <h3 className="text-lg font-bold text-whites">
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
              <p className="fs-sm px-3 text-[#70798b] border-b border-color-slat leading-5">
                {data.today}
              </p>
              <ul className="px-2 mt-3">
                <li className="flex mt-2 justify-between">
                  <div className="flex">
                    <div className="flex  flex-col items-center mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      {i < 5 ? (
                        <AiOutlineSmallDash className="rotate-90 mr-1 blue-color-300 fs-sm" />
                      ) : (
                        ""
                      )}
                    </div>
                    <p className="text-whites fs-sm">Type </p>
                  </div>
                  <span className=" text-sm text-whites">{data.game}</span>
                </li>
                <li className="flex mt-1 justify-between">
                  <div className="flex">
                    <div className="flex  flex-col items-center mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      {i < 5 ? (
                        <AiOutlineSmallDash className="rotate-90 mr-1 blue-color-300 fs-sm" />
                      ) : (
                        ""
                      )}
                    </div>
                    <p className="text-whites fs-sm">Poriod </p>
                  </div>
                  <span className="fs-sm  text-whites">{data.stage}</span>
                </li>
                <li className="flex mt-1 justify-between">
                  <div className="flex">
                    <div className="flex  flex-col items-center mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      {i < 5 ? (
                        <AiOutlineSmallDash className="rotate-90 mr-1 blue-color-300 fs-sm" />
                      ) : (
                        ""
                      )}
                    </div>
                    <p className="text-whites fs-sm">Order number</p>
                  </div>
                  <span className="fs-sm  text-whites">
                    {data.id_product}
                  </span>
                </li>
                <li className="flex mt-1 justify-between">
                  <div className="flex">
                    <div className="flex  flex-col items-center mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                      {i < 5 ? (
                        <AiOutlineSmallDash className="rotate-90 mr-1 blue-color-300 fs-sm" />
                      ) : (
                        ""
                      )}
                    </div>
                    <p className="text-whites fs-sm">Select</p>
                  </div>
                  <span className="fs-sm text-whites">
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
                <li className="flex  justify-between mt-1">
                  <div className="flex leading-3">
                    <div className="flex  flex-col items-center mt-[3px] mr-1">
                      <FaRegDotCircle className="blue-color-300 bg-white rounded-full fs-sm mr-1 border-b" />
                    </div>
                    <p className="text-whites fs-sm">Total bet</p>
                  </div>
                  <span className="fs-sm  text-whites">₹{data.amount}</span>
                </li>
              </ul>

              <div className="line-two"></div>
              <div className="px-3">
                <div className="flex mb-2">
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
                    {/* wingo  */}
                    {(data.game.includes("wingo") ||
                      data.game.includes("trx")) && (
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
                    {data.game.includes("5D") && (
                      <div className="flex  items-center">
                        {data?.result?.split("").map((item) => (
                          <img
                            src={ImgData[item]}
                            className="w-8 mr-1"
                            alt=""
                            key={i}
                          />
                        ))}
                      </div>
                    )}
                    {data.game.includes("K3") && (
                      <div className="flex  items-center">
                        {getImageFromNumber(data.result).map((img, i) => (
                          <img
                            src={img}
                            alt=""
                            className="w-[20px] h-[20px] mx-1"
                            key={i}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex item-center justify-between mb-4 mx-3 mt-5">
                <div className="bg-[#e6e6e6] text-whites w-[48%] p-2 py-3 rounded-md flex justify-center items-center flex-col">
                  <p className="text-sm">₹{data.money}</p>
                  <p className="text-sm">Actual amount</p>
                </div>

                <div className="text-whites bg-[#e6e6e6] w-[48%] p-2 rounded-md  flex justify-center items-center flex-col">
                  <p className="text-sm">
                    ₹{data.status == 1 ? data.get : 0.0}
                  </p>
                  <p className="text-sm">Winnings</p>
                </div>
              </div>
              <div className="flex item-center justify-between mb-3 mx-3">
                <div className="bg-[#e6e6e6] text-whites w-[48%] p-2 py-3 rounded-md flex justify-center items-center flex-col">
                  <p className="text-sm">₹{data.fee}</p>
                  <p className="text-sm">Handling fee</p>
                </div>

                <div className="text-whites bg-[#e6e6e6] w-[48%] p-2 rounded-md flex justify-center items-center flex-col">
                  <p
                    className={`text-sm ${
                      data.status == 1
                        ? Number(data.get) - Number(data.amount) > 0
                          ? "text-green-500"
                          : "text-red-500"
                        : "text-red-500"
                    }`}
                  >
                    {data.status == 2 ? "-" : ""}₹
                    {data.status == 1
                      ? (Number(data.get) - Number(data.amount)).toFixed(2)
                      : Number(data.amount).toFixed(2)}
                  </p>
                  <p className="text-sm">Profit/Loss</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyData />
        )}
      </div>

      <div className={openAll ? "overlay-section block" : "hidden"}></div>
      {openAll && (
        <div className="fixed z-[20] bottom-0 left-0 right-0 p-3 m-auto w-[24.7rem] rounded-t-xl bg-[#F6F6F6]  shadow-lg">
          <div className="grid grid-cols-12 gap-2 mt-2 mx-2">
            {allDate.map((item, i) => (
              <div
                key={i}
                className={`col-span-6 flex cursor-pointer  items-center p-2 rounded-md
                        ${isName == item.name ? "bg-color-l2" : "bg-body"}
                        `}
                onClick={() => {
                  handleClick(item.name);
                  handleOpenAll();
                }}
              >
                <img src={item.img} alt="" className="w-10 h-10" />
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
