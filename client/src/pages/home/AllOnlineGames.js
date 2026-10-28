import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useDispatch } from "react-redux";
import CustomeNavbar from "../../components/CustomeNavbar";
import JilliPopup from "../../components/JilliPopup";
import RechargePopup from "../../components/RechargePopup";
import { gameListByGameTypeAndProvider } from "../../store/reducer/spribeGameReducer";
import { rechargeList2 } from "../../store/reducer/userReducer";
import LotterSection from "./newgame/LotterSection";

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
    props.active
      ? "var(--Gradient-1, linear-gradient(93deg, var(--mediam-blue) 7.38%, var(--bgblue) 94.48%))"
      : "#201d2b"};
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
      icon: "https://i.ibb.co/mCS1hw9t/L-d9b599f044f44fc10475.png",
      id: "Lottery",
      type: "",
    },
    {
      name: "Slots",
      icon: "	https://i.ibb.co/35SV9gdz/SUPER-JACKPOT.png",
      id: "Slot Game",
      type: "jili",
    },
    {
      name: "Mini games",
      icon: "	https://i.ibb.co/wFZqXRnG/MINI-GAME.png",
      id: "CasinoTable",
      type: "spribe",
    },
    {
      name: "Fishing",
      icon: "https://i.ibb.co/JRnd4dfz/f.png",
      id: "Fish Game",
      type: "jili",
    },
    {
      name: "Casino",
      icon: "https://i.ibb.co/rR8JY3Ys/Chat-GPT-Image-Aug-14-2026-03-17-05-PM.png",
      id: "CasinoLive",
      type: "evolutionlive",
    },
    {
      name: "PVC",
      icon: "https://i.ibb.co/7Nn3hdyq/Chat-GPT-Image-Aug-14-2026-03-05-38-PM.png",
      id: "Ca",
      type: "ev",
    },
    {
      name: "Sports",
      icon: "https://i.ibb.co/C34fRZTP/sports.png",
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
        size: 50,
      }),
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
        <div className="p-2">
          <LotterSection />
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
              "https://i.ibb.co/ZQcyY3X/vendorlogo-20240620145952prhc.png",
              "https://i.ibb.co/hRpgZ6N9/vendorlogo-20240620145936heyd.png",
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
              "https://i.ibb.co/4gDkSFQh/img1.png",
              "https://i.ibb.co/pvmfQSRy/img2.png",
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
    image: "https://i.ibb.co/7xzW3FWt/wingo.png",
    description1: "Guess Number",
    description2: "Green/Red/Violet to win",
    link: "/wingo",
  },
  {
    id: 2,
    name: "K3",
    image: "https://i.ibb.co/RksPMscQ/k3.png",
    description1: "Guess Number",
    description2: "Big/Small/Odd/Even",
    link: "/k3",
  },
  {
    id: 3,
    name: "5D",
    image: "https://i.ibb.co/bj9PQtCK/5d.png",
    description1: "Guess Number",
    description2: "Big/Small/Odd/Even",
    link: "/5d",
  },
  {
    id: 4,
    name: "Trx Win Go",
    image: "https://i.ibb.co/Df41Vh4p/4.png",
    description1: "Guess Number",
    description2: "Green/Red/Violet to win",
    link: "/trx",
  },
];
