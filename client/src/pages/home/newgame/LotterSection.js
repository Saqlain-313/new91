import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JilliPopup from "../../../components/JilliPopup";

const LotterSection = () => {
  const navigate = useNavigate();

  const [soon, setSoon] = useState(false);
  const [gameId, setGameId] = useState("");

  // Direct navigation without login or recharge checks.
  const handleCheck = (path) => {
    if (path === "motobike") {
      setSoon(true);
      return;
    }

    navigate(path);
  };

  const handleCloseSoon = () => {
    setSoon(false);
  };

  const handleJilliOpen = (apiKey) => {
    setGameId(apiKey);
  };

  return (
    <>
      {gameId && <JilliPopup gameId={gameId} />}

      {/* Coming Soon Popup - Motobike only */}
      {soon && (
        <div className="fixed inset-0 z-[30] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-70"
            onClick={handleCloseSoon}
          />

          {/* Popup Box */}
          <div className="z-10 bg-[#000251] text-center p-5 rounded-xl shadow-lg w-full max-w-[340px]">
            <h3 className="text-lg font-semibold text-white">Alert</h3>

            <p className="text-sm text-white mt-1.5">
              Game will be available soon
            </p>

            <button
              type="button"
              className="bg-[#23C1DB] text-white px-5 py-1.5 mt-4 rounded-full text-sm hover:bg-[#1ab3c7] transition"
              onClick={handleCloseSoon}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Lottery Game Section */}
      <div>
        <p className="mt-2 flex items-center gap-2 text-base text-gray-200 font-semibold">
          <span>
            <img
              src="https://i.ibb.co/mCS1hw9t/L-d9b599f044f44fc10475.png"
              className="size-8"
              alt="Lottery icon"
            />
          </span>
          Lottery
        </p>

        <div className="grid grid-cols-12 gap-2 mt-2">
          {/* WinGo */}
          <div
            className="col-span-6 cursor-pointer"
            onClick={() => handleCheck("wingo?Game=10")}
          >
            <img
              src="https://i.ibb.co/PvF6n675/wingo-1.png"
              alt="WinGo"
              className="w-full h-28 rounded-lg object-cover"
            />
          </div>

          {/* K3 */}
          <div
            className="col-span-6 cursor-pointer"
            onClick={() => handleCheck("k3")}
          >
            <img
              src="https://i.ibb.co/YB46Rgh8/k3-1.png"
              alt="K3"
              className="w-full h-28 rounded-lg object-cover"
            />
          </div>

          {/* 5D */}
          <div
            className="col-span-6 cursor-pointer"
            onClick={() => handleCheck("5d")}
          >
            <img
              src="https://i.ibb.co/B5GRf7y0/5d-1.png"
              alt="5D"
              className="w-full h-28 rounded-lg object-cover"
            />
          </div>

          {/* Motobike - Coming Soon */}
          <div
            className="col-span-6 cursor-pointer"
            onClick={() => handleCheck("motobike")}
          >
            <img
              src="https://i.ibb.co/SXx5s8kt/moto-racing.png"
              alt="Motobike"
              className="w-full h-28 rounded-lg object-cover"
            />
          </div>

          {/* TRX */}
          <div
            className="col-span-6 cursor-pointer"
            onClick={() => handleCheck("trx")}
          >
            <img
              src="https://i.ibb.co/fzwhzMcp/trxcard.png"
              alt="TRX"
              className="w-full h-28 rounded-lg object-cover"
            />
          </div>

          {/* Aviator */}
          <div
            className="col-span-6 cursor-pointer"
            onClick={() => handleJilliOpen("a04d1f3eb8ccec8a4823bdf18e3f0e84")}
          >
            <img
              src="https://i.ibb.co/XfwVQ9SS/Blueaviatorcard-min.png"
              alt="Aviator"
              className="w-full h-28 rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default LotterSection;
