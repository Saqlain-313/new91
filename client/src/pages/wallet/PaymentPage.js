import React, { useEffect, useState } from 'react';
import { recharge, rechargeGet } from '../../store/reducer/userReducer';
import { useDispatch, useSelector } from "react-redux"
import CopyCopmponent from '../../components/CopyCopmponent';
import AlertCopmponent from '../../components/AlertComponent';

import { useNavigate } from 'react-router-dom';
import { FaClipboard, FaClipboardCheck } from "react-icons/fa";
import CustomeNavbar from '../../components/CustomeNavbar';
const PaymentPage = () => {
  const { rechargegetData } = useSelector((state) => state.user)
  const [upi, setUpi] = useState("")

  const [copyPopup, setCopyPopup] = useState(false)
  const [typeid, setTypeid] = useState("")
  const [utr, setUtr] = useState("")
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(false)
  const [alertsuccess, setAlertsuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [qrcode1, setQrcode1] = useState("")
  const [pay1, setPay1] = useState("")
  const dispatch = useDispatch()


  const copyToClipCode = () => {
    navigator.clipboard.writeText(upi).then(() => {
      setCopyPopup(true);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => {
        setCopyPopup(false);
      }, 1500);

    }).catch(err => {
      console.error('Failed to copy the text: ', err);
    });
  }



  const handleSubmit = async () => {
    const type = "submit";

    if (utr.length > 10) {

     const formData = new FormData();
      formData.append("utr", utr);
      formData.append("typeid", rechargegetData?.id_order);
      formData.append("type", type);

      dispatch(recharge(formData)).then((res) => {
        setSuccessMessage(res.payload.message)

        if (res.payload.status) {
          setAlertsuccess(true);

          setTimeout(() => {
            navigate("/wallet/RechargeHistory")
          }, 1000);

        } else {
          setAlerts(true);
        }


        setTimeout(() => {
          setAlertsuccess("")
        }, 4000);
      });
    }else{
      alert("Please enter 12 digit utr number")
    }

    };



    useEffect(() => {
      dispatch(rechargeGet()).then((res) => {
        setUpi(res.payload.infoBank[0].stk)

       
        setQrcode1(res.payload.qrcode1)
      })
      setTypeid(rechargegetData?.id_order)
      setTimeout(() => {
        setAlerts(false)
        setAlertsuccess(false)
      }, 2000);
    }, [successMessage,])

    useEffect(() => {
    window.scrollTo(0,0)
    }, [rechargegetData, typeid, qrcode1,utr, pay1])




    const [timeLeft, setTimeLeft] = useState(5 * 60);
    const [isActive, setIsActive] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
 
    const [copied, setCopied] = useState(false);
  
    useEffect(() => {
      let interval = null;
      if (isActive && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        setIsActive(false);
      }
      return () => clearInterval(interval);
    }, [isActive, timeLeft,upi]);
  
    const formatTime = () => {
      let minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      return {
        minutes: minutes < 10 ? `0${minutes}` : minutes,
        seconds: seconds < 10 ? `0${seconds}` : seconds,
      };
    };
  
    const { minutes, seconds } = formatTime();
  
 
  
    
  
  
    const paymentMethods = [
      {
        id: "paytm",
        name: "Paytm",
        imageSrc: "https://i.ibb.co/vC10KSvq/Paytm-Logo.png",
      },
      {
        id: "phonePe",
        name: "PhonePe",
        imageSrc: "https://i.ibb.co/Q7Jm7Qxg/Phone-Pe-Logo-full.webp",
      },
      {
        id: "mobiKwik",
        name: "MobiKwik",
        imageSrc: "https://i.ibb.co/FzNz0W8/mobilekwik.png", // You can replace this with a valid image
      },
      {
        id: "upi",
        name: "UPI",
        imageSrc: "https://i.ibb.co/k6qc7gWG/upi.webp",
      },
    ];
  

    return (
     <>
        <CustomeNavbar name="Pay"/>


       <div className=" mx-auto bg-[#f7f8ff] p-5 flex flex-col gap-4">
       <div className="w-full border border-slate-600 p-4 rounded-lg">
         <h1 className="border border-slate-600 text-black text-center p-2 rounded font-semibold">
       {typeid}
         </h1>
 
         <div className="border border-gray-600 mt-3 p-4 rounded-lg">
           <h1 className="text-black font-semibold text-center py-4 text-3xl">
             ₹{(rechargegetData?.money)?.toFixed(2)}
           </h1>
           <div className="w-20 mx-auto flex items-center justify-center rounded bg-green-500 p-1">
             <div className="text-base text-white">
               {minutes}:{seconds}
             </div>
           </div>
         </div>
 
         <div className="mt-4">
           <h2 className="text-black text-lg font-semibold mb-3">
             Select Payment Method
           </h2>
           <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {paymentMethods.map((method) => (
               <li
                 key={method.id}
                 onClick={() => setSelectedPayment(method.id)}
                 className={`flex items-center p-3 border border-gray-600 rounded-lg cursor-pointer transition-colors ${selectedPayment === method.id
                     ? "bg-[#2b3040] ring-2 ring-blue-500"
                     : "hover:bg-gray-200"
                   }`}
               >
                 <div className="flex items-center gap-3">
                   <img
                     src={method.imageSrc}
                     alt={method.name}
                     className="w-12 h-12 object-contain rounded"
                   />
                   <span className="text-black font-medium">{method.name}</span>
                 </div>
               </li>
             ))}
           </ul>
         </div>
       </div>
 
       <div className="w-full border border-gray-600 p-4 rounded-lg">
         <div className="flex flex-col items-center bg-white p-4 rounded-lg w-full">
           <h2 className="text-black text-center font-medium mb-3">
             Scan QR Code
           </h2>
           <div className="flex justify-center mb-4">
             <img
              src={qrcode1}
              // src={upi}
               alt="QR Code"
               className="w-40 h-40 object-contain bg-white p-2 rounded"
             />
           </div>
 
           <div className="mb-4 w-full">
             <div className="relative flex items-center">
               <input
                 type="text"
                 value={upi}
                
                 readOnly
                 placeholder="upi"
                 className="w-full p-2 pr-16 color-black border border-gray-300 rounded-lg"
                 aria-label="Payment URL input"
               />
               <button
               onClick={copyToClipCode}
              
                 className={`absolute right-1 p-2 rounded-md text-gray-700 hover:bg-gray-200`}
                 type="button"
                 aria-label="Copy URL"
               >
                 {copied ? (
                   <FaClipboardCheck className="text-green-500" />
                 ) : (
                   <FaClipboard />
                 )}
               </button>
             </div>
           
           </div>
 
           <form  className="w-full">
             <input
               type="text"
               value={utr} onChange={(e) => setUtr(e.target.value)} 
               placeholder="Enter utr number"
               className="w-full p-2 mb-3 color-black border border-gray-300 rounded-lg"
               aria-label="QR Code input"
             />
             <button
               type="submit"
               className={`w-full py-2 px-4 rounded-lg ${utr.trim()
                   ? "bg-green-500 hover:bg-green-600 text-white"
                   : "bg-gray-500 text-gray-300 cursor-not-allowed"
                 }`}
                 onClick={handleSubmit}
             >
               Submit Payment
             </button>
           </form>
         </div>
       </div>
     </div>
         <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />
           <div className={`place-bet-popup ${alertsuccess ? "active" : ""}`}>
             <div className='text-sm'>{successMessage}</div>
           </div>
     
           <AlertCopmponent alertPopup={alerts} message={successMessage} />
     </>
    );
  }

  export default PaymentPage;
