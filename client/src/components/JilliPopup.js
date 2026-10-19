import React, { useState, useEffect } from 'react';
import { launchGame } from '../store/reducer/spribeGameReducer';
import { rechargeList2 } from '../store/reducer/userReducer'; // <- Import your rechargeList2 action here
import { useSelector, useDispatch } from 'react-redux';
import Loader from './Loader';
import { useNavigate } from 'react-router-dom';
import RechargePopup from './RechargePopup';

const JilliPopup = ({ gameId }) => {
  const [betAlert, setBetAlert] = useState(false);
  const [jilliPopup, setJilliPopup] = useState(false);
  const [repopup, setRepopup] = useState(false); // <- You were using this but it wasn't defined
  const { userInfo } = useSelector((state) => state.auth);
  const { loader } = useSelector((state) => state.spribeGame);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 👉 Trigger the API call when gameId changes
  useEffect(() => {
    if (gameId) {
      dispatch(rechargeList2()).then((res) => {
        if (res.payload.data2?.length === 0) {
          setRepopup(true);
        } else if (res.payload.message === 'Please login') {
          navigate('/login');
        } else {
          setJilliPopup(true);
        }
      });
    }
  }, [gameId, dispatch, navigate]);

  // 👉 Handle Jilli Submit
  const handleJilliSubmit = () => {
    if (!userInfo) {
      navigate('/login');
    } else if (userInfo?.isdemo === 0) {
      const playerid = userInfo?.phone_user;
      dispatch(launchGame({ playerid, gameId })).then((res) => {
        if (res?.payload?.status) {
          window.location.href = res.payload.data.launch_view_url;
          setJilliPopup(false);
        }
      });
    } else {
      setBetAlert(true);
      setTimeout(() => {
        setBetAlert(false);
      }, 2000);
    }
  };

    useEffect(() => {
      if (jilliPopup || repopup) {
        document.body.style.overflow = "hidden";
      }
  
      return () => {
        document.body.style.overflow = "auto"; // or 'visible' depending on your default
      };
    }, [jilliPopup,repopup]);

  
  return (
    <>
        {/* 🔹 Render RechargePopup if repopup is true */}
      <RechargePopup repopup={repopup} setRepopup={setRepopup} />
      {loader && <Loader />}

      {betAlert && (
        <div className="fixed top-0 z-[20] bottom-0 bg-[#ffffffdc] h-40 border border-[#1ab266] backdrop-blur-xl m-auto flex flex-col justify-center gap-2 items-center left-0 right-0 w-[20rem] rounded-lg">
          <h3 className="heading-h3 gray-50 mt-5">Alert</h3>
          <p className="text-sm gray-100 mt-2">This is a demo account</p>
          <button
            className="bg-[#1ab266] px-4 py-1 rounded-full"
            onClick={() => setBetAlert(false)}
          >
            Close
          </button>
        </div>
      )}

      {/* Overlay Section */}
      <div className={betAlert ? 'overlay-section block' : 'hidden'}></div>
      <div className={jilliPopup ? 'overlay-section block' : 'hidden'}></div>
      
      {jilliPopup && (
        <div className="fixed top-0 z-[20] bottom-0 h-32 m-auto flex flex-col justify-center items-center left-0 right-0 w-[20rem] bg-light rounded-lg pb-2">
          <h3 className="heading-h3 gray-50 mt-5">Tips</h3>
          <p className="text-sm text-whites mt-2">
            Are you sure you want to join the game?
          </p>

          <div className="w-full mt-5">
            <button
              className="text-gray-400 p-2 w-[50%] rounded-bl-lg"
              onClick={() => setJilliPopup(false)}
            >
              Cancel
            </button>
            <button
              className="p-2 text-blue rounded-br-lg w-[50%]"
              onClick={handleJilliSubmit}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default JilliPopup;
