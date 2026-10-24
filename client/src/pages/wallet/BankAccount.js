import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CustomeNavbar from "../../components/CustomeNavbar";
import { userDetail } from "../../store/reducer/authReducer";
import { getBank, withdrawalHistory } from "../../store/reducer/userReducer";

import { BsPlusSquareDotted } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";

const BankAccount = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { addBankData, withdrawHistoryData } = useSelector(
    (state) => state.user,
  );

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
    <div className="nav-bg text-white font-sans">
      <CustomeNavbar name="Bank Account" />

      {/* Bank Detail Card */}
      <div className="px-4 mt-2">
        <div className="bg-[#1e2633] rounded-md shadow-md overflow-hidden">
          <div className="h-8 blue-linear" />
          <div className="p-2 space-y-1 text-sm">
            <div className="flex justify-between nav-bg p-2 text-gray-400">
              <span>Bank name</span>
              <span className="text-white font-medium">
                {addBankData?.name_bank || "India Post Payments Bank"}
              </span>
            </div>
            <div className="flex justify-between nav-bg p-2 text-gray-400">
              <span>Account number</span>
              <span className="text-white font-medium">
                {maskAccountNumber(addBankData?.stk)}
              </span>
            </div>
            <div className="flex justify-between nav-bg p-2 text-gray-400">
              <span>Phone number</span>
              <span className="text-white font-medium">
                {addBankData?.phone
                  ? addBankData.phone.slice(0, 5) + "****"
                  : "Not Available"}
              </span>
            </div>
          </div>

          <div className="flex items-center px-4 pb-3  ">
            <FaCheckCircle className="text-green-500 mr-2" />
            <span className="text-sm font-medium text-white">Selected</span>
          </div>
        </div>
      </div>

      {/* Add Bank Option */}
      <Link to="/wallet/Withdraw/AddBankCard">
        <div className="px-4 mt-5">
          <div className="flex flex-col items-center justify-center  p-4 rounded-md cursor-pointer bg-[#1e2633] transition">
            <BsPlusSquareDotted className="h-10 w-10 mb-3" />
            <span className="text-sm font-medium">
              Add a bank account number
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BankAccount;
