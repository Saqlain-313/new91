import React, { useState, useCallback, useEffect } from "react";
import debounce from "lodash/debounce";
import { gameListByGameTypeAndProvider } from "../../../store/reducer/spribeGameReducer";

import { BiCategory } from "react-icons/bi";
import { useDispatch } from "react-redux";
import JilliPopup from "../../../components/JilliPopup";
import { Link } from "react-router-dom";

const FishingGame = () => {
  const dispatch = useDispatch();

  const [gameId, setGameId] = useState();
  const [gameList, setGameList] = useState([]);

  const [gameType, setGameType] = useState("Fish Game");

  const handleJilliOpen = (data) => {
    setGameId(data);
  };

  const fetchGameList = useCallback(
    debounce(() => {
      dispatch(
        gameListByGameTypeAndProvider({
          provider: "jili",
          game_type: gameType,
          page: 1,
          size: 20,
        })
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
          <img src="https://i.ibb.co/PvY2kvr4/fish-57b49990.webp" alt="" className="w-6 h-6 mt-1"/>
          <h1 className="border-after mt-2 text-whites text-lg pl-1">
            Fishing
          </h1>
          <Link to={"/home/AllOnlineGames?game=Fishing"}>
            <button className="gray-text text-sm bg-light rounded items-center px-3 py-0.5 ml-2 mt-2">
              All 11
            </button>
          </Link>
        </div>
      </div>

      {/* Description */}
      {/* <p className="   text-whites text-[10px] mt-1">
          Classic arcade gameplay, super cool visual enjoyment
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
             to={"/home/AllOnlineGames?game=Fishing"}
              className="rounded-lg more-game overflow-hidden flex flex-col justify-between items-center h-[160px]"
            >
              <div className="flex flex-col items-center justify-center py-6">
                <BiCategory className="size-6 text-whites" />
                <p className="text-xs font-medium text-whites mt-2">
                  Detail
                </p>
              </div>
              <div className="more-l2 w-full text-center p-3">
                    <p>Fishing</p>
              </div>
            </Link> */}
        </div>
      </div>
    </>
  );
};

export default FishingGame;
