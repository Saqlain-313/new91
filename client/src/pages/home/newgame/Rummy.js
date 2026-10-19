import React, { useCallback, useEffect, useState } from "react";
import { platformData, fishingData } from "../lottery/AllgameData";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import JilliPopup from "../../../components/JilliPopup";
import { userDetail } from "../../../store/reducer/authReducer";
import debounce from "lodash/debounce";
import {
  gameListByGameType,
  launchGame,
} from "../../../store/reducer/spribeGameReducer";

const Rummy = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { listTypeData, loader } = useSelector((state) => state.spribeGame);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [jilliPopup, setJilliPopup] = useState(false);
  const [gameId, setGameId] = useState();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [game_type, setGame_type] = useState("India Poker Game");

  const debouncedDispatch = useCallback(
    debounce(() => {
      dispatch(gameListByGameType({ game_type, page, size }));
    }, 300), // Adjust the debounce delay as needed
    [dispatch]
  );
  useEffect(() => {
    debouncedDispatch(); // Call the debounced dispatch function
  }, [debouncedDispatch]);

  const handleJilliOpen = (data) => {
    setGameId(data);
    setJilliPopup(true);
  };

  const handleJilliSubmit = () => {
    if (userInfo === undefined || userInfo === "") {
      navigate("/login");
    } else {
      if (userInfo?.isdemo == 0) {
        let playerid = userInfo?.phone_user;
        dispatch(launchGame({ playerid, gameId })).then((res) => {
          if (res.payload.status) {
            window.location.href = res.payload.data.launch_view_url;
            setJilliPopup(false);
          }
        });
      } else {
      }
    }
  };

  return (
    <>
      {gameId && <JilliPopup gameId={gameId} />}
      <h4 className="border-after mt-2 text-black text-lg border-l-4 border-[#F5CC2C] pl-1 mb-3">
        Rummy
      </h4>
      <div className="grid grid-cols-12 gap-3">
        {listTypeData?.map((items, i) => (
          <div className="col-span-4 bg-home-lg rounded-lg" key={i}>
            <img
              src={items.icon}
              alt=""
              loading="lazy"
              className="w-full rounded-lg p-[1px] h-[22vh]"
              onClick={() => handleJilliOpen(items.game_uid)}
            />
          </div>
        ))}
      </div>

      {/* <div className={jilliPopup ? "overlay-section block" : "hidden"}></div>
      {jilliPopup && (
        <div className="fixed top-0 z-[20] bottom-0 h-32 m-auto flex flex-col justify-center items-center left-0 right-0 w-[20rem] bg-light rounded-lg">
          <h3 className="heading-h3 gray-50 mt-5">Tips</h3>
          <p className="text-sm gray-100 mt-2">
            Are you sure you want to join the game?
          </p>

          <div className="w-full mt-5">
            <button
              className="gray-50 p-2 w-[50%]  rounded-bl-lg "
              onClick={() => setJilliPopup(false)}
            >
              Cancel
            </button>
            <button
              disabled={loader}
              className="text-blue p-2 rounded-br-lg  w-[50%]"
              onClick={handleJilliSubmit}
            >
              Confirm
            </button>
          </div>
        </div>
      )} */}
    </>
  );
};

export default Rummy;
