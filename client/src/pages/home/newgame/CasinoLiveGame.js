import React, { useState } from "react";
import { BiCategory } from "react-icons/bi";
import JilliPopup from "../../../components/JilliPopup";
import { Link } from "react-router-dom";

const casinoData = [
  {
    img: "https://i.ibb.co/F4Z6Qk2j/1-5.png",
    id: "8405541014f364b7dc59657aa6892446",
  },
  {
    img: "https://i.ibb.co/TBk1C3Q6/1-1.png",
    id: "724eebd5cbe7555b01ed60279cb59e5a",
  },
  {
    img: "https://i.ibb.co/PzGxnm4m/1-4.png",
    id: "9b25f8d744859c6840d16ff6103dc5a6",
  },
  {
    img: "https://i.ibb.co/5gzLTQGy/1-14.png",
    id: "8ef39602e589bf9f32fc351b1cbb338b",
  },
  {
    img: "https://i.ibb.co/JR5M5gng/1-16.png",
    id: "1fd20a344c9f147cdef85bbaa7447dcd",
  },
  {
    img: "https://i.ibb.co/yc5SQkDw/1-41.png",
  },
];

const CasinoLiveGame = () => {
  const [gameId, setGameId] = useState();

  const handleJilliOpen = (data) => {
    setGameId(data);
  };

  return (
    <>
      {gameId && <JilliPopup gameId={gameId} />}

      <div className="lottery-game-section">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <h1 className="border-after mt-2 text-whites font-bold text-lg border-l-4 border-[#F5CC2C] pl-1">
            Casino
          </h1>
        </div>
        {/* <p className="text-whites text-[10px] mt-1">
          The games are independently developed by our team, fun, fair, and
          safe.
        </p> */}

        {/* Game Grid */}
        <div className="slider-container mt-3">
          <div className="grid grid-cols-3 gap-1">
            {casinoData.map((game, index) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden relative cursor-pointer p-1"
                onClick={() => handleJilliOpen(game.id)}
              >
                {/* Image */}
                <img
                  src={game.img}
                  alt={game.name}
                  className="right-0 bottom-0 object-fill z-0"
                />
              </div>
            ))}
          </div>
        </div>
        <Link to={"/casinoSection"} className="flex justify-center mt-3">
          <button className="nav-bg px-10 py-1 rounded-full">All Games</button>
        </Link>
      </div>
    </>
  );
};

export default CasinoLiveGame;
