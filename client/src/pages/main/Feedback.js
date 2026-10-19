import React, { useEffect } from "react";

import FeedbackImg from "../../assets/feedbackImg.png";
import CustomeNavbar from "../../components/CustomeNavbar";
const Feedback = () => {
  useEffect(()=>{
    window.scrollTo(0,0)
  },[])
  return (
    <>
      <CustomeNavbar name="Feedback"/>

      <div className="container-section mt-3">
        <div className="bg-body rounded-xl">
          <textarea
            name=""
            id=""
            className="w-full h-[365.333px] p-4 gray-text fs-sm bg-transparent focus:outline-none placeholder:text-gray-text rounded-lg"
            placeholder="Welcome to feedback, please give feedback-please describe the problem in detail when providing feedback, preferably attach a screenshot of the problme you accountered, we will immediately process your feddback!"
          ></textarea>
        </div>
        <div className="mt-9 flex flex-col justify-center items-center">
          <p className="heading-h4 text-whites mb-1">
            Send helpful feedback
          </p>
          <p className="heading-h4 text-whites mb-2">
            Chance to win Mystery Rewards
          </p>
          <img src={FeedbackImg} alt="" className="w-52 my-3" />

          <button className="blue-linear flex justify-center text-white text-lg  w-full  m-auto font-medium text-center  rounded-full p-2 mt-5">
            Submit
          </button>
        </div>
      </div>
    </>
  );
};

export default Feedback;
