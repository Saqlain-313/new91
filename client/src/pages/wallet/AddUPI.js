import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomeNavbar from "../../components/CustomeNavbar";
import { useDispatch, useSelector } from "react-redux";
import { upi } from "../../store/reducer/userReducer";

const AddUPI = () => {
  const [upiName, setUpiName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [confirmUpiId, setConfirmUpiId] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loader } = useSelector((state) => state.user);

  const handleSave = async () => {
    if (!upiName || !upiId || !confirmUpiId) {
      alert("Please fill all fields");
      return;
    }
    if (upiId !== confirmUpiId) {
      alert("UPI IDs do not match");
      return;
    }

    const upiDataObj = { upi_name: upiName, upi_id: upiId };

    try {
      // Dispatch async thunk and wait for API response
      const result = await dispatch(upi(upiDataObj)).unwrap();

      // Save actual UPI object
      // If API sends UPI details inside 'datas', use result.datas
      localStorage.setItem("upiData", JSON.stringify(result.datas || result));

      // Redirect to UPI page
      navigate("/wallet/Withdraw/Upi");
    } catch (err) {
      alert(err?.errorMessage || "Something went wrong");
    }
  };

  return (
    <div className="bgs-body min-h-screen">
      <CustomeNavbar name="Payment method" bgClass="bg-light" />

      {/* <h2 className="text-center text-xl font-bold text-white">
        Payment method - UPI
      </h2> */}
      <div className="pb-3 px-4 w-full flex">
        <img src="https://i.ibb.co/fzBy6hcq/upi-3f9883de.webp" alt="" className="w-24"/>
      <span className="text-black font-medium text-2xl">Information UPI</span>
      </div>
      {/* UPI Name */}
      <div className="mb-4 px-4">
        <label className="block text-base text-gray-600">UPI Name</label>
        <input
          type="text"
          placeholder="Please enter UPI name"
          value={upiName}
          onChange={(e) => setUpiName(e.target.value)}
          className="w-full p-2 mt-1 rounded bg-light focus:outline-none"
        />
      </div>

      {/* UPI ID */}
      <div className="mb-4 px-4">
        <label className="block text-base text-gray-600">UPI ID</label>
        <input
          type="text"
          placeholder="Please enter your UPI ID"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          className="w-full p-2 mt-1 rounded bg-light text-white focus:outline-none"
        />
      </div>

      {/* Confirm UPI ID */}
      <div className="mb-4 px-4">
        <label className="block text-base text-gray-600">Confirm UPI ID</label>
        <input
          type="text"
          placeholder="Please enter your UPI ID again"
          value={confirmUpiId}
          onChange={(e) => setConfirmUpiId(e.target.value)}
          className="w-full p-2 mt-1 rounded bg-light text-white focus:outline-none"
        />
      </div>

      {/* Save Button */}
      <div className="mx-4 mt-44">
        <button
          onClick={handleSave}
          disabled={loader}
          className="w-full py-2 rounded-lg nav-bg text-black font-bold"
        >
          {loader ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default AddUPI;
