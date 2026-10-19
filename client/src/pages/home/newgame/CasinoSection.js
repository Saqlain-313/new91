import React, { useState, useRef, useCallback, useEffect } from "react";

// White icon imports
import whiteIcon1 from "../../../assets/NewImg/slotsicons/white/evo video icon.png";
import whiteIcon2 from "../../../assets/NewImg/slotsicons/white/DG ICON WHITE.png";
import whiteIcon3 from "../../../assets/NewImg/slotsicons/white/sexy video WHITE.png";

// Black icon imports
import blackIcon1 from "../../../assets/NewImg/slotsicons/black/evo video grey icon.png";
import blackIcon2 from "../../../assets/NewImg/slotsicons/black/DG ICON.png";
import blackIcon3 from "../../../assets/NewImg/slotsicons/black/sexy video.png";
import { BiCategory } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import debounce from "lodash/debounce";
import { gameListByGameTypeAndProvider } from "../../../store/reducer/spribeGameReducer";
import JilliPopup from "../../../components/JilliPopup";
import CustomeNavbar from "../../../components/CustomeNavbar";

const slotCategories = [
  {
    name: "EVO_Video",
    whiteIcon: whiteIcon1,
    blackIcon: blackIcon1,
    id: "jili",
    index: 2,
    game: "CasinoLive",
  },
  {
    name: "DG",
    whiteIcon: whiteIcon2,
    blackIcon: blackIcon2,
    id: "cq9",
    game: "CasinoLive & Slot",
    index: 3,
  },
  {
    name: "SEXY_Video",
    whiteIcon: whiteIcon3,
    blackIcon: blackIcon3,
    id: "jdb",
    game: "Live Casino",
    index: 4,
  },
  // { name: "MG_Video", whiteIcon: whiteIcon4, blackIcon: blackIcon4, id: "mg" },
];

const CasinoSection = () => {
  const [activeCategory, setActiveCategory] = useState("jili");

  const categoryRef = useRef();

  const dispatch = useDispatch();

  const [gameId, setGameId] = useState();
  const [gameList, setGameList] = useState([]);
  const [page, setPage] = useState(2);

  const [gameType, setGameType] = useState("CasinoLive");

  const handleJilliOpen = (data) => {
    setGameId(data);
  };

  const handleCategoryClick = (category, game, index) => {
    setActiveCategory(category);

    setPage(index);
  };

  const fetchGameList = useCallback(
    debounce(() => {
      dispatch(
        gameListByGameTypeAndProvider({
          provider: "evolutionlive",
          game_type: gameType,
          page: page,
          size: 8,
        })
      ).then((res) => {
        if (res?.payload?.data?.data) {
          setGameList(res.payload.data.data);
        }
      });
    }, 300),
    [dispatch, gameType, page]
  );

  useEffect(() => {
    fetchGameList();
    return () => fetchGameList.cancel();
  }, [fetchGameList]);

  return (
    <>
      <CustomeNavbar logo="logo" bgClass="nav-bg" />
      <div className="overflow-hidden container-section">
        {gameId && <JilliPopup gameId={gameId} />}

        <div className="mb-2">
          <h1 className="border-after mt-2 text-whites font-[500] text-base">
            Casino Live
          </h1>
          <p className="text-whites text-xs mt-1">
            Online real-time game dealers, all verified fair games
          </p>
        </div>

        <div className="slider-container relative ">
          <div
            ref={categoryRef}
            className="flex overflow-x-auto scrollbar-hidden"
          >
            {slotCategories.map((category, index) => (
              <button
                key={index}
                data-id={category.id}
                onClick={() =>
                  handleCategoryClick(
                    category.id,
                    category.game,
                    category.index
                  )
                }
                className={`flex flex-col items-center whitespace-nowrap px-3 py-1 flex-1 rounded ${
                  activeCategory === category.id
                    ? "blue-linear2  text-white shadow-lg"
                    : "bg-[#fff] text-[#606877] border-gray-300"
                }`}
              >
                <img
                  src={
                    activeCategory === category.id
                      ? category.whiteIcon
                      : category.blackIcon
                  }
                  alt={`${category.name} icon`}
                  className="w-16 h-10 p-2 object-fill "
                />
                <span
                  className={` text-sm   ${
                    activeCategory === category.id
                      ? "text-black"
                      : "text-gray-700"
                  }`}
                >
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="games-grid mt-3 grid grid-cols-3 gap-2 px-1">
          {gameList &&
            gameList?.map((game, index) => (
              <div
                key={index}
                className=" rounded-lg shadow-sm hover:shadow-md  h-[140px] transition-shadow "
              >
                <img
                  data-origin={game.icon}
                  src={game.icon}
                  alt={`Game ${game.game_name}`}
                  className="w-full h-full rounded-md mb-2 object-fill"
                  onClick={() => handleJilliOpen(game.game_uid)}
                />
              </div>
            ))}
          {/* Custom card at index six */}
          <Link
            to={"/home/AllOnlineGames?game=Casino"}
            className="rounded-lg more-game overflow-hidden flex flex-col justify-between items-center h-[140px]"
          >
            <div className="flex flex-col items-center justify-center py-6">
              <BiCategory className="size-6 text-whites" />
              <p className="text-xs font-medium text-whites mt-2">Detail</p>
            </div>
            <div className="more-l2 w-full text-center p-3">
              <p>Casino</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default CasinoSection;
