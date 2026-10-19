import React, { useCallback, useEffect, useState } from "react";
import { platformData, popularData } from "../lottery/AllgameData";

import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userDetail } from "../../../store/reducer/authReducer";
import debounce from "lodash/debounce";
import JilliPopup from "../../../components/JilliPopup";
import { jilliGame } from "../../../store/reducer/gameReducer";
import {
  gameList,
  gameListByGameType,
  launchGame,
} from "../../../store/reducer/spribeGameReducer";

const Popular = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { listTypeData, loader } = useSelector((state) => state.spribeGame);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [jilliPopup, setJilliPopup] = useState(false);
  const [gameId, setGameId] = useState();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [game_type, setGame_type] = useState("Table Game");

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
      <h4 className="border-after mt-2 text-black font-bold flex">
        <img
          src="https://i.ibb.co/v4s0cL13/platform-List-5db5d715.webp"
          alt=""
          className="w-5 h-5 mr-2"
        />
        Popular
      </h4>

      <div className="grid grid-cols-12 gap-3 mt-2">
        {listTypeData &&
          listTypeData?.map((items, i) => (
            <div className="col-span-4" key={i}>
              <div className="rounded-lg">
                <img
                  src={items.icon}
                  alt=""
                  loading="lazy"
                  className="w-full h-[18vh]"
                  onClick={() => handleJilliOpen(items.game_uid)}
                />
              </div>
              <p className="fs-sm bg-color-l text-white mt-2 font-semibold rounded-s-md p-1 ps-2">
                odds of{" "}
                <span className="ms-2">
                  {Number(items.id / 11.3).toFixed(2)}%
                </span>
              </p>
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
              className="text-blue p-2 rounded-br-lg  w-[50%]"
              disabled={loader}
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

export default Popular;
