import { useState } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { BsBank2 } from "react-icons/bs";
import { FaMobileAlt, FaUser } from "react-icons/fa";
import { HiKey } from "react-icons/hi";
import { MdEmail, MdOutlineCreditCard } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CustomeNavbar from "../../components/CustomeNavbar";
import { addBank } from "../../store/reducer/userReducer";

// Bank list (aapke dusre code se)
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
  const { successMessage } = useSelector((state) => state.user);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedBankName, setSelectedBankName] = useState(
    "Please Select a bank",
  );
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [bankDetails, setBankDetails] = useState({
    name_bank: "",
    name_user: "",
    stk: "",
    email: "",
    tinh: "",
    ifsc: "",
    sdt: "0",
  });

  // Dropdown toggle
  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  // Bank select from inline list
  const handleBanks = (item) => {
    setSelectedBankName(item);
    setBankDetails((prev) => ({ ...prev, name_bank: item }));
    setSearchTerm("");
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "name_user" || name === "ifsc") {
      newValue = value.toUpperCase();
    }
    setBankDetails((prev) => ({ ...prev, [name]: newValue }));
  };

  const areAllFieldsFilled =
    selectedBankName !== "Please Select a bank" &&
    bankDetails.name_user.trim() !== "" &&
    bankDetails.stk.trim() !== "" &&
    bankDetails.tinh.trim() !== "" &&
    bankDetails.email.trim() !== "" &&
    bankDetails.ifsc.trim() !== "";

  const handleSubmit = async () => {
    if (!areAllFieldsFilled) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
      return;
    }
    try {
      const res = await dispatch(addBank(bankDetails));
      setShowAlert(true);
      setTimeout(() => {
        if (res.payload?.status) {
          navigate("/wallet/Withdraw");
        }
        setShowAlert(false);
      }, 2000);
    } catch (error) {
      console.error("Error adding bank:", error);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }
  };

  // Filter banks by search
  const filteredBanks = bankData.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <CustomeNavbar name="Add Bank" />

      <div
        className="container-section"
        style={{ fontFamily: '"Bahnschrift", sans-serif' }}
      >
        <div className="flex items-center p-1 px-3 rounded-full nav-bg mt-2">
          <AiOutlineExclamationCircle className="color-red-200 text-lg" />
          <p className="text-sm ms-2 leading-4 color-red-200">
            To ensure the safety of your funds, please bind your bank account
          </p>
        </div>

        {/* BANK NAME FIELD - INLINE DROPDOWN */}

        <div className="mt-7">
          <div className="flex items-center">
            <BsBank2 className="color-blue text-lg mr-2" />
            <p className="text-sm text-whites">Bank name</p>
          </div>

          {/* Dropdown trigger */}
          <div
            className={`w-full mt-2 rounded-md p-2 ps-6 flex items-center justify-between cursor-pointer transition-all duration-200 ${
              selectedBankName === "Please Select a bank"
                ? "blue-linear text-slate-800 font-medium" // Adjusted placeholder text color for visibility on blue-linear
                : "bg-[#171B34] text-whites"
            }`}
            onClick={handleToggle}
          >
            <div className="flex-1">
              {selectedBankName === "Please Select a bank" ? (
                <span className="text-sx text-slate-700">
                  {selectedBankName}
                </span>
              ) : (
                <span className="text-whites">{selectedBankName}</span>
              )}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-white transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Dropdown list with search - FIXED DARK THEME */}
          {open && (
            <div className="mt-2 bg-[#171B34] rounded-md p-3 max-h-64 overflow-y-auto border border-gray-600 shadow-xl custom-scrollbar">
              <input
                type="text"
                className="w-full bg-[#0F1222] text-whites rounded-lg p-2 border border-gray-700 focus:border-blue-500 ps-4 mb-2 focus:outline-none placeholder:text-sm placeholder:text-slate-500"
                placeholder="Search bank name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {filteredBanks.length > 0 ? (
                filteredBanks.map((item) => (
                  <p
                    key={item}
                    className="text-slate-200 text-sm p-2 border-b border-gray-700 cursor-pointer hover:bg-[#252A4A] hover:text-white transition-colors"
                    onClick={() => handleBanks(item)}
                  >
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-slate-500 text-sm p-2 text-center">
                  No bank found
                </p>
              )}
            </div>
          )}

          {/* Selected bank info box + Change Bank */}
          {selectedBankName !== "Please Select a bank" && (
            <div className="mt-3 p-3 bg-blue-900 bg-opacity-20 rounded-md border border-blue-800 border-opacity-30">
              <div className="flex items-center text-xs text-blue-200">
                <BsBank2 className="mr-2" />
                <span>Selected Bank: {selectedBankName}</span>
              </div>
              <button
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBankName("Please Select a bank");
                  setBankDetails((prev) => ({ ...prev, name_bank: "" }));
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Change Bank
              </button>
            </div>
          )}
        </div>

        {/* NAME */}
        <div className="mt-7">
          <div className="flex">
            <FaUser className="color-blue text-lg mr-1" />
            <p className="text-sm text-whites">Full recipient's name</p>
          </div>
          <input
            type="text"
            className="w-full mt-2 nav-bg rounded-md p-2 focus:outline-none focus:border focus:border-blue-500 focus:border-opacity-50 ps-6 placeholder:text-sm placeholder:text-slate-500"
            placeholder="Please enter the recipient's name"
            name="name_user"
            onChange={handleInputChange}
            value={bankDetails.name_user}
            style={{ fontFamily: '"Bahnschrift", sans-serif' }}
          />
        </div>

        {/* ACCOUNT NUMBER */}
        <div className="mt-7">
          <div className="flex">
            <MdOutlineCreditCard className="color-blue text-lg mr-1" />
            <p className="text-sm text-whites">Bank account number</p>
          </div>
          <input
            type="number"
            className="w-full mt-2 nav-bg rounded-md p-2 focus:outline-none focus:border focus:border-blue-500 focus:border-opacity-50 ps-6 placeholder:text-sm placeholder:text-slate-500"
            placeholder="Please enter the recipient's account number"
            name="stk"
            onChange={handleInputChange}
            value={bankDetails.stk}
            style={{ fontFamily: '"Bahnschrift", sans-serif' }}
          />
        </div>

        {/* PHONE NUMBER */}
        <div className="mt-7">
          <div className="flex">
            <FaMobileAlt className="color-blue text-lg mr-1" />
            <p className="text-sm text-whites">Phone number</p>
          </div>
          <input
            type="number"
            className="w-full mt-2 nav-bg rounded-md p-2 focus:outline-none focus:border focus:border-blue-500 focus:border-opacity-50 ps-6 placeholder:text-sm placeholder:text-slate-500"
            placeholder="Please enter the recipient's phone number"
            name="tinh"
            onChange={handleInputChange}
            value={bankDetails.tinh}
            style={{ fontFamily: '"Bahnschrift", sans-serif' }}
          />
        </div>

        {/* EMAIL ADDRESS */}
        <div className="mt-7">
          <div className="flex">
            <MdEmail className="color-blue text-lg mr-1" />
            <p className="text-sm text-whites">Email address</p>
          </div>
          <input
            type="email"
            className="w-full mt-2 nav-bg rounded-md p-2 focus:outline-none focus:border focus:border-blue-500 focus:border-opacity-50 ps-6 placeholder:text-sm placeholder:text-slate-500"
            placeholder="Please enter the recipient's email address"
            name="email"
            onChange={handleInputChange}
            value={bankDetails.email}
            style={{ fontFamily: '"Bahnschrift", sans-serif' }}
          />
        </div>

        {/* IFSC CODE */}
        <div className="mt-7">
          <div className="flex">
            <HiKey className="color-blue text-lg mr-1" />
            <p className="text-sm text-whites">IFSC code</p>
          </div>
          <input
            type="text"
            className="w-full mt-2 nav-bg rounded-md p-2 focus:outline-none focus:border focus:border-blue-500 focus:border-opacity-50 ps-6 placeholder:text-sm placeholder:text-slate-500"
            placeholder="Please enter the recipient's IFSC code"
            name="ifsc"
            onChange={handleInputChange}
            value={bankDetails.ifsc}
            style={{ fontFamily: '"Bahnschrift", sans-serif' }}
          />
        </div>

        <button
          className={`w-full rounded-full p-2 mt-4 text-white font-bold text-2xl ${
            areAllFieldsFilled
              ? "blue-linear"
              : "bg-gray-500 opacity-50 cursor-not-allowed"
          }`}
          onClick={handleSubmit}
          disabled={!areAllFieldsFilled}
          style={{ fontFamily: '"Bahnschrift", sans-serif' }}
        >
          Save
        </button>
      </div>

      <div className={`place-bet-popup ${showAlert ? "active" : ""}`}>
        <div className="text-sm">
          {successMessage || "Please select a bank and fill all fields"}
        </div>
      </div>
    </>
  );
};

export default AddBankCard;
