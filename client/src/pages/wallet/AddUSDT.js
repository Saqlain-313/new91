import React, { useEffect, useState } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { MdDashboard } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { addusdt } from "../../store/reducer/userReducer";
import CustomeNavbar from "../../components/CustomeNavbar";
import { useNavigate } from "react-router-dom";
import FilterName from "../../components/FilterName";

const AddUSDT = () => {
  const [alerts, setAlerts] = useState(false);
  const [successMessage, setsuccessMessage] = useState("");
  const [open, setOpne] = useState(false);
  const navigate = useNavigate();
  const [state, setState] = useState({
    sdt: "",
    remarkType: ""
  });

  const handleRemarkChange = (e) => {
    const input = e.target.value;
    const words = input.trim().split(/\s+/);
    
    // If words exceed 50, truncate to first 50 words
    if (words.length > 50) {
      const truncated = words.slice(0, 50).join(" ");
      setState({
        ...state,
        remarkType: truncated
      });
    } else {
      setState({
        ...state,
        remarkType: input
      });
    }
  };

  const inputHandle = (e) => {
    if (e.target.name === "remarkType") {
      handleRemarkChange(e);
    } else {
      // No limit for USDT Address
      setState({
        ...state,
        [e.target.name]: e.target.value,
      });
    }
  };

  const dispatch = useDispatch();
  const handleSubmit = async () => {
    // Ensure remarkType doesn't exceed 50 words before submission
    const words = state.remarkType.trim().split(/\s+/);
    const finalRemark = words.slice(0, 50).join(" ");
    
    dispatch(addusdt({
      ...state,
      remarkType: finalRemark
    })).then((res) => {
      setAlerts(true);
      setsuccessMessage(res.payload.message);
      setTimeout(() => {
        if (res.payload.status) {
          navigate("/wallet/Withdraw");
        }
        setsuccessMessage("");
        setAlerts(false);
      }, 2000);
    });
  };

  const handleTogle = () => {
    setOpne(!open);
  };

  const items = [
    { name: "TRC20", icon: <MdDashboard /> },
  ];

  const handleFilterChange = (name) => {
    console.log('Selected Active Name:', name);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Function to count words
  const countWords = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  return (
    <>
      <CustomeNavbar name="Add USDT Address" />
      <div className="container-section">
        <div className="flex items-center p-1 px-3 rounded-full bg-body mt-2">
          <span>
            <AiOutlineExclamationCircle className="color-red-200 text-lg" />
          </span>
          <p className="text-sm ms-2 leading-4 color-red-200">
            To ensure the safety of your founds, please link your wallet
          </p>
        </div>

        <FilterName
          items={items}
          onActiveChange={handleFilterChange}
          openAll={open}
          setOpenAll={setOpne}
        />

        <div className="mt-10">
          <div className="flex ">
            <span>
              <svg data-v-24736190 className="svg-icon icon-usdt1 icon icon"><use xlinkHref="#icon-usdt1" /></svg>
            </span>
            <p className="text-base text-whites">Select main network</p>
          </div>
          <input
            type="text"
            className="w-full mt-2 bg-body text-whites white-color rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none cursor-pointer placeholder:text-base placeholder:text-slate-500"
            placeholder="TRC20"
            name="name_bank"
            value="TRC20"
            readOnly
            onClick={handleTogle}
          />
        </div>

        <div className='mt-10'>
          <div className='flex '>
            <span>
              <svg data-v-24736190 className="svg-icon icon-usdt2 icon icon"><use xlinkHref="#icon-usdt2" /></svg>
            </span>
            <p className='text-base text-whites'>USDT Address</p>
          </div>
          <input
            type="text"
            className='w-full mt-2 bg-body rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none placeholder:text-base placeholder:text-slate-500'
            placeholder="Please enter the USDT address"
            name="sdt"
            onChange={inputHandle}
            value={state.sdt}
          />
        </div>

        <div className="mt-10">
          <div className="flex ">
            <span>
              <svg data-v-24736190 className="svg-icon icon-usdt3 icon icon"><use xlinkHref="#icon-usdt3" /></svg>
            </span>
            <p className="text-base text-whites">Address Alias </p>
          </div>
          <input
            type="text"
            className="w-full mt-2 bg-body rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none placeholder:text-base placeholder:text-slate-500"
            placeholder="Please enter a remark of the withdrawal address (max 50 words)"
            name="remarkType"
            onChange={inputHandle}
            value={state.remarkType}
          />
          {/* <p className="text-xs text-gray-500 mt-1">
            {countWords(state.remarkType)}/50 words
            {countWords(state.remarkType) >= 50 && (
              <span className="text-red-500 ml-2">Maximum 50 words reached</span>
            )}
          </p> */}
        </div>

        <button
          className={state?.sdt?.length > 0 ? "blue-linear text-lg text-white w-full rounded-full p-1 mt-20" : "bg-[#cacada] text-white text-lg w-full rounded-full p-1 mt-20"}
          onClick={handleSubmit}
          disabled={!state.sdt}
        >
          Save
        </button>
      </div>

      <div className={`place-bet-popup ${alerts ? "active" : ""}`}>
        <div className="text-base">{successMessage} </div>
      </div>
    </>
  );
};

export default AddUSDT;