import React, { useState } from "react";
import JilliPopup from "../../../components/JilliPopup";

const games = [
  {
    apiKey: "2126c5c458316ba1f2df65b387b60408",
    label: "Game 1",
    image: "https://i.ibb.co/8Dfdw2kg/8.png",
  },
  {
    apiKey: "562b299961b0ec40f252a832453c67b0",
    label: "Game 2",
    image: "https://i.ibb.co/ZR1RPfCD/10.png",
  },
  {
    apiKey: "66d311ff6cf531e40b61c483dd34c5c9",
    label: "Game 3",
    image: "https://i.ibb.co/j9zrxLrQ/penalty.png",
  },
  {
    apiKey: "458bd34bc83e34501df7e7f96626df6b",
    label: "Game 4",
    image: "https://i.ibb.co/SDqzpXhp/FOREST-fortune.png",
  },
  {
    apiKey: "af95a673c8f3a420444d73421bcf0e7a",
    label: "Game 5",
    image: "https://i.ibb.co/prKt17tY/HAMSTER-RUN.png",
  },
  {
    apiKey: "134bbc0f61b73824cf9a68411aa32dc6",
    label: "Game 6",
    image: "https://i.ibb.co/YFh6Mbgv/plinko-aztec.png",
  },
  {
    apiKey: "3c802c686f7f9270057b6bb69567ea98",
    label: "Game 7",
    image: "https://i.ibb.co/nsPhPf0S/sugar-daddy.png",
  },
  {
    apiKey: "23d59c10bc65c3cfb6cafdf49969a2b7",
    label: "Game 8",
    image: "https://i.ibb.co/nMzXGpMx/JOKER-POKER.png",
  },
  {
    apiKey: "a6212c1c462a2442a369a4ec25bf40d7",
    label: "Game 9",
    image: "https://i.ibb.co/TM3xkTdR/STAIRS.png",
  },
  {
    apiKey: "4169b950c7cbd0bbd392941a13e56767",
    label: "Game 10",
    image: "https://i.ibb.co/SDxP1j4y/TRIPLE.png",
  },
  {
    apiKey: "09a138907ccf03d5c064c5ca71e9d9b3",
    label: "Game 11",
    image: "https://i.ibb.co/xtbHQWwz/JOGO-DO-BICHO.png",
  },
  {
    apiKey: "81c4999d70b1ebbb7cf89d8e41ad493c",
    label: "Game 12",
    image: "https://i.ibb.co/PvHnDPtB/LIMBO.png",
  },
  {
    apiKey: "cb66d23b547498132598589af324d558",
    label: "Game 13",
    image: "https://i.ibb.co/294q1ZG/AVIA-FLY.jpg",
  },
  {
    apiKey: "3a3affa176283107288f5da3698ffe7c",
    label: "Game 14",
    image: "https://i.ibb.co/q32dzkSG/lucky-mines.png",
  },
  {
    apiKey: "9b48efcf6b18b12fdd7dc8efe9ae971e",
    label: "Game 15",
    image: "https://i.ibb.co/hJXnJMtY/coinflip.png",
  },
  {
    apiKey: "c81286ce4034dcf5b71d44c106f968db",
    label: "Game 16",
    image: "https://i.ibb.co/dwhTwyDB/roulette.jpg",
  },
  {
    apiKey: "f84949bd783c7395b5f3092f4d4ec600",
    label: "Game 17",
    image: "https://i.ibb.co/S4v7Y1BY/bubbles.png",
  },
  {
    apiKey: "e5e23d4c8f7256a1753793cba5fb5aaf",
    label: "Game 18",
    image: "https://i.ibb.co/zhh2pn8R/mines.png",
  },
  {
    apiKey: "2c62ddc0ad8e2c175ec771882e91789b",
    label: "Game 19",
    image: "https://i.ibb.co/Xk7b07Nd/sweet-keno.png",
  },
  {
    apiKey: "6180fdaf4dfab4042194a7d595aca4bb",
    label: "Game 20",
    image: "https://i.ibb.co/7NxCG0pm/hot-mines.jpg",
  },
  {
    apiKey: "eb3f4260c17737e09767bc4c06796a61",
    label: "Game 21",
    image: "https://i.ibb.co/KpkK12BK/plinko-1000.jpg",
  },
  {
    apiKey: "46d14949aa244609aaa03fa58b198784",
    label: "Game 22",
    image: "https://i.ibb.co/rKPrwBvX/goblin-tower.png",
  },
  {
    apiKey: "d0ddc8acfbc6836f0db6d270bd83243d",
    label: "Game 23",
    image: "https://i.ibb.co/MyMnCVYf/Robo-dice.png",
  },
  {
    apiKey: "f4fd956965b6f08ce48fee7d4407aaed",
    label: "Game 24",
    image: "https://i.ibb.co/8n8dLj7r/New-hilo-joker.png",
  },
  {
    apiKey: "d8439d6083288f9171930e60836ba505",
    label: "Game 25",
    image: "https://i.ibb.co/jPG75F7s/double-online.png",
  },
  {
    apiKey: "90741c45a03fbfc800f79c3f5a23be44",
    label: "Game 26",
    image: "https://i.ibb.co/TBZ3Kg9f/diver.jpg",
  },
  {
    apiKey: "445289d56c9ee8fa590bf6b29b13dc37",
    label: "Game 27",
    image: "https://i.ibb.co/WpKt7yCw/cryptos.png",
  },
  {
    apiKey: "a51b03beafa1773484d1e9c866709589",
    label: "Game 28",
    image: "https://i.ibb.co/xPmGrbS/tower.png",
  },
  {
    apiKey: "757bdd7e1d8c260807bc78449258d00c",
    label: "Game 29",
    image: "https://i.ibb.co/SXTC8jxq/wheel.png",
  },
  {
    apiKey: "8ac6b247bd94d71ecdeaa1e62d74f382",
    label: "Game 30",
    image: "https://i.ibb.co/7JtCsBg8/crash.png",
  },
  // {
  //   apiKey: "9b48efcf6b18b12fdd7dc8efe9ae971e",
  //   label: "Game 31",
  //   image: "https://i.ibb.co/hJXnJMtY/coinflip.png",
  // },
];

const ChikenRoad = () => {
  const [gameId, setGameId] = useState("");

  const handleJilliOpen = (apiKey) => {
    setGameId(apiKey);
    //console.log("Game ID Set:", apiKey);
  };
  return (
    <>
      {gameId && <JilliPopup gameId={gameId} />}

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="border-after font-semibold mt-3 text-whites text-lg border-l-4 border-[#F5CC2C] pl-1">
            Chiken Road
          </h1>
        </div>
      </div>
      <div className="flex items-center w-full mt-2 flex-wrap">
        {games.map((game, index) => (
          <div
            key={index}
            className="w-1/2 flex flex-col items-center p-2 cursor-pointer"
            onClick={() => handleJilliOpen(game.apiKey)}
          >
            <img
              src={game.image}
              alt={game.label}
              className="w-full h-auto rounded object-contain"
            />
            {/* <span className="mt-2 text-sm font-semibold text-white">{game.label}</span> */}
          </div>
        ))}
      </div>
    </>
  );
};

export default ChikenRoad;
