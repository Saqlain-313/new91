import debounce from "lodash/debounce";
import { useCallback, useEffect, useRef, useState } from "react";
// import { BiCategory } from 'react-icons/bi';
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import JilliPopup from "../../../components/JilliPopup";
import { gameListByGameTypeAndProvider } from "../../../store/reducer/spribeGameReducer";

const MiniGamesPage = () => {
  const dispatch = useDispatch();
  const [gameId, setGameId] = useState();
  const [gameList, setGameList] = useState([]);
  const [gameType, setGameType] = useState("CasinoTable");

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const handleJilliOpen = (data) => {
    setGameId(data);
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
        } else {
          // fallback mock data
          setGameList([
            {
              icon: "https://i.ibb.co/HTCgHCrp/22001.jpg",
              game_name: "Mock Game 1",
              game_uid: "mock1",
            },
            {
              icon: "https://i.ibb.co/qM6JZvK5/801.png",
              game_name: "Mock Game 2",
              game_uid: "mock2",
            },
            {
              icon: "https://i.ibb.co/pTQBRdv/4.png",
              game_name: "Mock Game 3",
              game_uid: "mock2",
            },
          ]);
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

      <div className="mb-2 mt-2">
        <div className="flex justify-between items-center mb-4">
          <p className="mt-2 flex items-center text-gray-200 gap-2 text-base font-semibold ">
            <span>
              <img
                src="	https://i.ibb.co/wFZqXRnG/MINI-GAME.png"
                className="size-8"
                alt="icon"
              />
            </span>
            Mini Games
          </p>

          <div className="flex items-center gap-2">
            <Link
              to="/home/AllOnlineGames?game=Mini games"
              className="text-[12px] text-black font-bold blue-linear px-1.5 py-1 rounded-md"
            >
              Detail
            </Link>

            <button
              ref={prevRef}
              className="rounded-md blue-linear text-black font-bold p-1"
            >
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

            <button
              ref={nextRef}
              className="rounded-md blue-linear text-black font-bold p-1"
            >
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
            onInit={(swiper) => {
              // @ts-ignore
              swiper.params.navigation.prevEl = prevRef.current;
              // @ts-ignore
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
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
                    className="h-full flex flex-col rounded-lg shadow-sm hover:shadow-md bg-white cursor-pointer"
                    onClick={() => handleJilliOpen(game.game_uid)}
                  >
                    <div className="w-full h-[200px] overflow-hidden rounded-lg">
                      <img
                        src={game.icon}
                        alt={game.game_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}

            {/* <SwiperSlide>
              <div className="h-[180px]">
                <Link
                  to="/home/AllOnlineGames"
                  className="h-full rounded-lg overflow-hidden flex flex-col justify-between items-center bg-[#1e1e2f] hover:bg-[#2a2a3a] transition"
                >
                  <div className="flex flex-col items-center justify-center flex-grow w-full">
                    <BiCategory className="text-white font-bold text-xl" />
                    <p className="text-xs  text-white font-bold mt-2">Detail</p>
                  </div>
                  <div className="w-full text-center p-2 bg-[#2a2a3a]">
                    <p className="text-xs text-white font-bold">MG</p>
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

export default MiniGamesPage;
