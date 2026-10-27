import { useEffect, useState } from "react";
import Avatar1 from "../../assets/avatar5.png";
import CustomeNavbar from "../../components/CustomeNavbar";

const gameNames = [
  "Limbo",
  "Crash",
  "Dice",
  "Roulette",
  "Plinko",
  "Mines",
  "HiLo",
];
const phoneNumbers = Array.from({ length: 50 }, (_, i) => {
  const num = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  return `${num.substring(0, 3)}***${num.substring(6)}`;
});

const generateRandomMember = (rank) => {
  const randomGame = gameNames[Math.floor(Math.random() * gameNames.length)];
  const randomPhone =
    phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
  const bonus = (Math.random() * 1000 + 100).toFixed(2); // 100 - 1100
  const multiplier = (Math.random() * 5 + 1).toFixed(1) + "X"; // 1.0X - 6.0X
  const winningTime = new Date(
    Date.now() - Math.random() * 86400000,
  ).toLocaleString(); // within last 24 hours

  return {
    rank,
    phone: randomPhone,
    game: randomGame,
    multiplier,
    bonus,
    time: winningTime,
  };
};

const generateRanking = () => {
  return Array.from({ length: 15 }, (_, i) => generateRandomMember(i + 1));
};

const JackpotStar = () => {
  const [ranking, setRanking] = useState(generateRanking());

  useEffect(() => {
    const interval = setInterval(() => {
      setRanking(generateRanking());
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <CustomeNavbar name="Winning star" />
      <div className="container-section mt-3">
        <div className="nav-bg rounded-lg p-2 pb-5">
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-popup-nav text-white text-sm">
                  <th className="p-2 text-left">Rank</th>
                  <th className="p-2 text-left">Player</th>
                  <th className="p-2 text-left">Game</th>
                  <th className="p-2 text-left">Multiplier</th>
                  <th className="p-2 text-left">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((member) => (
                  <tr
                    key={member.rank}
                    className="border-b border-gray-700 text-sm"
                  >
                    <td className="p-2">
                      <span
                        className={`inline-block w-4 h-4 rounded-full text-center leading-4 text-xs 
                        ${member.rank <= 3 ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"}`}
                      >
                        {member.rank}
                      </span>
                    </td>
                    <td className="p-2 text-white flex items-center text-xs">
                      <img
                        src={Avatar1}
                        alt="Avatar"
                        className="w-4 rounded-full mr-2"
                      />
                      {member.phone}
                    </td>
                    <td className="p-2 text-xs text-gray-400">{member.game}</td>
                    <td className="p-2 text-xs text-yellow-400">
                      {member.multiplier}
                    </td>
                    <td className="p-2 text-xs text-red-400">
                      ₹{member.bonus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default JackpotStar;
