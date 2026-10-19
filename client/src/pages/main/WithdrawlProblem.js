import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

import { useDispatch, useSelector } from "react-redux";
import CustomeNavbar from "../../components/CustomeNavbar";
import {
  userProblem,
  userProblemget,
} from "../../store/reducer/activityReducer";

const WithdrawlProblem = () => {
  const [showModal, setShowModal] = useState(true);
  const { bannergetData } = useSelector((state) => state.user);
  const { userProblemData } = useSelector((state) => state.activity);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const dispatch = useDispatch();
  const [selectedIssue, setSelectedIssue] = useState("");
  const [alerts, setAlerts] = useState(false);
  const [messages, setMessage] = useState("");
  const [formData, setFormData] = useState({
    gameId: "",
    amount: "",
    orderNo: "",
    utr: "",
    issue: null,
    // bankStatement: null,
  });

  const [progressForm, setProgressForm] = useState({
    id: "",
    issue: "",
  });

  const handleIssueChange = (event) => {
    setSelectedIssue(event.target.value);
    setFormData({
      gameId: "",
      amount: "",
      orderNo: "",
      utr: "",
      issue: "",
      // bankStatement: null,
    });

    setFormData((prevData) => ({
      ...prevData, // Spread the previous form data
      issue: selectedIssue, // Update the 'issue' field
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleProgressFormChange = (e) => {
    const { name, value } = e.target;
    setProgressForm((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // alert("Data submitted");

    dispatch(userProblem(formData)).then((res) => {
      setAlerts(true);
      setMessage(res.payload.message);

      setTimeout(() => {
        setAlerts(false);
      }, 2000);
      setTimeout(() => {
        setMessage("");
      }, 3000);
    });
  };

  const handleCheck = () => {
    dispatch(userProblemget(progressForm)).then((res) => {
      if (res.payload) {
        setShowProgressModal(false);
      }
    });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const toggleProgressModal = () => {
    setShowProgressModal(!showProgressModal);
  };
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData, // Spread the previous form data
      issue: selectedIssue, // Update the 'issue' field
    }));
  }, [selectedIssue, messages]);
  return (
    <>
      <CustomeNavbar name="Customer service" />

      <div className="m-0 p-0">
        {showModal && (
          <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50 p-2">
            <div className="bg-light rounded-sm w-full max-w-lg p-6 relative text-center">
              <h2 className="text-xl font-semibold mb-4 text-whites">Notice</h2>
              <p className="mb-4 font-semibold text-whites">
                After submitting your question, you don’t need to worry, our
                specialists will handle it for you one by one!
                <br />
                <br />
                Select the problem you want to solve and fill in the information
                as requested! Then click submit application and wait for our
                customer service specialists to handle it for you! You can click
                the verification question progress button, enter the ID account,
                then select the question list, and finally press the search
                button. The status question will show that the customer service
                department will reply to you!
              </p>
              <p className="text-red-500 font-semibold">
                Please do not submit orders repeatedly to avoid affecting the
                progress of your inquiry.
              </p>
              <p className="text-red-500 font-semibold text-center">
                कृपया अपनी पूछताछ की प्रगति को प्रभावित करने से बचने के लिए
                बार-बार आदेश प्रस्तुत न करें।
              </p>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:"
                onClick={closeModal}
              >
                <AiOutlineClose size={24} />
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center p-4">
          <div className=" mt-5 rounded-sm-lg w-full max-w-md">
            <img
              src={bannergetData?.gameall?.logo}
              alt="Logo"
              className="mx-auto mb-4 h-[100px] w-[100px]"
            />
            <h1 className="text-center text-2xl font-semibold mb-4 text-whites">
              Customer Service
            </h1>

            <form onSubmit={handleSubmit}>
              <label className="text-whites block text-left mb-2 text-whites  font-semibold">
                * Submit Issue:
              </label>
              <select
                value={selectedIssue}
                onChange={handleIssueChange}
                className="text-sm bg-light gray-50 w-full border border-color-slat rounded-sm px-3 py-2 mb-4 gray-50"
              >
                <option value="" className="gray-50">
                  Please select
                </option>
                <option value="Deposit Not Received">
                  Deposit Not Received
                </option>
                <option value="Withdrawal Pending">Withdrawal Pending</option>
                <option value="Withdrawal Successful Not Received Money">
                  Withdrawal Successful Not Received Money
                </option>
              </select>

              {selectedIssue && (
                <>
                  <label className="gray-50 block text-left mb-2  font-semibold">
                    * Chennai91 Games ID:
                  </label>
                  <input
                    type="text"
                    name="gameId"
                    value={formData.gameId}
                    onChange={handleInputChange}
                    className="w-full mt-2 bg-light border border-slate-900 rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500 placeholder:font-bold"
                    placeholder="Please input"
                    required
                  />

                  <label className="gray-50 block text-left mb-2  font-semibold">
                    * Amount:
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full mt-2 bg-light border border-slate-900 rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500 placeholder:font-bold"
                    placeholder="Please input"
                    required
                  />

                  {selectedIssue === "Deposit Not Received" && (
                    <>
                      <label className="gray-50 block text-left mb-2  font-semibold">
                        * UTR number:
                      </label>
                      <input
                        type="text"
                        name="utr"
                        value={formData.utr}
                        onChange={handleInputChange}
                        className="w-full mt-2 bg-light border border-slate-900 rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500 placeholder:font-bold"
                        placeholder="Please input"
                        required
                      />

                      {/* <label className="gray-50 block text-left mb-2  font-semibold">* Deposit proof receipt detail:</label> */}
                      {/* <input
                      type="file"
                      name="issue"
                      onChange={handleFileChange}
                      className="w-full mt-2 bg-light border border-slate-900 rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500 placeholder:font-bold"
                      required
                    /> */}
                    </>
                  )}

                  {selectedIssue === "Withdrawal Pending" && (
                    <>
                      <label className="gray-50 block text-left mb-2  font-semibold">
                        * Order number:
                      </label>
                      <input
                        type="text"
                        name="orderNo"
                        value={formData.orderNo}
                        onChange={handleInputChange}
                        className="w-full mt-2 bg-light border border-slate-900 rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500 placeholder:font-bold"
                        placeholder="Please input"
                        required
                      />
                    </>
                  )}

                  {selectedIssue ===
                    "Withdrawal Successful Not Received Money" && (
                    <>
                      <label className="gray-50 block text-left mb-2  font-semibold">
                        * Order number:
                      </label>
                      <input
                        type="text"
                        name="orderNo"
                        value={formData.orderNo}
                        onChange={handleInputChange}
                        className="w-full mt-2 bg-light border border-slate-900 rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500 placeholder:font-bold"
                        placeholder="Please input"
                        required
                      />

                      {/* <label className="gray-50 block text-left mb-2  font-semibold">
                      * Provide Video Record of Bank Statement:
                    </label>
                    <input
                      type="file"
                      name="bankStatement"
                      onChange={handleFileChange}
                      className="w-full mt-2 bg-light border border-slate-900 rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500 placeholder:font-bold"
                      required
                    /> */}
                    </>
                  )}
                </>
              )}

              <button
                type="submit"
                className="w-full bgs-blue-500 cursor-pointer text-white py-2 rounded-sm mb-4 mt-5"
                disabled={!selectedIssue}
              >
                Submit Issue
              </button>
            </form>

            <button
              type="button"
              className="w-full border border-color-slat bg-light py-2 rounded-sm mb-4 gray-50"
              onClick={toggleProgressModal}
            >
              Verify Issue Progress
            </button>

            <button
              type="button"
              className="w-full border border-color-slat bg-light py-2 rounded-sm gray-50"
            >
              Other Problem
            </button>
          </div>
        </div>

        {showProgressModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 p-2">
            <div className=" bg-popup-nav rounded-sm w-full max-w-md p-6 relative text-center">
              <h2 className="text-xl font-semibold mb-4">
                Verify Issue Progress
              </h2>
              <form>
                <label className="gray-50 block text-left mb-2  font-semibold">
                  * Issue ID:
                </label>
                <input
                  type="text"
                  name="id"
                  value={progressForm.id}
                  onChange={handleProgressFormChange}
                  className="w-full mt-2 bg-light border border-slate-900 rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500 placeholder:font-bold"
                  placeholder="Please input"
                  required
                />

                <label className="gray-50 block text-left mb-2  font-semibold">
                  * Select Problem:
                </label>
                <select
                  name="issue"
                  value={progressForm.issue}
                  onChange={handleProgressFormChange}
                  className="w-full mt-2 gray-50 text-sm bg-light border border-slate-900 rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500 placeholder:font-bold"
                  required
                >
                  <option value="">Please select</option>
                  <option value="Deposit Not Received">
                    Deposit Not Received
                  </option>
                  <option value="Withdrawal Pending">Withdrawal Pending</option>
                  <option value="Withdrawal Successful Not Received Money">
                    Withdrawal Successful Not Received Money
                  </option>
                </select>
              </form>
              <button
                type="submit"
                className="w-full mt-5 bg-blue-500 text-white py-2 rounded-sm mb-4"
                onClick={handleCheck}
              >
                Search
              </button>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:"
                onClick={toggleProgressModal}
              >
                <AiOutlineClose size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="container-section">
        {Array.isArray(userProblemData) &&
          userProblemData?.map((item, i) => (
            <div className="bg-light rounded-md mt-3 pb-7 px-3 pt-1" key={i}>
              <div className="mt-3 flex justify-between items-center gray-100 text-sm border-b border-[--grey-200]">
                <span className="text-sm font-medium">GAME ID:</span>
                <span className="text-sm font-medium ">{item?.user_id}</span>
              </div>
              <div className="flex justify-between items-center mt-3 gray-100 text-sm">
                <span className="text-sm font-medium">Amount</span>
                <span className="text-sm font-medium flex items-center">
                  {item.amount}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 gray-100 text-sm">
                <span className="text-sm font-medium">Problem</span>
                <span className="text-sm font-medium flex items-center">
                  {item.issue}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 gray-100 text-sm">
                <span className="text-sm font-medium">Status</span>
                <span
                  className={`fs-sm font-medium  ${
                    item.status === 0
                      ? "color-yellow-200"
                      : item.status === 1
                        ? "color-green"
                        : "color-red-200"
                  }`}
                >
                  {item.status === 0
                    ? "Pending"
                    : item.status === 1
                      ? "Succeed"
                      : "Failed"}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 gray-100 text-sm">
                <span className="text-sm font-medium">Remark</span>
                <span className="text-sm font-medium flex items-center">
                  {item.remark}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 gray-100 text-sm">
                <span className="text-sm font-medium">Date</span>
                <span className="text-sm font-medium flex items-center">
                  {item.today}
                </span>
              </div>
            </div>
          ))}
      </div>

      <div className={`place-bet-popup ${alerts ? "active" : ""}`}>
        <div className="text-sm">{messages} </div>
      </div>
    </>
  );
};

export default WithdrawlProblem;
