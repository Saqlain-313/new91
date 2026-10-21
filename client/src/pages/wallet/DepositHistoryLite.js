import Cookies from "js-cookie"; // <--- Add this import statement
import { useEffect, useState } from "react";
import { PiCopySimpleBold } from "react-icons/pi";
import { RiFileCopy2Fill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CopyCopmponent from "../../components/CopyCopmponent";
import { rechargeList } from "../../store/reducer/userReducer";

const DepositHistoryLite = () => {
  const { rechargelistData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [copyPopup, setCopyPopup] = useState(false);
  const navigate = useNavigate();

  const copyToClipCode = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopyPopup(true);
        setTimeout(() => {
          setCopyPopup(false);
        }, 1500);
      })
      .catch((err) => {
        console.error("Failed to copy the text: ", err);
      });
  };

  useEffect(() => {
    dispatch(rechargeList());
    window.scrollTo(0, 0);
  }, [dispatch]);

  // Take only the first 5 items from the recharge list
  const limitedData = rechargelistData?.recharge?.slice(0, 5);

  const handleViewMore = () => {
    navigate("/wallet/RechargeHistory"); // Redirect to the main recharge history page
  };

  return (
    <>
      <div className="flex items-start justify-start mt-5 gap-2 ml-5">
        <RiFileCopy2Fill /> Deposit History
      </div>
      <div className="container-section mt-2">
        {limitedData?.length > 0 ? (
          limitedData.map((item, i) => (
            <div className="nav-bg rounded-md pb-7 mb-4 p-2" key={i}>
              <div className="flex justify-between items-center px-2 text-sm py-1 rounded-sm sky-border border-b">
                <span className="fs-sm font-medium bg-green-500 p-2 px-4 rounded-md">
                  Deposit
                </span>
                <span
                  className={`text-sm font-medium p-1 rounded ${
                    item.status === 0
                      ? "text-blue-400 font-semibold"
                      : item.status === 1
                        ? "text-green-500 font-semibold"
                        : "text-red-500 font-semibold"
                  }`}
                >
                  {item.status === 0
                    ? "To Be Paid"
                    : item.status === 1
                      ? "Succeed"
                      : "Failed"}
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center gray-text text-sm px-2">
                <span className="text-sm font-medium">Balance</span>
                <span className="text-sm font-medium color-yellow-200">
                  {item.type === "USDT"
                    ? ` $${(Number(item?.money) / 93).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : `₹${Number(item?.money).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </span>
              </div>

              <div className="flex justify-between items-center mt-3 gray-text text-sm px-2">
                <span className="text-sm font-medium">Type</span>
                <span className="text-sm font-medium">{item.type}</span>
              </div>
              <div className="flex justify-between items-center mt-3 gray-text text-sm px-2">
                <span className="text-sm font-medium">Time</span>
                <span className="fs-sm font-medium">{item.today}</span>
              </div>
              <div className="flex justify-between items-center mt-3 gray-text text-sm px-2">
                <span className="text-sm font-medium">Order number</span>
                <span className="text-sm font-medium flex items-center">
                  {item.id_order}{" "}
                  <PiCopySimpleBold
                    className="ms-1 mt-[3px]"
                    onClick={() => copyToClipCode(item.id_order)}
                  />
                </span>
              </div>
              {item.status === 0 && (
                <Link
                  to={`https://h5.workorder.support.1xclube.com/deposite?token=${Cookies.get(
                    // This line was causing the error
                    "auth",
                  )}`}
                  className="blue-linear w-full rounded-full text-black py-1 mt-3 text-lg font-semibold flex justify-center items-center"
                >
                  Submit Receipt
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-400">
            No deposit records found.
          </div>
        )}

        {limitedData?.length > 0 && (
          <button
            onClick={handleViewMore}
            className="blue-linear w-full rounded-full text-black py-2 mt-5 text-lg font-semibold flex justify-center items-center"
          >
            All History
          </button>
        )}
      </div>

      <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />
    </>
  );
};

export default DepositHistoryLite;
