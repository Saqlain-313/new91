import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Image Imports

// arrow img

import { BiCategory } from "react-icons/bi";
import JilliPopup from "../../../components/JilliPopup";
const WingoImg = "https://i.ibb.co/GvvYf3JL/pvc1.png";
const K3Img = "https://i.ibb.co/wF6rT0yw/pvc2.png";
const pvc3 = "https://i.ibb.co/352KZsZT/pvc3.png";
const Arrowleft = "https://i.ibb.co/JjPV1sK6/button-2.png";
const Arrowright = "https://i.ibb.co/93vC5KsZ/button-1.png";
const PVCSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0); // Track the current slide
  const navigate = useNavigate();
  const [gameId, setGameId] = useState();

  const handleJilliOpen = (data) => {
    setGameId(data);
  };

  const slides = [
    [
      { id: "365", img: WingoImg, route: "#" },
      { id: "v8 POKER", img: K3Img, route: "#" },
      { id: "5d", img: pvc3, route: "#" },
    ],
    // [
    //   { id: "trx", img: "", route: "/trx" },
    //   { id: "original", img: "", route: "#" }, // Placeholder
    // ],
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div>
      {gameId && <JilliPopup gameId={gameId} />}
      <div className=" mt-5 overflow-hidden relative">
        <div className="lottery-game-section">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <img
                  src="https://i.ibb.co/1t1ZmBzb/chess-11735038.webp"
                  alt=""
                  className="w-5 h-5 mr-1"
                />
                <h1 className="border-after text-whites font-[400] text-base">
                  PVC
                </h1>
                <Link to={"/home/AllOnlineGames?game=PVC"}>
                  <button className="gray-text text-sm bg-light rounded items-center px-3 py-0.5">
                    All 3
                  </button>
                </Link>
              </div>
              <p className="text-whites text-[10px] mt-1">
                Exquisite scenes and delicate graphics, play online with friends
              </p>
            </div>

            {/* Slider Controls */}
            {/* <div className="absolute top-0 right-0 mt-1 flex gap-1">
              <button onClick={prevSlide} className="p-0  ">
                <img
                  src={Arrowleft}
                  alt="❮"
                  className="w-auto h-4" // Adjusting the size of the left arrow
                />
              </button>
              <button onClick={nextSlide} className="p-0  ">
                <img
                  src={Arrowright}
                  alt="❯"
                  className="w-auto h-4" // Adjusting the size of the right arrow
                />
              </button>
            </div> */}
          </div>

          {/* Manual Slider Section */}
          <div className="slider-container mt-0 overflow-hidden">
            {/* Slides */}
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 min-w-full">
                  {slide.map((item, index) => (
                    <div
                      key={index}
                      className="col-span-4"
                      onClick={() => navigate(item.route || "#")}
                    >
                      {item.img ? (
                        <img
                          src={item.img}
                          alt={`${item.id} Game`}
                          loading="lazy"
                          className="w-full h-[18vh] object-cover rounded-md"
                          onClick={() => {
                            index === 0 && handleJilliOpen(229);
                            index === 1 && handleJilliOpen(51);
                          }}
                        />
                      ) : (
                        <div className="w-full h-[150px] bg-gray-300 rounded-md flex items-center justify-center">
                          No Image
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Custom card at index six */}
                  {/* <Link
                    className="rounded-lg more-game col-span-4 overflow-hidden flex flex-col justify-between items-center h-[160px]"
                    to={"/home/AllOnlineGames?game=PVC"}
                  >
                    <div className="flex flex-col items-center justify-center py-6">
                      <BiCategory className="size-6 text-whites" />
                      <p className="text-xs font-medium text-whites mt-2">
                        Detail
                      </p>
                    </div>
                    <div className="more-l2 w-full text-center p-3">
                      <p>PVC</p>
                    </div>
                  </Link> */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PVCSection;
