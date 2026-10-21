import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";
import { BiCategory } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import JilliPopup from "../../components/JilliPopup";
import { gameListByGameTypeAndProvider } from "../../store/reducer/spribeGameReducer";

const MiniGames = () => {
  const dispatch = useDispatch();

  const [gameId, setGameId] = useState(null);
  const [gameList, setGameList] = useState([]);
  const [gameType] = useState("CasinoTable");

  const handleJilliOpen = (id) => {
    if (id) {
      setGameId(id);
    }
  };

  const fetchGameList = useCallback(
    debounce(() => {
      dispatch(
        gameListByGameTypeAndProvider({
          provider: "spribe",
          game_type: gameType,
          page: 1,
          size: 9,
        }),
      ).then((res) => {
        if (res?.payload?.data?.data) {
          setGameList(res.payload.data.data);
        }
      });
    }, 300),
    [dispatch, gameType],
  );

  useEffect(() => {
    fetchGameList();
    return () => fetchGameList.cancel();
  }, [fetchGameList]);

  return (
    <>
      {gameId && <JilliPopup gameId={gameId} />}

      <div className="mb-8 mt-5">
        <p className="mt-2 flex items-center gap-2 text-base font-semibold ">
          <span>
            <img
              src="	https://i.ibb.co/wFZqXRnG/MINI-GAME.png"
              className="size-8"
              alt="icon"
            />
          </span>
          Mini Games
        </p>

        <div className="games-grid mt-1 grid grid-cols-3 gap-2 px-1">
          {gameList.map((game, index) => (
            <div
              key={index}
              className="border rounded-lg shadow-sm hover:shadow-md bg-white cursor-pointer"
            >
              <img
                src={game.icon}
                alt={game.game_name}
                className="w-full h-[200px] rounded-md mb-2 object-fill"
                onClick={() => handleJilliOpen(game.game_uid)}
              />
            </div>
          ))}

          {/* Custom card at the end */}
          <Link
            className="rounded-lg overflow-hidden flex flex-col justify-between items-center h-[200px] more-game"
            to="/home/AllOnlineGames"
          >
            <div className="flex flex-col items-center justify-center py-6">
              <BiCategory className="size-6 text-white" />
              <p className="text-xs font-medium text-white mt-2">Detail</p>
            </div>
            <div className="more-l2 w-full text-center p-3">
              <p>MG</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default MiniGames;
