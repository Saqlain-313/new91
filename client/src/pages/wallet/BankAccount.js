import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { withdrawalHistory, getBank } from "../../store/reducer/userReducer";
import { userDetail } from "../../store/reducer/authReducer";
import CustomeNavbar from "../../components/CustomeNavbar";

import { FaCheckCircle } from "react-icons/fa";
import { BsPlusSquareDotted } from "react-icons/bs";

const BankAccount = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { addBankData, withdrawHistoryData } = useSelector((state) => state.user);

  const user = Array.isArray(userInfo) ? userInfo[0] : userInfo;

  const [remainingWithdrawals, setRemainingWithdrawals] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getBank());
    dispatch(userDetail());
    dispatch(withdrawalHistory());
    window.scrollTo(0, 0);
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(withdrawHistoryData)) {
      const today = new Date().toISOString().split("T")[0];
      const successfulToday = withdrawHistoryData.filter((item) => {
        const itemDate = new Date(item.today).toISOString().split("T")[0];
        return item.status === 1 && itemDate === today;
      });
      setRemainingWithdrawals(3 - successfulToday.length);
    }
  }, [withdrawHistoryData]);

  const maskAccountNumber = (num) => {
    if (!num) return "";
    const prefix = num.slice(0, 6);
    const suffix = num.slice(-3);
    return `${prefix}****${suffix}`;
  };

  return (
    <div className="bg-[#f0f0f0] text-white font-sans">
      <CustomeNavbar name="Bank Account" />

      {/* Bank Detail Card */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-md shadow-md overflow-hidden">
          <div className="h-8 blue-linear" />
          <div className="p-2 space-y-1 text-sm">
            <div className="flex justify-between bg-[#f0f0f0] p-2 text-[#788ea4]">
              <span>Bank name</span>
              <span className="text-black font-medium">
                {addBankData?.name_bank || "India Post Payments Bank"}
              </span>
            </div>
            <div className="flex justify-between bg-[#f0f0f0] p-2 text-[#788ea4]">
              <span>Account number</span>
              <span className="text-black font-medium">
                {maskAccountNumber(addBankData?.stk)}
              </span>
            </div>
            <div className="flex justify-between bg-[#f0f0f0] p-2 text-[#788ea4]">
              <span>Phone number</span>
              <span className="text-black font-medium">
                {addBankData?.phone ? addBankData.phone.slice(0, 5) + "****" : "Not Available"}
              </span>
            </div>
          </div>

          <div className="flex items-center px-4 pb-3  ">
            <FaCheckCircle className="text-green-500 mr-2" />
            <span className="text-sm font-medium text-black">Selected</span>
          </div>
        </div>
      </div>

      {/* Add Bank Option */}
      <Link to="/wallet/Withdraw/AddBankCard">
      <div className="px-4 mt-5">
        <div className="flex flex-col items-center justify-center  p-4 rounded-md cursor-pointer bg-white transition">
          <BsPlusSquareDotted className="h-10 text-black w-10 mb-3" />
          <span className="text-sm text-black font-medium">Add a bank account number</span>
        </div>
      </div>
      </Link>
    </div>
  );
};

export default BankAccount;
