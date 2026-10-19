import React,{useState, useCallback, useEffect } from 'react'
import debounce  from "lodash/debounce";
import { BiCategory } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import JilliPopup from '../../../components/JilliPopup';
import { gameListByGameTypeAndProvider, gameListByProvider } from '../../../store/reducer/spribeGameReducer';

const JDBGame = () => {
   
  const dispatch = useDispatch();
 
  const [gameId, setGameId] = useState();
  const [gameList,setGameList]=useState([]);
   
    const [gameType, setGameType] = useState("arcade");


  const handleJilliOpen = (data) => {
    setGameId(data);
  
  };
  
    const fetchGameList = useCallback(
    debounce(() => {
      dispatch(gameListByProvider({ provider: "jdb", page:1, size:5 })).then(
        (res) => {
          if (res?.payload?.data?.data) {
            setGameList(res.payload.data.data);
          }
        }
      );
    }, 300),
    [dispatch, gameType]
  );

  useEffect(() => {
    fetchGameList();
    return () => fetchGameList.cancel();
  }, [fetchGameList]);


  return (
    <>
    

         {gameId && <JilliPopup gameId={gameId} />}

     <div className="mb-8">
                     <div className="flex justify-between items-center">
                       <div className="flex items-center">
                         <h1 className="border-after mt-2 text-whites font-[400] text-base">
                           JDB
                         </h1>
                       </div>
                     </div>
                     <div className="games-grid mt-1 grid grid-cols-3 gap-2 px-1">
                       {gameList&& gameList?.map((game, index) => (
                         <div
                           key={index}
                           className=" rounded-lg h-[140px] shadow-sm hover:shadow-md "
                         >
                           <img
                           data-origin={game.icon}
                             src={game.icon}
                             alt={game.game_name}
                             loading='lazy'
                             className="w-full h-full rounded-md mb-2 object-fill"
                               onClick={() => 
                handleJilliOpen(game.game_uid)     }
                           />
                         </div>
                       ))}
                       {/* Custom card at index six */}
                       <Link
                         className="rounded-lg overflow-hidden flex flex-col justify-between items-center h-[140px] more-game"
                         to={"/home/AllOnlineGames"}
                       >
                         <div className="flex flex-col items-center justify-center py-6">
                           <BiCategory className="size-6 text-whites" />
                           <p className="text-xs font-medium text-whites mt-2">
                             Detail
                           </p>
                         </div>
                         <div className="more-l2 w-full text-center p-3">
                           <p>JDB</p>
                         </div>
                       </Link>
                     </div>
                   </div> 


  
    </>
  )
}

export default JDBGame
