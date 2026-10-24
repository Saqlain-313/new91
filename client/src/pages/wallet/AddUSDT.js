import { useEffect, useState } from "react";
import { AiOutlineDown, AiOutlineExclamationCircle } from "react-icons/ai";
import { MdDashboard } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import CustomeNavbar from "../../components/CustomeNavbar";
import FilterName from "../../components/FilterName";
import { addusdt } from "../../store/reducer/userReducer";

const AddUSDT = () => {
  const [alerts, setAlerts] = useState(false);
  const [successMessage, setsuccessMessage] = useState("");
  const [open, setOpne] = useState(false);
  const navigate = useNavigate();

  const [state, setState] = useState({
    sdt: "",
    remarkType: "",
  });

  const dispatch = useDispatch();

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    dispatch(addusdt(state)).then((res) => {
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

  const items = [{ name: "TRC", icon: <MdDashboard /> }];

  const handleFilterChange = (name) => {
    console.log("Selected Active Name:", name);
    setState({ ...state, name_bank: name });
    setOpne(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <CustomeNavbar name="Add USDT Address" />
      <div className="container-section">
        {/* Alert */}
        <div className="flex items-center p-1 px-3 rounded-full nav-bg mt-2">
          <AiOutlineExclamationCircle className="text-red-400 text-lg" />
          <p className="text-sm ms-2 leading-4 text-red-400">
            To ensure the safety of your funds, please link your wallet
          </p>
        </div>

        {/* Dropdown Input for Main Network */}
        <div className="mt-7 relative">
          <div className="flex items-center">
            <svg className="svg-icon icon-usdt1 icon icon">
              <use xlinkHref="#icon-usdt1" />
            </svg>
            <p className="text-sm text-whites ms-2">Select main network</p>
          </div>

          <div
            onClick={handleTogle}
            className="w-full mt-2 nav-bg text-whites cursor-pointer flex justify-between items-center rounded-md p-2 ps-6 focus:border focus:outline-none placeholder:text-sm placeholder:text-slate-500"
          >
            <span>{state.name_bank || "Select Network"}</span>
            <AiOutlineDown className="text-white text-sm me-2" />
          </div>

          {open && (
            <div className="absolute w-full z-30 mt-2">
              <FilterName
                items={items}
                onActiveChange={handleFilterChange}
                openAll={open}
                setOpenAll={setOpne}
              />
            </div>
          )}
        </div>

        {/* USDT Address */}
        <div className="mt-7">
          <div className="flex">
            <svg className="svg-icon icon-usdt2 icon icon">
              <use xlinkHref="#icon-usdt2" />
            </svg>
            <p className="text-sm text-whites ms-2">USDT Address</p>
          </div>
          <input
            type="text"
            className="w-full mt-2 nav-bg rounded-md p-2 focus:border-slate-700 ps-6 focus:border focus:outline-none placeholder:text-sm placeholder:text-slate-500"
            placeholder="Please enter the USDT address"
            name="sdt"
            onChange={inputHandle}
            value={state.sdt}
          />
        </div>

        {/* Address Alias */}
        <div className="mt-7">
          <div className="flex">
            <svg className="svg-icon icon-usdt3 icon icon">
              <use xlinkHref="#icon-usdt3" />
            </svg>
            <p className="text-sm text-whites ms-2">Address Alias</p>
          </div>
          <input
            type="text"
            className="w-full mt-2 nav-bg rounded-md p-2 focus:border-slate-700 ps-6 focus:border focus:outline-none placeholder:text-sm placeholder:text-slate-500"
            placeholder="Please enter a remark of the withdrawal address"
            name="remarkType"
            onChange={inputHandle}
            value={state.remarkType}
          />
        </div>

        {/* Save Button */}
        <button
          className={
            state?.sdt?.length > 0
              ? "blue-linear text-black w-full rounded-full p-2 mt-14"
              : "bg-[#454456] text-black w-full rounded-full p-2 mt-14"
          }
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>

      {/* Success Popup */}
      <div className={`place-bet-popup ${alerts ? "active" : ""}`}>
        <div className="text-sm">{successMessage}</div>
      </div>
    </>
  );
};

export default AddUSDT;
