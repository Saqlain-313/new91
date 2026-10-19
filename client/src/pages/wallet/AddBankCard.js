import React, { useEffect, useState } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { BsBank2 } from "react-icons/bs";
import { FaMobileAlt, FaUser } from "react-icons/fa";
import { HiKey } from "react-icons/hi";
import { MdOutlineCreditCard, MdVerifiedUser } from "react-icons/md";

import { useDispatch, useSelector } from "react-redux";
import { addBank } from "../../store/reducer/userReducer";
import CustomeNavbar from "../../components/CustomeNavbar";
import { useNavigate } from "react-router-dom";
import { otpSend } from "../../store/reducer/authReducer";
const bankData = [
  "Bank of Baroda",
  "Union Bank of India",
  "Central Bank of India",
  "Yes Bank",
  "HDFC Bank",
  "Karnataka Bank",
  "Standard Chartered Bank",
  "IDBI Bank",
  "Bank of India",
  "Punjab National Bank",
  "ICICI Bank",
  "Canara Bank",
  "Kotak Mahindra Bank",
  "State Bank of India",
  "Indian Bank",
  "Axis Bank",
  "FEDERAL BANK",
  "Syndicate Bank",
  "Citibank India",
  "Indian Overseas Bank",
  "IDFC Bank",
  "Bandhan Bank",
  "Indusind Bank",
  "Equitas Bank",
  "India Post Payments Bank",
  "Corporation Bank",
  "City Union Bank",
  "PYTM PAYMENTS BANK",
  "Karur Vysya Bank",
  "Tamilnad Mercantile Bank",
  "Allahabad Bank",
  "varachha co-operative bank",
  "Meghalaya Rural Bank",
  "AU Small Finance Bank",
  "Lakshmi Vilas Bank",
  "South Indian Bank",
  "Bassein Catholic Co-Operative Bank",
  "Airtel Payment Bank",
  "State Bank of Hyderabad",
  "GP Parsik Bank",
  "Kerala Gramin Bank",
  "RBL Bank",
  "Dhanlaxmi Bank",
  "TJSB Bank",
  "Purvanchal Bank",
  "Sarva Haryana Gramin Bank",
  "Ahmedabad District Co-Operative Bank",
  "Saraswat Cooperative Bank",
  "Telangana Grameena Bank",
  "Andhra Pragathi Grameena Bank",
  "Rajasthan Marudhara Gramin Bank",
  "Abhyudaya Bank",
  "Capital Small Finance Bank",
  "Mizoram Rural Bank",
  "Andhra Pradesh Grameena Vikas Bank",
  "Karnataka Vikas Grameena Bank",
  "The Ahmedabad Merchantile Co-Op Bank Ltd",
  "Madhya Bihar Gramin Bank",
  "NSDL Payments Bank",
  "ESAF Small Finance Bank",
  "Himachal Pradesh State Cooperative Bank",
  "Maharashtra State Cooperative Bank",
  "Oriental Bank of Commerce",
  "Nainital Bank",
  "Jharkhand Rajya Gramin Bank",
  "jio payments bank",
  "MAHARASHTRA GRAMIN BANK",
  "AIRTEL PAYMENTS BANK",
  "Uttarakhand Gramin Bank",
  "Equitas Small Finance Bank",
  "Himachal Pradesh Gramin Bank",
  "Krishna District Co-Operative Central Bank Ltd.",
  "RAJKOT NAGARIK SAHAKARI BANK LTD",
  "North East small financial bank",
  "Catholic syrian bank",
  "Fincare small finance bank",
  "Baroda Uttar Pradesh Gramin Bank",
  "Dhanalakshmi bank",
  "Cosmos Co-operative Bank Ltd",
  "Saurashtra gramin bank",
  "Baroda Rajasthan kshetriya gramin bank",
  "Suco Bank",
  "Jana small finance bank",
  "Dena Gujarat Gramin Bank",
  "Chaitanya Godavari Grameena Bank",
  "SVC BANK",
  "Bharat cooperative bank",
  "The Surat District Co-Op. Bank Ltd.",
  "USDT",
  "The Kalupur Commercial Co-operative Bank",
  "Prime co-operative Bank",
  "Tripura Gramin Bank",
  "Zila Sahakari Bank Ltd Bareilly",
  "ARYAVART Bank",
  "Development credit Bank",
  "Sarva UP Gramin Bank",
  "New India Co-Operative Bank",
  "NKGSB Co-operative Bank Ltd.",
  "Vijaya Bank",
  "United Bank of India",
  "State Bank of Bikaner And Jaipur",
  "Shri Janata Sahakari Bank LTD",
  "Rajgurunagar Sahakari Bank",
  "FEDERAL NEO BANK JUPITER",
  "CHHATTISGARH RAJYA GRAMIN BANK",
  "Apna Sahakari Bank",
  "GS Mahanagar Co-Op Bank Ltd",
  "Bangiya Gramin Vikash Bank",
  "Assam Gramin Vikash Bank",
  "Kangra Central Co-operative Bank Ltd",
  "Punjab Gramin Bank",
  "Assam gramin bikash bank",
  "Karnataka Gramin Bank",
  "SURYODAY SMALL FINANCE BANK LIMITED",
  "Utkarsh Small Finance Bank",
  "The Meghalaya Co-operative Apex Bank",
  "UTTAR BIHAR GRAMIN BANK",
  "STATE BANK OF TRAVANCORE",
  "SHIVALIK SMALL FIHANCE BANK",
  "DAKSHIN BIHIR GRAMIN BANK",
  "manipur rural bank",
  "State bank of patiala",
  "BARODA GUJARAT GRAMIN BANK",
  "The Gujarat State Co-operative Bank Limited",
  "vasai vikas sahakari",
  "paschim banga gramin bank",
  "VISHAPATNAM co-operative bank",
  "Samarth Sahakari Bank Ltd",
  "uttarbanga kshetriya gramin bank",
  "janata sahakari bank ltd",
  "the gayatri co-operative urban bank",
  "Jupiter Federal Bank",
  "ABHYUDAYA CO-OP. BANK LTD.",
  "J&K Grameen Bank",
  "Post Office Savings Bank",
  "SBM Bank India",
  "Bank of Maharashtra",
  "Jind Central Co-Op Bank",
  "PRATHAMA Up Gramin Bank",
  "State Bank of Mysore",
  "BARODA U.P BANK",
  "PURVANCHAL GRAMIN BANK",
  "The Varachha Co-operative Bank Ltd., Surat",
  "State Bank Of Mauritius Ltd",
  "Kallappanna Awade Janata Bank",
  "Jupiter Federal",
  "HIMACHAL PARDESH STATE COOPERATIVE BANK",
  "Pratham Bank",
  "Oisha Gramya Bank",
  "KDCC BANK",
  "The Hasti Coop Bank",
  "District Co-Operative Central Bank Ltd",
  "ODISHA GRAMYA BANK",
  "IDFC FIRST BANK LTD",
  "The Ahmedabad District Co-op Bank Ltd",
  "Tamil Nadu Grama Bank",
  "GAYATRI BANK",
  "GRAMIN BANK OF ARYAVART",
  "The Kalyan Janata Sahakari Bank Ltd",
  "Dombivli Nagari Sahakari Bank Ltd.",
  "UTKAL GRAMYA BANK",
  "Bihar Gramin Bank",
  "CATHOLIC SYRIAN BANK LTD",
  "Jalna Merchants Co-operative Bank",
  "THE RATNAKAR BANK LTD",
  "Zila sahkari bank",
  "NAGAR SAHKARI BANK LTD. MAHARAJGANJ",
  "Vananchal Gramin Bank",
  "Jammu Kashmir Bank",
  "Punjab Sind Bank",
  "Punjab dan Sind Bank",
  "Jammu and Kashmir Bank",
  "HARYANA BANK",
  "JILA SAHAKARI BANK",
  "BANASKANTHA DISTRICT CENTRAL CO-OP. BANK LTD",
  "The Rohtak Central Co-op. Bank Ltd",
  "ASSOCIATE CO-OP. BANK LTD",
  "suryoday small finance Bank",
  "Andhra Pragati grameena bank",
  "Federal Savings Bank",
  "the banaskantha mercantile bank",
  "SBI - KIOSK BANKING",
];

const AddBankCard = () => {
  // const { successMessage } = useSelector((state) => state.user);
  const [alerts, setAlerts] = useState(false);
  const [bank, setBank] = useState("Please Select a bank");
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpne] = useState(false);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [state, setState] = useState({
    name_bank: "",
    name_user: "",
    stk: "", ////account number
    ifsc: "", // ifsc code
    tinh: "", //phone number
    sdt: "0", //usdt
    otp: 123456,
  });

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const dispatch = useDispatch();
  const handleSubmit = async () => {
    dispatch(addBank(state)).then((res) => {
      setAlerts(true);
      setSuccessMessage(res.payload.message);
      setTimeout(() => {
        if (res.payload.status) {
          navigate("/wallet/Withdraw");
        }
        setAlerts(false);
      }, 2000);
    });
  };

  const handleTogle = () => {
    setOpne(!open);
  };

  const handleBanks = (item) => {
    setBank(item);
    setState({
      ...state,
      name_bank: item,
    });

    handleTogle();
  };

  // Filter bank names based on search term
  const filteredBanks = bankData.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // const handleOtp = async () => {
  //   dispatch(otpSend(state.tinh)).then((res) => {
  //     setSuccessMessage(res.payload.message);
  //     setAlerts(true);
  //     if (res.payload.status) {
  //       setCountdown(60);
  //     }
  //   });
  // };
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer); // Clean up
    }
  }, [countdown]);
  return (
    <>
      <CustomeNavbar name="Add Bank" />
      <div className="container-section">
        <div className="flex items-center p-1 px-3 rounded-full bg-body mt-2">
          <span>
            <AiOutlineExclamationCircle className="color-red-200 text-lg" />
          </span>
          <p className="text-sm ms-2 leading-4  color-red-200">
            To ensure the safety of your founds, please bind your bank account
          </p>
        </div>

        <div className="mt-7">
          <div className="flex ">
            <span>
              <BsBank2 className="text-blue text-lg mr-1" />
            </span>
            <p className="text-sm text-whites">Bank name</p>
          </div>
          <input
            type="text"
            className="w-full mt-2 blue-linear text-whites text-black rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none cursor-pointer   placeholder:text-sm placeholder:text-slate-500"
            placeholder="Please enter the bank name"
            name="name_bank"
            value={bank}
            onClick={handleTogle}
          />

          {open && (
            <div className="bank-option bg-body p-4">
              <input
                type="text"
                className="w-full mt-2 bg-body text-whites rounded-lg p-2 border focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none placeholder:text-sm placeholder:text-slate-500"
                placeholder="Search bank name"
                name="name_bank"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {filteredBanks.map((item) => (
                <p
                  key={item}
                  className="text-whites text-sm p-2 border-b border-zinc-700"
                  onClick={() => handleBanks(item)}
                >
                  {item}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="mt-7">
          <div className="flex ">
            <span>
              <FaUser className="text-blue text-lg mr-1" />
            </span>
            <p className="text-sm text-whites">Full recipient's name</p>
          </div>
          <input
            type="text"
            className="w-full mt-2 bg-body rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500"
            placeholder="Please enter the recipient's name"
            name="name_user"
            onChange={inputHandle}
            value={state.name_user}
          />
        </div>
        <div className="mt-7">
          <div className="flex ">
            <span>
              <MdOutlineCreditCard className="text-blue text-lg mr-1" />
            </span>
            <p className="text-sm text-whites">Bank account number</p>
          </div>
          <input
            type="number"
            className="w-full mt-2 bg-body rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500"
            placeholder="Please enter the recipient's account number"
            name="stk"
            onChange={inputHandle}
            value={state.stk}
          />
        </div>
        <div className="mt-7">
          <div className="flex ">
            <span>
              <FaMobileAlt className="text-blue text-lg mr-1" />
            </span>
            <p className="text-sm text-whites">Phone number</p>
          </div>
          <input
            type="number"
            className="w-full mt-2 bg-body rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500 placeholder:font-bold"
            placeholder="Please enter the recipient's phone number"
            name="tinh"
            onChange={inputHandle}
            value={state.tinh}
          />
        </div>
        <div className="mt-7">
          <div className="flex ">
            <span>
              <HiKey className="text-blue text-lg mr-1" />
            </span>
            <p className="text-sm text-whites">IFSC code</p>
          </div>
          <input
            type="text"
            className="w-full mt-2 bg-body rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500"
            placeholder="Please enter the recipient's ifsc code"
            name="ifsc"
            onChange={inputHandle}
            value={state.ifsc}
          />
        </div>
        {/* <div className="mt-4">
          <div className="flex items-center ">
            <span>
              <MdVerifiedUser className="color-l text-2xl" />
            </span>
            <label htmlFor="" className="font-medium ms-1 gray-50">
              Verification Code
            </label>
          </div>

          <div className="mt-3 flex justify-between relative">
            <input
              type="text"
              name="otp"
              onChange={inputHandle}
              value={state.otp}
              className="w-full  bg-body border border-[--bgbody] rounded-lg p-2 py-3 focus:[var(--grey-100)] ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-[var(--grey-200)]"
              placeholder="Please enter the confirmation code"
            />
            <span
              onClick={handleOtp}
              disabled={countdown > 0}
              type="submit"
              className="absolute blue-linear right-3 top-2 text-white cursor-pointer text-sm px-6 py-2 rounded-full"
            >
              {countdown > 0 ? `Wait ${countdown}s` : "Send"}
            </span>
          </div>
        </div> */}

        {/* <div className='mt-7'>
            <div className='flex '>
                <span><HiKey
                 className='text-blue text-lg mr-1' /></span>
                <p className='text-sm text-whites'>USDT Address</p>
            </div>
            <input type="text" className='w-full mt-2 bg-body border border-slate-300 rounded-md p-2 focus:border-slate-700 ps-6 flex items-center focus:border focus:outline-none  placeholder:text-sm placeholder:text-slate-500' placeholder="Please enter the recipient's usdt address" 
            name="sdt"
            onChange={inputHandle}
            value={state.sdt}
            />
        </div> */}

        <button
          className="blue-linear text-white w-full rounded-full p-2 mt-4"
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>

      <div className={`place-bet-popup ${alerts ? "active" : ""}`}>
        <div className="text-sm">{successMessage} </div>
      </div>
    </>
  );
};

export default AddBankCard;
