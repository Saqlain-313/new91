import React, { useState } from "react";
import JilliPopup from "../../../components/JilliPopup";
import { Link } from "react-router-dom";

const SportsComponent = () => {
  const [gameId, setGameId] = useState();

  const handleJilliOpen = (data) => {
    setGameId(data);
  };

  // sportsData tumhare API se aa raha hai ya props se, yaha sirf design change kiya gaya hai:
  const sportsData = [
    // Dummy data for example. Tum API response ya props use karna.
    {
      id: 1,
      name: "Baseball",
      image: "https://i.ibb.co/8gPLBczQ/vendorlogo-20240611171549i8md.png",
      iconId: "icon-Wickets9",
    },
    {
      id: 2,
      name: "Basketball",
      image: "https://i.ibb.co/fYm4nYtM/vendorlogo-20240611171621j6wf.png",
      iconId: "icon-SaBa",
    },
    {
      id: 2,
      name: "Basketball",
      image: "https://i.ibb.co/6RH8B9Sp/vendorlogo-20240611171602f8k1.png",
      iconId: "icon-SaBa",
    },
  ];

  return (
    <div className="container mx-auto py-3">
      {gameId && <JilliPopup gameId={gameId} />}

      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="flex items-center gap-1">
            <img
              src="https://i.ibb.co/Tq0H883F/sport-f0fdc902.webp"
              alt=""
              className="w-5 h-5"
            />
            <h2 className="border-after pl-1 mt-1 text-blue font-bold text-lg">
              Sports
            </h2>
            <Link to={"/home/AllOnlineGames?game=Sports"}>
              <button className="text-sm bg-light rounded p-1 gray-text mt-2">
                More 3
              </button>
            </Link>
          </div>
          {/* <p className="text-white text-xs mt-1">
            Latest sports events, rich gameplay
          </p> */}
        </div>
      </div>

      <div className="mt-3">
        <div className="grid grid-cols-3 gap-2">
          {sportsData?.map((sport, index) => (
            <div
              key={index}
              className="cursor-pointer rounded-md overflow-hidden"
              onClick={() => {
                index === 0 && handleJilliOpen(229);
                index === 1 && handleJilliOpen(51);
                index === 2 && handleJilliOpen(109);
              }}
            >
              <img
                src={sport.image}
                alt={sport.name}
                className="w-full h-[18vh] object-cover rounded-md"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SportsComponent;
