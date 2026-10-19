import React from "react";
import CustomeNavbar from "../../components/CustomeNavbar";
// import { IoTriangleSharp } from "react-icons/io5";

const EventDetail = () => {
  return (
    <div className="min-h-screen bgs-body">
      {/* Header */}
      <CustomeNavbar name="Activity Details" />

      {/* Activity Details */}
      <div className="mx-4">
        <div className="blue-linear rounded-t-lg mt-5 flex items bg-center justify-between px-6 py-3 text-white font-semibold">
          <div>Task</div>
          <div>Number of Spins</div>
          <div>spin time</div>
        </div>

        {/* Balance */}
        <div>
          <div className="bg-light h-[auto] flex items-center justify-between px-4 py-4 text-[#768096]  ">
            <div className="flex flex-col items-center justify-center leading-5">
              <p className="text-[16px] text-[#F5CC2C] ">₹1,000.00</p>
              <span className="text-[15px]">Cumulative </span>
              <span className="text-[15px]"> depositsBalance</span>
            </div>
            <div className="text-whites text-[16px] ">+1</div>
            <div className="font-semibold">00:00-23:59</div>
          </div>

          <div className="bg-popup-nav h-[auto] flex items-center justify-between px-4 py-4 text-[#768096]  ">
            <div className="flex flex-col items-center justify-center leading-5">
              <p className="text-[16px] text-[#F5CC2C] ">₹5,000.00</p>
              <span className="text-[15px]">Cumulative </span>
              <span className="text-[15px]"> depositsBalance</span>
            </div>
            <div className="text-whites text-[16px] ">+2</div>
            <div className="font-semibold">00:00-23:59</div>
          </div>

          <div className="bg-light h-[auto] flex items-center justify-between px-4 py-4 text-[#768096]  ">
            <div className="flex flex-col items-center justify-center leading-5">
              <p className="text-[16px] text-[#F5CC2C] ">₹10,000.00</p>
              <span className="text-[15px]">Cumulative </span>
              <span className="text-[15px]"> depositsBalance</span>
            </div>
            <div className="text-whites text-[16px] ">+3</div>
            <div className="font-semibold">00:00-23:59</div>
          </div>

          <div className="bg-popup-nav h-[auto] flex items-center justify-between px-4 py-4 text-[#768096]  ">
            <div className="flex flex-col items-center justify-center leading-5">
              <p className="text-[16px] text-[#F5CC2C] ">₹50,000.00</p>
              <span className="text-[15px]">Cumulative </span>
              <span className="text-[15px]"> depositsBalance</span>
            </div>
            <div className="text-whites text-[16px] ">+4</div>
            <div className="font-semibold">00:00-23:59</div>
          </div>

          <div className="bg-light h-[auto] flex items-center justify-between px-4 py-4 text-[#768096]  ">
            <div className="flex flex-col items-center justify-center leading-5">
              <p className="text-[16px] text-[#F5CC2C] ">₹100,000.00</p>
              <span className="text-[15px]">Cumulative </span>
              <span className="text-[15px]"> depositsBalance</span>
            </div>
            <div className="text-whites text-[16px] ">+5</div>
            <div className="font-semibold">00:00-23:59</div>
          </div>

          <div className="bg-popup-nav h-[auto] flex items-center justify-between px-4 py-4 text-[#768096]  ">
            <div className="flex flex-col items-center justify-center leading-5">
              <p className="text-[16px] text-[#F5CC2C] ">₹200,000.00</p>
              <span className="text-[15px]">Cumulative </span>
              <span className="text-[15px]"> depositsBalance</span>
            </div>
            <div className="text-whites text-[16px] ">+6</div>
            <div className="font-semibold">00:00-23:59</div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-light h-auto rounded-lg mt-10 pb-6">
          <h1 className="bg-[#F5CC2C] mx-24 text-center text-white font-bold tracking-wider text-[20px] rounded">
            Rules
          </h1>

          <div className="flex items-start justify-start gap-5 px-2 mt-3 py-3">
            <h3 className="leading-5 tracking-normal text-[15px] text-gray-500 font-medium">
              Members must reach the single deposit amount and cumulative
              deposit amount to be eligible to participate in the lottery
            </h3>
          </div>

          <div className="flex items-start justify-start gap-5 px-2 pb-3">
            <h3 className="leading-5 tracking-normal text-[15px] text-gray-500 font-medium">
              Conditions for withdrawal of wheel rewards:{" "}
              <span className="text-[#F5CC2C]">1</span> times turnover required.
            </h3>
          </div>

          <div className="flex items-start justify-start gap-5 px-2">
            <h3 className="leading-5 tracking-normal text-[15px] text-gray-500 font-medium">
              If you receive monetary rewards, there is no need to apply, the
              system will automatically add them to your member ID (please
              contact customer service to receive physical rewards)
            </h3>
          </div>

          <div className="flex items-start justify-start gap-5 px-2 py-3">
            <h3 className="leading-5 tracking-normal text-[15px] text-gray-500 font-medium">
              The lottery round starts every morning at{" "}
              <span className="text-[#F5CC2C]">00:00</span>. After making your
              deposit, you need to wait 5 minutes before the draw wheel starts.
            </h3>
          </div>

          <div className="bg-popup-nav h-auto px-3 leading-5 tracking-wider text-[15px] text-gray-500 font-medium mx-3 rounded-lg py-3 mt-2">
            <p>For example:</p>
            <span>If a member's single deposit exceeds </span>
            <span className="text-[#F5CC2C]">₹200,000.00</span>
            <span>
              {" "}
              on the same day, he or she will receive{" "}
              <span className="text-[#F5CC2C]">6</span>{" "}
            </span>
            <span>
              lucky draw opportunities. The lottery draws are valid for the same
              day and cannot be accumulated to the next day!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
