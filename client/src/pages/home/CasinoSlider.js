import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";
// import { BiCategory } from 'react-icons/bi';
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import JilliPopup from "../../components/JilliPopup";
import { gameListByGameTypeAndProvider } from "../../store/reducer/spribeGameReducer";

const CasinoSlider = () => {
  const dispatch = useDispatch();
  const [gameId, setGameId] = useState(null);
  const [gameList, setGameList] = useState([]);
  const gameType = "CasinoLive";

  const handleJilliOpen = (game_uid) => {
    setGameId(game_uid);
  };

  const fetchGameList = useCallback(
    debounce(() => {
      dispatch(
        gameListByGameTypeAndProvider({
          provider: "evolutionlive",
          game_type: gameType,
          page: 1,
          size: 9,
        }),
      ).then((res) => {
        if (res?.payload?.data?.data) {
          setGameList(res.payload.data.data);
        } else {
          setGameList([
            {
              icon: "https://i.ibb.co/RkNF2SJZ/casino1.png",
              game_name: "Mock Game 1",
              game_uid: "mock1",
            },
            {
              icon: "https://i.ibb.co/Txs7HFv3/casino2.png",
              game_name: "Mock Game 2",
              game_uid: "mock2",
            },
            {
              icon: "https://i.ibb.co/Txs7HFv3/casino2.png",
              game_name: "Mock Game 2",
              game_uid: "mock2",
            },
          ]);
        }
      });
    }, 300),
    [dispatch],
  );

  useEffect(() => {
    fetchGameList();
    return () => fetchGameList.cancel();
  }, [fetchGameList]);

  return (
    <>
      {gameId && <JilliPopup gameId={gameId} />}

      <div className="mb-2 mt-2">
        <div className="flex justify-between items-center mb-4">
          <p className="mt-2 flex items-center text-gray-200 gap-2 text-base font-semibold">
            <span>
              <img
                src="https://i.ibb.co/rR8JY3Ys/Chat-GPT-Image-Aug-14-2026-03-17-05-PM.png"
                className="size-8"
                alt="Casino Icon"
              />
            </span>
            Casino Live
          </p>

          <div className="flex items-center gap-2">
            <Link
              to="/home/AllOnlineGames?game=Casino"
              className="text-[12px] text-black font-bold blue-linear px-1.5 py-1 rounded-md"
            >
              Detail
            </Link>

            <button className="casino-prev rounded-md blue-linear text-black p-1 transition">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button className="casino-next rounded-md blue-linear text-black p-1 transition">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-1">
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation={{
              nextEl: ".casino-next",
              prevEl: ".casino-prev",
            }}
            autoplay={{ delay: 3000 }}
            spaceBetween={12}
            slidesPerView={3}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 3 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 3 },
            }}
          >
            {gameList.map((game, index) => (
              <SwiperSlide key={index}>
                <div className="h-[180px]">
                  <div
                    className="h-full flex flex-col rounded-lg shadow-sm hover:shadow-md  cursor-pointer"
                    onClick={() => handleJilliOpen(game.game_uid)}
                  >
                    <div className="w-full h-[200px] overflow-hidden rounded-lg">
                      <img
                        src={game.icon}
                        alt={game.game_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Optional game name */}
                    {/* <div className="p-2 text-center text-xs font-medium text-gray-700">
                      {game.game_name}
                    </div> */}
                  </div>
                </div>
              </SwiperSlide>
            ))}

            {/* Extra Slide for Detail */}
            {/* <SwiperSlide>
              <div className="h-[180px]">
                <Link
                  to="/home/AllOnlineGames?game=Casino"
                  className="h-full rounded-lg overflow-hidden flex flex-col justify-between items-center bg-[#1e1e2f] hover:bg-[#2a2a3a] transition"
                >
                  <div className="flex flex-col items-center justify-center flex-grow w-full">
                    <BiCategory className="text-white text-xl" />
                    <p className="text-xs font-medium text-white mt-2">Detail</p>
                  </div>
                  <div className="w-full text-center p-2 bg-[#2a2a3a]">
                    <p className="text-xs text-white">MG</p>
                  </div>
                </Link>
              </div>
            </SwiperSlide> */}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default CasinoSlider;
