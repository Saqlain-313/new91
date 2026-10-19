import React, { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { gameListByProvider } from "../../../store/reducer/spribeGameReducer";

import { BiCategory } from "react-icons/bi";
import { useDispatch } from "react-redux";
import JilliPopup from "../../../components/JilliPopup";
import { Link } from "react-router-dom";

const OriginalGame = () => {
  const dispatch = useDispatch();

  const [gameId, setGameId] = useState();
  const [gameList, setGameList] = useState([]);

  const [gameType, setGameType] = useState("CasinoTable");

  const handleJilliOpen = (data) => {
    setGameId(data);
  };

  const fetchGameList = useCallback(
    debounce(() => {
      dispatch(
        gameListByProvider({ provider: "spribe", page: 1, size: 20 })
      ).then((res) => {
        if (res?.payload?.data?.data) {
          setGameList(res.payload.data.data);
        }
      });
    }, 300),
    [dispatch, gameType]
  );

  useEffect(() => {
    fetchGameList();
    return () => fetchGameList.cancel();
  }, [fetchGameList]);

  return (
    <>
      {gameId && <JilliPopup gameId={gameId} />}

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="border-after mt-2 text-whites text-lg border-l-4 border-[#F5CC2C] pl-1">
            Original
          </h1>
        </div>
      </div>

      {/* Description */}
      {/* <p className="   text-whites text-[10px] mt-1">
        The games are independently developed by our team, fun, fair, and safe.
      </p> */}

      {/* Game Grid */}
      <div className="slider-container mt-4">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
          {gameList &&
            gameList?.map((game, index) => (
              <div
                key={index}
                className="rounded-lg bg-gray-100  overflow-hidden"
              >
                <img
                  data-origin={game.icon}
                  src={game.icon}
                  alt={game.game_name}
                  loading="lazy"
                  className="w-full h-[18vh] object-fill"
                  onClick={() => handleJilliOpen(game.game_uid)}
                />
              </div>
            ))}
          {/* Custom card at index six */}
          {/* <Link
            to={"/home/AllOnlineGames?game=Mini games"}
            className="rounded-lg more-game overflow-hidden flex flex-col justify-between items-center h-[150px]"
          >
            <div className="flex flex-col items-center justify-center py-6">
              <BiCategory className="size-6 text-whites" />
              <p className="text-xs font-medium text-whites mt-2">Detail</p>
            </div>
            <div className="more-l2 w-full text-center p-3">
              <p>Orignal</p>
            </div>
          </Link> */}
        </div>
         <Link to={"/home/AllOnlineGames"} className="flex justify-center mt-3">
          <button className="nav-bg px-10 py-1 rounded-full">All Games</button>
        </Link>
      </div>
    </>
  );
};

export default OriginalGame;
