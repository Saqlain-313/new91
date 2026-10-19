import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import debounce from "lodash/debounce";
import JilliPopup from "../../../components/JilliPopup";
import { launchGame } from "../../../store/reducer/spribeGameReducer";

const Slots = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { loader } = useSelector((state) => state.spribeGame);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [jilliPopup, setJilliPopup] = useState(false);
  const [gameId, setGameId] = useState();

  // ✅ Static slots with images & unique ids
  const staticSlots = [
    {
      img: "https://i.ibb.co/pBR1wxN5/slot1.png",
      id: "8405541014f364b7dc59657aa6892446",
    },
    {
      img: "https://i.ibb.co/w9g9Cgk/slot2.png",
      id: "724eebd5cbe7555b01ed60279cb59e5a",
    },
    {
      img: "https://i.ibb.co/99bjQGrz/slot3.png",
      id: "9b25f8d744859c6840d16ff6103dc5a6",
    },
    {
      img: "https://i.ibb.co/TxHGR4L8/slot4.png",
      id: "624db9f6b362baf19796f281dfdee1ab",
    },
    {
      img: "https://i.ibb.co/XfC49PXz/slot5.png",
      id: "1fd20a344c9f147cdef85bbaa7447dcd",
    },
    {
      img: "https://i.ibb.co/pBVfBNtk/slot6.png",
      id: "9b25f8d744859c6840d16ff6103dc5a6",
    },
    {
      img: "https://i.ibb.co/60v3SgrG/slot7.png",
      id: "724eebd5cbe7555b01ed60279cb59e5a",
    },
  ];

  const handleJilliOpen = (data) => {
    setGameId(data);
    setJilliPopup(true);
  };

  const handleJilliSubmit = () => {
    if (!userInfo) {
      navigate("/login");
    } else {
      if (userInfo?.isdemo === 0) {
        const playerid = userInfo?.phone_user;
        dispatch(launchGame({ playerid, gameId })).then((res) => {
          if (res.payload.status) {
            window.location.href = res.payload.data.launch_view_url;
            setJilliPopup(false);
          }
        });
      }
    }
  };

  return (
    <>
      {gameId && <JilliPopup gameId={gameId} />}
      <h4 className="border-after mt-2 text-black text-lg border-l-4 border-[#F5CC2C] pl-1 mb-3">
        Slots
      </h4>
      <div className="grid grid-cols-12 gap-3">
        {staticSlots.map((slot, i) => (
          <div className="col-span-4 rounded-lg" key={i}>
            <img
              src={slot.img}
              alt={`Slot ${i + 1}`}
              loading="lazy"
              className="w-full rounded-lg p-[1px] h-[18vh]"
              onClick={() => handleJilliOpen(slot.id)} // ✅using static id
            />
          </div>
        ))}
      </div>
      <Link to={"/home/AllOnlineGames?game=Slots"} className="flex justify-center mt-3">
        <button className="nav-bg px-10 py-1 rounded-full">All Games</button>
      </Link>
      {/* <div className={jilliPopup ? "overlay-section block" : "hidden"}></div>
      {jilliPopup && (
        <div className="fixed top-0 z-[20] bottom-0 h-32 m-auto flex flex-col justify-center items-center left-0 right-0 w-[20rem] bg-light rounded-lg">
          <h3 className="heading-h3 gray-50 mt-5">Tips</h3>
          <p className="text-sm gray-100 mt-2">
            Are you sure you want to join the game?
          </p>

          <div className="w-full mt-5 flex">
            <button
              className="gray-100 p-2 w-1/2 rounded-bl-lg"
              onClick={() => setJilliPopup(false)}
            >
              Cancel
            </button>
            <button
              disabled={loader}
              className="text-blue p-2 rounded-br-lg w-1/2"
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

export default Slots;
