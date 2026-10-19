import React, { useEffect, useState } from 'react';
import { recharge, rechargeGet } from '../../store/reducer/userReducer';
import { useDispatch, useSelector } from "react-redux"
import CopyCopmponent from '../../components/CopyCopmponent';
import AlertCopmponent from '../../components/AlertComponent';

import {  useNavigate } from 'react-router-dom';

import CustomeNavbar from '../../components/CustomeNavbar';
const PaymentPage3 = () => {
  const { rechargegetData } = useSelector((state) => state.user)
  const [upi, setUpi] = useState("")
  const [copyPopup, setCopyPopup] = useState(false)
  const [typeid, setTypeid] = useState("")
  const [utr, setUtr] = useState("")
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(false)
  const [alertsuccess, setAlertsuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [qrcode1,setQrcode1]=useState("")
  const [pay1,setPay1]=useState("")
  const dispatch = useDispatch()


  const copyToClipCode = () => {
    navigator.clipboard.writeText(upi).then(() => {
      setCopyPopup(true);
      setTimeout(() => {
        setCopyPopup(false);
      }, 1500);

    }).catch(err => {
      console.error('Failed to copy the text: ', err);
    });
  }


  const handleSubmit = async () => {
    const type = "submit";
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
  };


 
  useEffect(() => {
    dispatch(rechargeGet()).then((res) => {
      setUpi(res.payload.infoBank[0].upi3)
    
      setQrcode1(res.payload.qrcode3)

    })
    setTypeid(rechargegetData?.id_order)
    setTimeout(() => {
      setAlerts(false)
      setAlertsuccess(false)
    }, 2000);
  }, [successMessage,])

  useEffect(()=>{
window.scrollTo(0,0)
  },[rechargegetData,typeid,qrcode1,pay1])

  const now = new Date();
const formatted = now.getFullYear() + '-' +
  String(now.getMonth() + 1).padStart(2, '0') + '-' +
  String(now.getDate()).padStart(2, '0') + ' ' +
  String(now.getHours()).padStart(2, '0') + ':' +
  String(now.getMinutes()).padStart(2, '0') + ':' +
  String(now.getSeconds()).padStart(2, '0');

  return (
    <div className=" h-[120vh]">
      <div className=" ">
              <CustomeNavbar name="Pay"/>
        <div className='nav-bg mt-3 p-4'>

          <div className="flex justify-between py-2">
            <div>
              <p className="text-base">{formatted}</p>
              <p className="text-base">S20240728140742hSVBTruamqopwK3P1</p>
            </div>
            <p className="text-base font-bold">Time is up!</p>
          </div>
          <div className=" text-white py-4">
            <p className="text-3xl font-bold">₹{(rechargegetData?.money)?.toFixed(2)}</p>
          </div>

        </div>
        <div className=" my-4"></div>
        <div className="text-center mb-4">
          <p className="font-semibold text-whites">QR</p>
          <p className="text-sm text-gray-500">Scan Code To Pay</p>
  
          <img src={qrcode1} alt="QR Code" className="mx-auto my-2" />
          <p className="text-xs text-gray-500">Do not use same QR code to pay multiple times</p>
       
        
        </div>
        <div className=" my-4 mt-5"></div>

      
      <div className='container-section'>
          <div className="text-center mb-4">
            <p className="font-semibold text-whites">Copy Account To Pay</p>
            <div className="flex items-center justify-center mt-2">
              <input type="text" value={upi} readOnly className="bg-popup-nav gray-50 focus:outline-none rounded px-3 py-1 w-full max-w-xs" />
              <button className="ml-2 blue-linear text-black px-3 py-1 rounded" onClick={copyToClipCode}>Copy</button>
            </div>
          </div>

        <div className="flex items-center justify-center mt-4">
          <input type="text" placeholder="input 12-digit here" value={utr} onChange={(e) => setUtr(e.target.value)} className="bg-popup-nav gray-50 focus:outline-none rounded px-3 py-1 w-full max-w-xs" />
          <button className="ml-2 blue-linear text-black px-3 py-1 rounded" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
        <div className="text-center mt-4 text-sm text-gray-500">
          if chip isn't added, input the UTR and click submit.
        </div>
        <div className=" my-4"></div>
        <div className="text-center text-xs text-gray-500">
          <p>Contact us</p>
          <p>1. please, contact us if you have any payment issue</p>
          <p>2. Please select the payment method you need and make sure your phone has the corresponding wallet software installed.</p>
        </div>
      </div>
      <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />
      <div className={`place-bet-popup ${alertsuccess ? "active" : ""}`}>
        <div className='text-sm'>{successMessage}</div>
      </div>

      <AlertCopmponent alertPopup={alerts} message={successMessage} />
    </div>
  );
}

export default PaymentPage3;
