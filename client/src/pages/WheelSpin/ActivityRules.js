import React from "react";
import CustomeNavbar from "../../components/CustomeNavbar";

const ActivityRules = () => {
  return (
    <div className="min-h-screen bgs-body">
      {/* Header */}

      <CustomeNavbar name="Activity Rules" />

      {/* Rules */}
      <div className="bg-blues h-auto rounded-lg mt-10 pb-6 mx-3">
        <h1 className="bg-[#F5CC2C] mx-24 text-center text-white font-bold tracking-wider text-[20px] rounded">
          01
        </h1>

        <div className="px-3 leading-5 gray-50">
          <p className="pt-4 pb-4 ">
            The event is effective from now on. The discount can only be used
            once per address, per email address, per phone number and for the
            same payment method (debit/credit card/bank account) and IP address;
          </p>
          <span className="text-gray-500  ">
            If a member applies repeatedly, the company reserves the right to
            cancel or withdraw member bonuses.
          </span>
        </div>
      </div>

      <div className="bg-blues h-auto rounded-lg mt-10 pb-6 mx-3">
        <h1 className="bg-[#F5CC2C] mx-24 text-center text-white font-bold tracking-wider text-[20px] rounded">
          02
        </h1>

        <div className="px-3 leading-5">
          <p className="pt-4 pb-4 text-black">
            All offers are specially designed for players.
          </p>
          <span className="text-gray-500  ">
            If any group or individual is found to be dishonestly withdrawing
            bonuses or threatening or abusing company offers, the company
            reserves the right to freeze or cancel the account and account
            balance of that group or individual.
          </span>
        </div>
      </div>

      <div className="bg-blues h-auto rounded-lg mt-10 pb-6 mx-3">
        <h1 className="bg-[#F5CC2C] mx-24 text-center text-white font-bold tracking-wider text-[20px] rounded">
          03
        </h1>

        <div className="px-3 leading-5">
          <p className="pt-4 pb-4 text-black">
            The platform reserves the right of final outcome of this event;
          </p>
          <span className="text-gray-500  ">
            and the right to modify or terminate the campaign without prior
            notice; these terms apply to all offers.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityRules;
