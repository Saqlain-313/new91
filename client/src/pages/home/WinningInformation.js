// src/Slider.js
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Avatar1 from "../../assets/avatar1.png";
import Avatar2 from "../../assets/avatar2.png";
import Avatar3 from "../../assets/avatar3.png";
import Avatar4 from "../../assets/avatar4.png";
import Avatar5 from "../../assets/avatar5.png";

// import EarningImg from "../../assets/yarwin/earningchart.png";
import NewEarningImg from "../../assets/Images/NewEarningImage.svg";
import { FaRegGrinWink } from "react-icons/fa";

import WinImg5 from "../../assets/trx.png";
import WinImg2 from "../../assets/wingimg2.png";
import WinImg4 from "../../assets/wingo.png";
import WinImg1 from "../../assets/winimg1.png";
import WinImg3 from "../../assets/winimg3.png";

import Place1 from "../../assets/tiranga/place1.png";
import Place2 from "../../assets/tiranga/place2.png";
import Place3 from "../../assets/tiranga/place3.png";
import { AvatarData } from "../main/AvatarData";

const earnings = [
  {
    id: 1,
    name: "Mem***UEW",
    rank: "NO1",
    amount: "100,992",
    highlight: true,
    image: Avatar1,
  },
  {
    id: 2,
    name: "Mem***CBJ",
    rank: "NO2",
    amount: "70,866",
    highlight: true,
    image: Avatar2,
  },
  {
    id: 3,
    name: "Mem***ZWS",
    rank: "NO3",
    amount: "69087",
    highlight: true,
    image: Avatar4,
  },
  {
    id: 4,
    name: "Mem***SUG",
    rank: "NO4",
    amount: "60560",
    highlight: false,
    image: Avatar5,
  },
  {
    id: 5,
    name: "Mem***HOG",
    rank: "NO5",
    amount: "58933",
    highlight: false,
    image: Avatar3,
  },
];

// Random text and number generators
const generateRandomText = () => {
  const prefix = "MEM***";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = prefix;
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getRandomINumber = () => {
  return (Math.random() * 1000).toFixed(2);
};
const data = [
  {
    name: "JILI",
    text: generateRandomText(),
    img: "https://i.ibb.co/fV1VqSHX/icon.png",
    number: getRandomINumber(),
  },
  {
    name: "JILI",
    text: generateRandomText(),
    img: "https://i.ibb.co/fV1VqSHX/icon.png",
    number: getRandomINumber(),
  },
  {
    name: "JILI",
    text: generateRandomText(),
    img: "https://i.ibb.co/fV1VqSHX/icon.png",
    number: getRandomINumber(),
  },
  {
    name: "Moto Racing",
    text: generateRandomText(),
    img: "https://i.ibb.co/fV1VqSHX/icon.png",
    number: getRandomINumber(),
  },
  {
    name: "PG",
    text: generateRandomText(),
    img: "https://i.ibb.co/fV1VqSHX/icon.png",
    number: getRandomINumber(),
  },
  {
    name: "PG",
    text: generateRandomText(),
    img: "https://i.ibb.co/fV1VqSHX/icon.png",
    number: getRandomINumber(),
  },
  {
    name: "SABA",
    text: generateRandomText(),
    img: "https://i.ibb.co/fV1VqSHX/icon.png",
    number: getRandomINumber(),
  },
  {
    name: "ARBET",
    text: generateRandomText(),
    img: "https://i.ibb.co/fV1VqSHX/icon.png",
    number: getRandomINumber(),
  },
  {
    name: "TB Chess",
    text: generateRandomText(),
    img: "https://i.ibb.co/fV1VqSHX/icon.png",
    number: getRandomINumber(),
  },
];
// Function to pick a random item from the data array
const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Component for showing winning information
const WinningInformation = () => {
  const [currentEarnings, setCurrentEarnings] = useState(earnings);
  const [slides, setSlides] = useState(data.slice(0, 5));

  // Function to generate a random earning entry
  const generateRandomEarning = () => {
    const avatars = [Avatar1, Avatar2, Avatar3, Avatar4, Avatar5];
    const randomAmount = Math.floor(Math.random() * (100000 - 50000) + 50000);

    return {
      id: Math.random(),
      name: generateRandomText(),
      rank: `NO${Math.floor(Math.random() * 5) + 1}`,
      amount: randomAmount.toLocaleString(),
      highlight: Math.random() > 0.5,
      image: avatars[Math.floor(Math.random() * avatars.length)],
    };
  };
  useEffect(() => {
    const interval = setInterval(() => {
      const randomItem = getRandomItem(data);
      const newSlide = { ...randomItem, id: uuidv4() };

      // Add new slide and keep the last 5 slides
      setSlides((prevSlides) => {
        const updatedSlides = [newSlide, ...prevSlides];
        return updatedSlides.slice(0, 10); // Keep only the last 5 slides
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate a new random earning
      const newEarning = generateRandomEarning();

      // Update the earnings list, keeping only the last 5 entries
      setCurrentEarnings((prev) => {
        const updated = [newEarning, ...prev.slice(0, 4)];
        return updated;
      });
    }, 1000); // Update every 1 second

    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }, []);
  return (
    <>
      import {FaRegGrinWink} from "react-icons/fa";

      <h3 className="border-after flex mt-2 items-center text-whites font-semibold pb-3">
        <img
          src="https://i.ibb.co/fV1VqSHX/icon.png"
          alt="Winning Information"
          className="w-5 h-5 mr-2 object-contain"
        />
        Winning Information
      </h3>

      <div
        className="
    winning-item
    w-full
    p-4
    bg-white
    overflow-visible
    rounded-[14px]
    border border-[#EEEEEE]
    shadow-[0_4px_16px_rgba(0,0,0,0.08)]
  "
      >
        {/* Table Header */}
        <div
          className="
      flex
      justify-between
      items-center
      w-full
      px-3
      py-3
      bg-white
      border-b
      border-[#EEEEEE]
      rounded-t-[10px]
    "
        >
          <div className="w-1/3">
            <p className="text-sm text-[#111827]">
              Game
            </p>
          </div>

          <div className="w-1/3 text-center">
            <p className="text-sm text-[#111827]">
              User
            </p>
          </div>

          <div className="w-1/3 text-right">
            <p className="text-sm text-[#111827]">
              Winning amount
            </p>
          </div>
        </div>

        {/* Slider */}
        <div className="slider-container overflow-hidden rounded-b-[10px]">
          <div className="slider flex flex-col">

            {slides.map((slide) => (
              <div
                key={slide.id}
                className="
            slide
            flex
            justify-between
            items-center
            w-full
            p-2
            bg-white
            border-b
            border-[#EEEEEE]
          "
              >
                {/* Game */}
                <div className="flex items-center w-1/3">
                  <div>
                    <img
                      src={slide.img}
                      alt={slide.name}
                      className="rounded-md w-4 h-4 object-cover"
                    />
                  </div>

                  <div className="flex items-start">
                    <p className="uppercase text-[12px] text-gray-400 pl-2">
                      {slide.name}
                    </p>
                  </div>
                </div>

                {/* User */}
                <div className="flex items-center justify-center w-1/3">
                  <p className="uppercase text-[12px] text-gray-400">
                    {slide.text}
                  </p>
                </div>

                {/* Winning Amount */}
                <div className="flex items-center justify-end w-1/3">
                  <div className="ml-2">
                    <h4 className="text-red-500 text-[12px] text-right">
                      ₹{slide.number}
                    </h4>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
      <div className="w-full text-black">
        {/* <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center ">
              <FaChartBar className="text-[#4266f3] text-3xl" />
            </div>
            <h2 className="text-base font-medium text-black">
              Winning information
            </h2>
          </div>
        </div> */}
        <div className="divide-y">
          {/* {earnings.map((item) => (
            <div
              key={item.id}
              className="flex items-center p-4 gap-3 bg-[#fff]"
            >
              <div className="flex-shrink-0 w-[40px] h-[50px] object-cover overflow-hidden">
                <img
                  src="https://i.ibb.co/MxjNY9RP/vendorlogo-20240727121204p7ke.png"
                  alt="profile"
                  className="w-[40px] h-[50px] object-cover overflow-hidden "
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-col justify-center gap-2 text-[#768096]">
                  <span className=" text-sm">User</span>
                  <span
                    className={`text-sm `}
                  >
                    Winning amount
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-col justify-between text-end gap-2">
                  <span className=" text-sm text-[#020d37]">{item.name}</span>
                  <span
                    className={`text-[12px] ${
                      item.highlight ? "text-[#1ab266]" : "text-[#1ab266]"
                    }`}
                  >
                    {item.amount}
                  </span>
                </div>
              </div>
            </div>
          ))} */}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center mt-2 text-sm mb-2">
          <img
            src="https://i.ibb.co/9935rGx6/profit-56d94e8f.webp"
            alt=""
            className="w-5 h-5"
          />
          <h1 className="heading-h3 font-semibold ml-1 text-whites">
            Today's earning chart
          </h1>
        </div>

        <div className="rounded-[14px] px-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#EEEEEE] overflow-hidden mt-5">
          <div
            style={{ backgroundImage: `url(${NewEarningImg})` }}
            className="w-full mt-12 h-[10rem] bg-contain bg-center bg-no-repeat rounded-md"
          >
            <div className="flex items-center justify-around w-full">
              <div>
                <div className="relative -top-[1px]">
                  {/* <img
        src={Crown2}
        alt=""
        className="absolute w-12 left-[-20px] top-[-20px]"
      /> */}
                  <img
                    src={AvatarData[1]}
                    alt=""
                    loading="lazy"
                    className="w-14 rounded-full h-14"
                  />
                </div>

                <div className="left-6 absolute mt-[3.3rem]">
                  <p className="text-sm left-5 relative text-[#FF772A] font-bold">
                    Mem**SLH
                  </p>
                  <button className="text-[12px] mt-1 text-[#C75C36] text-center p-1 px-2 bg-[#FFFFFF4D]">
                    ₹220,499,518.82
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="relative -top-[33px]">
                  {/* <img
        src={Crown1}
        alt=""
        className="absolute w-12 left-[-20px] top-[-20px]"
      /> */}
                  <img
                    src={AvatarData[4]}
                    alt=""
                    loading="lazy"
                    className="w-14 rounded-full h-14"
                  />
                </div>

                <div className="left-[-25px] mt-[37px] absolute top-[63px]">
                  <p className="text-sm left-6 text-[#FF2D5F] font-bold relative">
                    Mem**FXI
                  </p>
                  <button className="text-xs mt-1 text-[#BC2958] p-1 px-2 bg-[#FFFFFF4D]">
                    ₹1,272,332,040.00
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="relative -top-[1px] left-2">
                  {/* <img
        src={Crown3}
        alt=""
        className="absolute w-12 left-[-20px] top-[-20px]"
      /> */}
                  <img
                    src={AvatarData[5]}
                    alt=""
                    loading="lazy"
                    className="w-14 rounded-full h-14"
                  />
                </div>

                <div className="left-[-10px] absolute mt-[3.5rem]">
                  <p className="text-sm left-4 text-[#FFC528] relative font-bold">
                    Mem**IAP
                  </p>
                  <button className="text-xs mt-1 text-[#BC8735] p-1 px-2 bg-[#FFFFFF4D]">
                    ₹97,990,200.00
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 rounded-2xl">
            {/* <div className="flex py-1 items-center justify-between my-2 rounded-md bg-light">
  <div className="flex items-center ps-1">
    <img
      src={AvatarData[6]}
      alt=""
      className="rounded-full w-[40px] h-[40px] mr-4"
    />
    <div>
      <p className="fs-sm text-whites">Mem***WJA</p>
      <div className="flex">
        <img
          src="https://i.ibb.co/9mX1g3GT/no1-5c6f8e80.webp"
          alt=""
          className="w-4 h-5"
        />
        <span className="text-[#ffcb7d] text-sm">NO1</span>
      </div>
    </div>
  </div>
  <div className="relative flex items-center">
    <button className="text-base mt-1 px-3 py-0.5 text-whites mr-2">
      ₹78,976,308.99
    </button>
  </div>
</div>

<div className="py-1 flex items-center justify-between my-2 rounded-md bg-light">
  <div className="flex items-center ps-1">
    <img
      src={AvatarData[7]}
      alt=""
      className="rounded-full w-[40px] h-[40px] mr-4"
    />
    <div>
      <p className="fs-sm text-whites">Mem***BRW</p>
      <div className="flex">
        <img
          src="https://i.ibb.co/q3Nxyx7k/no2-1683c744.webp"
          alt=""
          className="w-4 h-5"
        />
        <span className="text-gray-400 text-sm">NO2</span>
      </div>
    </div>
    </div>
     <div className="relative flex items-center">
    <button className="text-base mt-1 py-0.5 px-3 text-whites mr-2">
      ₹61,692,960.00
    </button>
    </div>
    </div>

    <div className="py-1 flex items-center justify-between my-2 rounded-md bg-light">
    <div className="flex items-center ps-1">
    <img
      src={AvatarData[2]}
      alt=""
      className="rounded-full w-[40px] h-[40px] mr-4"
    />
    <div>
      <p className="fs-sm text-whites">Mem***TT2</p>
      <div className="flex">
        <img
          src="https://i.ibb.co/9mX1g3GT/no1-5c6f8e80.webp"
          alt=""
          className="w-4 h-5"
        />
        <span className="text-[#ffcb7d] text-sm">NO3</span>
      </div>
    </div>
    </div>
    <div className="relative flex items-center">
    <button className="text-base mt-1 text-whites py-0.5 px-3 mr-2">
      ₹59,543,123.00
    </button>
    </div>
   </div> */}

            <div className="py-1 flex items-center justify-between my-1 rounded-md bg-white">
              <div className="flex items-center ps-1">
                <span className="text-black text-sm mr-4">4</span>

                <img
                  src={AvatarData[5]}
                  alt=""
                  className="rounded-full w-[40px] h-[40px] mr-4"
                />

                <div>
                  <p className="fs-sm text-whites">Mem***RGP</p>
                </div>
              </div>

              <div className="relative flex items-center">
                <button className="text-sm mt-1 text-red-400 py-0.5 px-3 mr-2">
                  ₹48,632,770.00
                </button>
              </div>
            </div>

            {/* <div className="bg-[#D8EBE4] w-full h-[.02667rem]" /> */}

            <div className="py-1 flex items-center justify-between my-1 rounded-md bg-white">
              <div className="flex items-center ps-1">
                <span className="text-black text-sm mr-4">5</span>

                <img
                  src={AvatarData[1]}
                  alt=""
                  className="rounded-full w-[40px] h-[40px] mr-4"
                />

                <div>
                  <p className="fs-sm text-whites">Mem***EHF</p>
                </div>
              </div>

              <div className="relative flex items-center">
                <button className="text-sm mt-1 text-red-400 py-0.5 px-3 mr-2">
                  ₹43,692,960.00
                </button>
              </div>
            </div>

            {/* <div className="bg-[#D8EBE4] w-full h-[.02667rem]" /> */}

            <div className="py-1 flex items-center justify-between my-1 rounded-md bg-white">
              <div className="flex items-center ps-1">
                <span className="text-black text-sm mr-4">6</span>

                <img
                  src={AvatarData[1]}
                  alt=""
                  className="rounded-full w-[40px] h-[40px] mr-4"
                />

                <div>
                  <p className="fs-sm text-whites">Mem***AXT</p>
                </div>
              </div>

              <div className="relative flex items-center">
                <button className="text-sm mt-1 text-red-400 py-0.5 px-3 mr-2">
                  ₹43,692,960.00
                </button>
              </div>
            </div>

            {/* <div className="bg-[#D8EBE4] w-full h-[.02667rem]" /> */}

            <div className="py-1 flex items-center justify-between my-1 rounded-md bg-white">
              <div className="flex items-center ps-1">
                <span className="text-black text-sm mr-4">7</span>

                <img
                  src={AvatarData[1]}
                  alt=""
                  className="rounded-full w-[40px] h-[40px] mr-4"
                />

                <div>
                  <p className="fs-sm text-whites">Mem***KOW</p>
                </div>
              </div>

              <div className="relative flex items-center">
                <button className="text-sm mt-1 text-red-400 py-0.5 px-3 mr-2">
                  ₹43,692,960.00
                </button>
              </div>
            </div>

            {/* <div className="bg-[#D8EBE4] w-full h-[.02667rem]" /> */}

            <div className="py-1 flex items-center justify-between my-1 rounded-md bg-white">
              <div className="flex items-center ps-1">
                <span className="text-black text-sm mr-4">8</span>

                <img
                  src={AvatarData[1]}
                  alt=""
                  className="rounded-full w-[40px] h-[40px] mr-4"
                />

                <div>
                  <p className="fs-sm text-whites">Mem***95C</p>
                </div>
              </div>

              <div className="relative flex items-center">
                <button className="text-sm mt-1 text-red-400 py-0.5 px-3 mr-2">
                  ₹43,692,960.00
                </button>
              </div>
            </div>

            {/* <div className="bg-[#D8EBE4] w-full h-[.02667rem]" /> */}

            <div className="py-1 flex items-center justify-between my-1 rounded-md bg-white">
              <div className="flex items-center ps-1">
                <span className="text-black text-sm mr-4">9</span>

                <img
                  src={AvatarData[1]}
                  alt=""
                  className="rounded-full w-[40px] h-[40px] mr-4"
                />

                <div>
                  <p className="fs-sm text-whites">Mem***VG3</p>
                </div>
              </div>

              <div className="relative flex items-center">
                <button className="text-sm mt-1 text-red-400 py-0.5 px-3 mr-2">
                  ₹43,692,960.00
                </button>
              </div>
            </div>

            {/* <div className="bg-[#D8EBE4] w-full h-[.02667rem]" /> */}

            <div className="py-1 flex items-center justify-between rounded-md bg-white">
              <div className="flex items-center ps-1">
                <span className="text-black text-sm mr-4">10</span>

                <img
                  src={AvatarData[1]}
                  alt=""
                  className="rounded-full w-[40px] h-[40px] mr-4"
                />

                <div>
                  <p className="fs-sm text-whites">Mem***XVT</p>
                </div>
              </div>

              <div className="relative flex items-center">
                <button className="text-sm mt-1 text-red-400 py-0.5 px-3 mr-2">
                  ₹43,692,960.00
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WinningInformation;
