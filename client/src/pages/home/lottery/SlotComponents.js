import { useEffect, useRef, useState } from "react";

// Black Icons
import blackIcon2 from "../../../assets/NewImg/slotsicons/black/CQ9.png";
import blackIcon5 from "../../../assets/NewImg/slotsicons/black/evo_electronic icon.png";
import blackIcon3 from "../../../assets/NewImg/slotsicons/black/JDB ICON.png";
import blackIcon1 from "../../../assets/NewImg/slotsicons/black/JILI ICON.png";

// White Icons
import whiteIcon2 from "../../../assets/NewImg/slotsicons/white/CQ9 WHITE.png";
import whiteIcon5 from "../../../assets/NewImg/slotsicons/white/EVO ELECTRONIC WHITE ICON.png";
import whiteIcon3 from "../../../assets/NewImg/slotsicons/white/JDB ICON WHITE.png";
import whiteIcon1 from "../../../assets/NewImg/slotsicons/white/JILI ICON WHITE.png";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import JilliPopup from "../../../components/JilliPopup";
import { notification } from "../../../store/reducer/activityReducer";

import CasinoSlider from "../CasinoSlider";
import Fishgameslider from "../Fishgameslider";
import MiniGames from "../MiniGames";
import CasinoLiveGame from "../newgame/CasinoLiveGame";
import CasinoSection from "../newgame/CasinoSection";
import Cq9Game from "../newgame/Cq9Game";
import EVOGame from "../newgame/EVOGame";
import FishingGame from "../newgame/FishingGame";
import JDBGame from "../newgame/JDBGame";
import JilliGame from "../newgame/JilliGame";
import LotterSection from "../newgame/LotterSection";
import MiniGamesPage from "../newgame/MiniGamesPage";
import OriginalGame from "../newgame/OriginalGame";
import SuperJackportGame from "../newgame/SuperJackportGame";
import SlotSlider from "../SlotSlider";
import PVCSection from "./PVCSection";
import SportsComponent from "./SportsComponent";

const lottery = "https://i.ibb.co/mCS1hw9t/L-d9b599f044f44fc10475.png";

const slotCategories = [
  {
    name: "Lottery",
    blackIcon: lottery,
    whiteIcon: lottery,
    id: "lottery",
  },
  {
    name: "Mini Game",
    blackIcon: "https://i.ibb.co/wFZqXRnG/MINI-GAME.png",
    whiteIcon: "https://i.ibb.co/wFZqXRnG/MINI-GAME.png",
    id: "orignal",
  },
  {
    name: "Super Jackpot",
    blackIcon: "https://i.ibb.co/35SV9gdz/SUPER-JACKPOT.png",
    whiteIcon: "https://i.ibb.co/35SV9gdz/SUPER-JACKPOT.png",
    id: "jackpot",
  },
  {
    name: "Slots",
    blackIcon:
      "https://i.ibb.co/7Nn3hdyq/Chat-GPT-Image-Aug-14-2026-03-05-38-PM.png",
    whiteIcon:
      "https://i.ibb.co/7Nn3hdyq/Chat-GPT-Image-Aug-14-2026-03-05-38-PM.png",
    id: "slot",
  },
  {
    name: "Fishing",
    blackIcon: "https://i.ibb.co/JRnd4dfz/f.png",
    whiteIcon: "https://i.ibb.co/JRnd4dfz/f.png",
    id: "fishing",
  },
  {
    name: "Casino",
    blackIcon:
      "https://i.ibb.co/rR8JY3Ys/Chat-GPT-Image-Aug-14-2026-03-17-05-PM.png",
    whiteIcon:
      "https://i.ibb.co/rR8JY3Ys/Chat-GPT-Image-Aug-14-2026-03-17-05-PM.png",
    id: "casino",
  },
  {
    name: "Sports",
    blackIcon: "https://i.ibb.co/C34fRZTP/sports.png",
    whiteIcon: "https://i.ibb.co/C34fRZTP/sports.png",
    id: "sports",
  },
];

const slotCategories2 = [
  {
    name: "JILI",
    blackIcon: blackIcon1,
    whiteIcon: whiteIcon1,
    id: "jili",
  },
  {
    name: "CQ9",
    blackIcon: blackIcon2,
    whiteIcon: whiteIcon2,
    id: "cq9",
  },
  {
    name: "JDB",
    blackIcon: blackIcon3,
    whiteIcon: whiteIcon3,
    id: "jdb",
  },
  {
    name: "EVO_Electronic",
    blackIcon: blackIcon5,
    whiteIcon: whiteIcon5,
    id: "evo_ele",
  },
];

const games = [
  {
    apiKey: "2126c5c458316ba1f2df65b387b60408",
    label: "Game 1",
    image: "https://i.ibb.co/JwrChFMD/chicken-road1.png",
  },
  {
    apiKey: "562b299961b0ec40f252a832453c67b0",
    label: "Game 2",
    image: "https://i.ibb.co/PzgMm55t/chicken-road2.png",
  },
];

const SlotComponents = () => {
  const [gameId, setGameId] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("Lottery");
  const [activeSlotCategory, setActiveSlotCategory] = useState("jili");
  const [alertsuccess, setAlertsuccess] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);
  const [soon, setSoon] = useState(false);

  const containerRef = useRef(null);
  const itemRefs = useRef({});
  const categoryRef = useRef(null);
  const contentRef = useRef(null);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setShowAllSections(category === "lobby");

    // Center the selected category in the horizontal scroll container.
    const container = containerRef.current;
    const item = itemRefs.current[category];

    if (container && item) {
      const containerWidth = container.offsetWidth;
      const itemWidth = item.offsetWidth;
      const itemOffsetLeft = item.offsetLeft;

      const targetScroll = itemOffsetLeft - containerWidth / 2 + itemWidth / 2;

      const maxScroll = container.scrollWidth - containerWidth;
      const boundedScroll = Math.max(0, Math.min(maxScroll, targetScroll));

      container.scrollTo({
        left: boundedScroll,
        behavior: "smooth",
      });
    }

    if (item) {
      item.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }

    // Scroll to the selected game section.
    if (category !== "lobby") {
      const element = document.getElementById(category);

      if (element) {
        const yOffset = -130;
        const y =
          element.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
          top: y,
          behavior: "smooth",
        });
      }
    }
  };

  // Direct navigation: no recharge popup and no login redirect.
  const handleCheck = (path) => {
    if (path === "bike") {
      setSoon(true);
      return;
    }

    navigate(path);
  };

  const handleSlotCategoryClick = (category) => {
    setActiveSlotCategory(category);
  };

  useEffect(() => {
    dispatch(notification());
  }, [dispatch]);

  useEffect(() => {
    handleCategoryClick("lottery");
  }, []);

  const handleJilliOpen = (apiKey) => {
    setGameId(apiKey);
    console.log("Game ID Set:", apiKey);
  };

  return (
    <div className="container-section mt-5 relative">
      {/* Existing game popup retained */}
      {gameId && <JilliPopup gameId={gameId} />}

      {/* Existing success message retained */}
      <div className="bg-white">
        <div className={`place-bet-popup z-40 ${alertsuccess ? "active" : ""}`}>
          <div className="text-lg">
            {"Need first recharge to Play the Game"}
          </div>
        </div>
      </div>

      {/* Main game categories */}
      <div className="bgs-body overflow-x-auto scrollbar-hide overflow-y-hidden z-[2] sticky top-11 pt-4 pb-1 mr-[-3px]">
        <div className="flex border-none" ref={containerRef}>
          {slotCategories.map((category) => (
            <div
              key={category.id}
              ref={(el) => {
                itemRefs.current[category.id] = el;
              }}
              onClick={() => handleCategoryClick(category.id)}
              className={`whitespace-nowrap w-full flex-col px-1 rounded text-sm flex items-center gap-1 ${
                activeCategory === category.id
                  ? "opacity-100 text-[#00BFB1]"
                  : "opacity-100 text-gray-500"
              }`}
            >
              <div className="w-20 h-[70px] relative flex justify-center items-center">
                <img
                  src={
                    activeCategory === category.id
                      ? "https://i.ibb.co/99vqgvb1/bga.png"
                      : "https://i.ibb.co/BKStfhn6/bgd.png"
                  }
                  alt="background"
                  className="absolute top-0 left-0 w-full h-full object-contain"
                />

                <img
                  src={
                    activeCategory === category.id
                      ? category.whiteIcon
                      : category.blackIcon
                  }
                  alt={category.name}
                  className="w-16 h-16 -top-3 object-contain relative z-10"
                />
              </div>

              <span className="text-[12px] text-center font-bold">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        {/* Lobby: show all game sections */}
        {showAllSections && (
          <div id="lottery" className="lottery-game-section mt-5">
            <LotterSection />
            <MiniGamesPage />
            <SlotSlider />
            <PVCSection />
            <Fishgameslider />
            <CasinoSlider />
            <SportsComponent />
            <SuperJackportGame />
          </div>
        )}

        {/* Selected category */}
        {!showAllSections && (
          <>
            {activeCategory === "lottery" && (
              <div className="lottery-game-section mt-5">
                <LotterSection />

                {/* <div className="flex items-center w-full mt-5">
                  <div
                    className="w-1/2 flex flex-col items-center cursor-pointer"
                    onClick={() => handleCheck(games[0].apiKey)}
                  >
                    <img
                      src={games[0].image}
                      alt="Chicken Road 1"
                      className="w-full h-auto rounded object-contain"
                    />
                  </div>

                  <div
                    className="w-1/2 flex flex-col items-center pl-2 cursor-pointer"
                    onClick={() => handleCheck(games[1].apiKey)}
                  >
                    <img
                      src={games[1].image}
                      alt="Chicken Road 2"
                      className="w-full h-auto rounded object-contain"
                    />
                  </div>
                </div> */}
              </div>
            )}

            {activeCategory === "minigame" && (
              <div className="lottery-game-section">
                <MiniGames />
              </div>
            )}

            {activeCategory === "slot" && (
              <>
                <div className="mb-4">
                  <p className="mt-2 flex items-center gap-2 text-base font-semibold">
                    <span>
                      <img
                        src="https://i.ibb.co/7Nn3hdyq/Chat-GPT-Image-Aug-14-2026-03-05-38-PM.png"
                        className="size-8"
                        alt="Slots icon"
                      />
                    </span>
                    Slots
                  </p>

                  <p className="text-whites text-[11px] mt-1">
                    Online real-time game dealers, all verified fair games
                  </p>
                </div>

                <div className="relative overflow-x-auto scrollbar-hide rounded nav-bg">
                  <div ref={categoryRef} className="flex border-none">
                    {slotCategories2.map((category) => (
                      <div
                        key={category.id}
                        data-id={category.id}
                        onClick={() => handleSlotCategoryClick(category.id)}
                        className={`flex flex-col items-center whitespace-nowrap py-2 px-1 rounded ${
                          activeSlotCategory === category.id
                            ? "blue-linear2 text-white shadow-lg"
                            : "nav-bg text-gray-600 border-gray-300"
                        }`}
                      >
                        <div className="w-20 flex flex-col justify-center items-center">
                          <img
                            src={
                              activeSlotCategory === category.id
                                ? category.whiteIcon
                                : category.blackIcon
                            }
                            alt={category.name}
                            className="h-[15px] w-auto object-contain"
                          />
                        </div>

                        <span>{category.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden">
                  <div ref={contentRef} className="transition-all duration-300">
                    {activeSlotCategory === "jili" && <JilliGame />}
                    {activeSlotCategory === "cq9" && <Cq9Game />}
                    {activeSlotCategory === "jdb" && <JDBGame />}
                    {activeSlotCategory === "evo_ele" && <EVOGame />}
                  </div>
                </div>
              </>
            )}

            {activeCategory === "orignal" && (
              <div className="lottery-game-section">
                <OriginalGame />
              </div>
            )}

            {activeCategory === "fishing" && (
              <div className="lottery-game-section">
                <FishingGame />
              </div>
            )}

            {activeCategory === "casino" && (
              <div className="mt-2">
                <CasinoLiveGame />
                <CasinoSection />
              </div>
            )}

            {activeCategory === "sports" && (
              <div className="mt-2">
                <SportsComponent />
              </div>
            )}

            {activeCategory === "pvc" && (
              <div className="mt-2">
                <PVCSection />
              </div>
            )}

            {activeCategory === "jackpot" && (
              <div className="mt-2">
                <SuperJackportGame />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SlotComponents;
