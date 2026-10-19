import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useDispatch } from "react-redux";
import { gameListByGameTypeAndProvider } from "../../store/reducer/spribeGameReducer";
import JilliPopup from "../../components/JilliPopup";
import RechargePopup from "../../components/RechargePopup";
import { rechargeList2 } from "../../store/reducer/userReducer";
import CustomeNavbar from "../../components/CustomeNavbar";

const Container = styled.div`
  width: 100%;
  overflow: hidden;
  overflow: scroll;
  margin: 0 auto;
  position: relative;
  height: 64px;
`;

const Picker = styled.div`
  display: flex;
  align-items: center;
  transform: translateX(${(props) => props.translateX}px);
  transition: transform 0.3s ease-out;
  z-index: 2;
  position: absolute;
  overflow: hidden;
`;

const Item = styled.div`
  height: 52.67px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: ${(props) => (props.active ? "#fff" : "gray")};
  transition: color 0.3s;
  cursor: pointer;
  font-weight: 700;
  width: 100px; /* Assuming each item has a width of 100px */
  margin: 10px 5px;
  background: ${(props) =>
    props.active ? "linear-gradient(90deg, #F5CC2C 0%, #F2CA33 100%)" : "#fff"};
  padding: 11px 12px;
`;

const Span = styled.span`
  font-size: 24px;
  color: white;
`;

const cosinoData = [
  {
    img: "https://i.ibb.co/RkNF2SJZ/casino1.png",
    id: "8ef39602e589bf9f32fc351b1cbb338b",
  },
  {
    img: "https://i.ibb.co/Txs7HFv3/casino2.png",
    id: "8ef39602e589bf9f32fc351b1cbb338b",
  },
  {
    img: "https://i.ibb.co/KjwjzGzk/casino3.png",
    id: "5cb6aa4e2ce1c775c568561401ffdfca",
  },
  {
    img: "https://i.ibb.co/dsd9Kxmv/casino4.png",
    id: "b4af506243cafae52908e8fa266f8ff6",
  },
  {
    img: "https://i.ibb.co/LwnrsZb/casino5.png",
    id: "e3951a5bf624e822a22cba1cbe619df5",
  },
];

const AllOnlineGames = () => {
  const [gameId, setGameId] = useState();

  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const name = queryParams.get("game");

  const [tab, setTabs] = useState("Slots");
  const [gameList, setGameList] = useState([]);
  const [gameType, setGameType] = useState("Slot Game");
  const [provider, setProvider] = useState("jili");
  const [repopup, setRepopup] = useState(false);

  const navigate = useNavigate();

  //   8273142996
  const items = [
    {
      name: "Lottery",
      icon: "https://i.ibb.co/5XJY3nYJ/lottery.png",
      id: "Lottery",
      type: "",
    },
    {
      name: "Slots",
      icon: "https://i.ibb.co/jkb6GJ9x/slots.png",
      id: "Slot Game",
      type: "jili",
    },
    {
      name: "Mini games",
      icon: "https://i.ibb.co/hRFMfxLP/mini.png",
      id: "CasinoTable",
      type: "spribe",
    },
    {
      name: "Fishing",
      icon: "https://i.ibb.co/SXj088tV/fishing.png",
      id: "Fish Game",
      type: "jili",
    },
    {
      name: "Casino",
      icon: "https://i.ibb.co/93SfgzHq/casino.png",
      id: "CasinoLive",
      type: "evolutionlive",
    },
    {
      name: "PVC",
      icon: "https://i.ibb.co/HTcWYBdc/pvc.png",
      id: "Ca",
      type: "ev",
    },
    {
      name: "Sports",
      icon: "https://i.ibb.co/d0bYjD6C/sport.png",
      id: "Ca",
      type: "ev",
    },
  ];

  useEffect(() => {
    dispatch(
      gameListByGameTypeAndProvider({
        provider: provider,
        game_type: gameType,
        page: 1,
        size: 20,
      })
    ).then((res) => {
      if (res?.payload?.data?.data) {
        setGameList(res.payload.data.data);
      }
    });
  }, [dispatch, gameType]);

  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  const handleClick = (index) => {
    setTabs(items[index].name);
    setGameType(items[index].id);
    setProvider(items[index].type);

    const container = containerRef.current;
    const item = itemRefs.current[index];

    if (container && item) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      const scrollLeft =
        item.offsetLeft - container.offsetWidth / 2 + item.offsetWidth / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (name) {
      setTabs(name);
      const index = items.find((item) => item.name === name);

      setGameType(index.id);
      setProvider(index.type);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  const handleJilliOpen = (data) => {
    setGameId(data);
  };

  const handleWingo = (path) => {
    dispatch(rechargeList2()).then((res) => {
      if (res.payload.data2?.length === 0) {
        setRepopup(true);
      } else {
        navigate(path);
      }
    });
  };
  return (
    <>
      <RechargePopup repopup={repopup} setRepopup={setRepopup} />
      {gameId && <JilliPopup gameId={gameId} />}

      <CustomeNavbar name="Game" />

      <Container ref={containerRef} className="scroll-none">
        <Picker>
          {items.map((item, index) => (
            <Item
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              active={item.name === tab}
              onClick={() => handleClick(index)}
              className="rounded-md"
            >
              <Span>
                <img src={item.icon} alt={item.name} className="w-7" />
              </Span>
              <p className="flex fs-sm">{item.name}</p>
            </Item>
          ))}
        </Picker>
      </Container>

      {tab === "Lottery" && (
        <div className="container-section mt-5">
          <div className="flex flex-col gap-2 ">
            {gameData.map((game) => (
              <div
                key={game.id}
                onClick={() => handleWingo(game.link)}
                className="lotterySlotItem  blue-linear rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="px-4 py-2 flex flex-row items-start justify-between">
                  <div className="flex flex-col items-start">
                    <span className="block text-white font-bold text-lg mt-1">
                      {game.name}
                    </span>
                    <h4 className="mt-1">
                      <div className="text-gray-100 text-xs font-semibold">
                        {game.description1}
                      </div>
                      <div className="text-gray-100 text-xs font-semibold">
                        {game.description2}
                      </div>
                    </h4>
                  </div>
                  <img
                    src={game.image}
                    alt={game.name}
                    className={`w-[90px] rounded ${
                      game.id >= 1 && game.id <= 5 ? "h-[80px]" : ""
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container-section">
        {/* jilli game */}
        {tab === "Slots" && (
          <div className="grid grid-cols-12 gap-3 mt-3">
            {gameList &&
              gameList?.map((item, index) => (
                <div className="col-span-4" key={index}>
                  <img
                    src={item.icon}
                    alt={`Image ${index + 1}`}
                    className="w-full h-[150px] cursor-pointer rounded-lg"
                    loading="lazy"
                    onClick={() => handleJilliOpen(item.game_uid)}
                  />
                </div>
              ))}
          </div>
        )}

        {/* Crash game */}
        {tab === "Mini games" && (
          <div className="grid grid-cols-12 gap-3 mt-3">
            {gameList &&
              gameList?.map((item, index) => (
                <div className="col-span-4" key={index}>
                  <img
                    src={item.icon}
                    alt={`Image ${index + 1}`}
                    className="w-full h-[150px] cursor-pointer rounded-lg"
                    loading="lazy"
                    onClick={() => handleJilliOpen(item.game_uid)}
                  />
                </div>
              ))}
          </div>
        )}

        {/* MG_Fish game */}
        {tab === "Fishing" && (
          <div className="grid grid-cols-12 gap-3 mt-3">
            {gameList &&
              gameList?.map((item, index) => (
                <div className="col-span-4" key={index}>
                  <img
                    src={item.icon}
                    alt={`Image ${index + 1}`}
                    className="w-full h-[150px] cursor-pointer rounded-lg"
                    loading="lazy"
                    onClick={() => handleJilliOpen(item.game_uid)}
                  />
                </div>
              ))}
          </div>
        )}
        {/* Rummy game */}
        {tab === "Casino" && (
          <div className="grid grid-cols-12 gap-3 mt-3">
            {cosinoData &&
              cosinoData?.map((item, index) => (
                <div className="col-span-6" key={index}>
                  <img
                    src={item.img}
                    alt={`Image ${index + 1}`}
                    className="w-full h-[200px] cursor-pointer rounded-lg"
                    loading="lazy"
                    onClick={() => handleJilliOpen(item.id)}
                  />
                </div>
              ))}
          </div>
        )}
        {/* Slots game */}
        {tab === "PVC" && (
          <div className="grid grid-cols-12 gap-3 mt-3">
            {[
              "https://i.ibb.co/GvvYf3JL/pvc1.png",
              "https://i.ibb.co/wF6rT0yw/pvc2.png",
              "https://i.ibb.co/352KZsZT/pvc3.png",
            ]?.map((item, index) => (
              <div className="col-span-4" key={index}>
                <img
                  src={item}
                  alt={`Image ${index + 1}`}
                  className="w-full h-[150px] cursor-pointer rounded-lg"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
        {/* Slots game */}
        {tab === "Sports" && (
          <div className="grid grid-cols-12 gap-3 mt-3">
            {[
              "https://i.ibb.co/8gPLBczQ/vendorlogo-20240611171549i8md.png",
              "https://i.ibb.co/fYm4nYtM/vendorlogo-20240611171621j6wf.png",
              "https://i.ibb.co/6RH8B9Sp/vendorlogo-20240611171602f8k1.png",
            ]?.map((item, index) => (
              <div className="col-span-4" key={index}>
                <img
                  src={item}
                  alt={`Image ${index + 1}`}
                  className="w-full h-[150px] cursor-pointer rounded-lg"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AllOnlineGames;

const gameData = [
  {
    id: 1,
    name: "Win Go",
    image: "https://i.ibb.co/1YpMws1w/lotterycategory-wingo.png",
    description1: "Guess Number",
    description2: "Green/Red/Violet to win",
    link: "/wingo",
  },
  {
    id: 2,
    name: "K3",
    image: "https://i.ibb.co/8DM9C571/lotterycategory-k3.png",
    description1: "Guess Number",
    description2: "Big/Small/Odd/Even",
    link: "/k3",
  },
  {
    id: 3,
    name: "5D",
    image: "https://i.ibb.co/rLDKjgV/lotterycategory-5d.png",
    description1: "Guess Number",
    description2: "Big/Small/Odd/Even",
    link: "/5d",
  },
  {
    id: 4,
    name: "Trx Win Go",
    image: "https://i.ibb.co/MDHJpJL6/trx-ec.png",
    description1: "Guess Number",
    description2: "Green/Red/Violet to win",
    link: "/trx",
  },
];
