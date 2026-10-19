import React, { useEffect, useState } from 'react';
import { recharge, rechargeGet } from '../../store/reducer/userReducer';
import { useDispatch, useSelector } from "react-redux"
import CopyCopmponent from '../../components/CopyCopmponent';
import AlertCopmponent from '../../components/AlertComponent';
import { Link, useNavigate } from 'react-router-dom';
import CustomeNavbar from '../../components/CustomeNavbar';

const PaymentPage2 = () => {
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
      setUpi(res.payload.infoBank[0].upi2)


      setQrcode1(res.payload.qrcode2)

    })
    setTypeid(rechargegetData?.id_order)
    setTimeout(() => {
      setAlerts(false)
      setAlertsuccess(false)
    }, 2000);
  }, [successMessage,])

  useEffect(() => {
  window.scrollTo(0,0)
  }, [rechargegetData, typeid, qrcode1, pay1])





  return (
    <>
          <CustomeNavbar name="Pay"/>


      <div className="payment-2">
        <div className="payment-container">
          <h2 className="payment-title">Payment</h2>
          <div className="amount-container">
            <span className="amount-label">Amount Payable</span>
            <span className="amount-value">₹{(rechargegetData?.money)?.toFixed(2)} </span>
          </div>
        </div>
        <div className="payment-selection-container">
          <h2 className="payment-select">Click a payment method</h2>
          <div className="payment-grid">
          



            <button className="payment-button">
              <img aria-hidden="true" alt="Paytm logo" src="https://i.ibb.co/vxYMkZcv/Paytm-Logo.png" />
            </button>
            <button className="payment-button">
              <img aria-hidden="true" alt="PhonePe logo" src="https://i.ibb.co/ZPrPLcw/Phone-Pe-Logo.png" />
            </button>
            <button className="payment-button">
              <img aria-hidden="true" alt="Google Pay logo" src="https://i.ibb.co/s9jjqKxH/Google-Pay-logo-500x281.png" />
            </button>
            <button className="payment-button">
              <img aria-hidden="true" alt="UPI logo" src="https://i.ibb.co/xqmtJ4Fd/upi-logo-png-4.png" />
            </button>
          </div>
        </div>
        <div className="qr-payment-container">
          <p className="qr-instructions">Or if above methods do not work for you, Scan QR code to pay:</p>
          <p className="qr-note">Do not use the same QR code to pay multiple times</p>
          <div className="qr-code">
            <img src={qrcode1} alt="QR Code for payment" />
            {/* <img src={upi} alt="QR Code for payment" /> */}
          </div>
          <p className="important-tips">
            !! Important Tips: After payment is completed, you must fill in UTR in the blank below and submit.
          </p>
          {/* <form className="utr-form">
            <input type="text" id="utr-input" placeholder="UTR (12 digits)" className="utr-input" maxLength={12} />
            <button type="submit" className="utr-submit" id="utr-submit" disabled>Submit</button>
          </form> */}
        </div>
        <div className="last">
          <p className="last-title">If above methods not work for you, do Manual Transfer</p>
          <p className="last-point">1. Copy UPI ID and open app to pay to this UPI</p>
          <div className="last-upi">
            <p className="upi-title">Upi</p>
            <p className="upi-mail" id="upi-id">{upi}</p>
            <p className="upi-copy"  onClick={copyToClipCode}>Copy</p>
          </div>
          <div className="last-upi">
            <p className="upi-title">Amount</p>
            <p className="upi-mail" id="amount-value">₹{(rechargegetData?.money)?.toFixed(2)}</p>
            {/* <p className="upi-copy" onclick="copyText('amount-value')">Copy</p> */}
          </div>
       
          <div className="last-upi">
            <p className="upi-title">Quick open</p>
            <img className="upi-img" src="https://i.ibb.co/vxYMkZcv/Paytm-Logo.png" alt />
            <img className="upi-img" src="https://i.ibb.co/s9jjqKxH/Google-Pay-logo-500x281.png" alt />
            <img className="upi-img" src="https://i.ibb.co/ZPrPLcw/Phone-Pe-Logo.png" alt />
          </div>
          <p className="last-point">2. Submit the UTR which copy from your payment app.. (mandatory)</p>
          <form className="utr-form">
            <input type="text" id="utr-input-2" placeholder="UTR (12 digits)" className="utr-input color-black" value={utr} onChange={(e) => setUtr(e.target.value)} />
          </form>
            <button type="submit" className="utr-submit" id="utr-submit-2" onClick={handleSubmit}>Submit</button>
        </div>
        <p className="help">24x7 help: <span><a href="mailto:InfinityWin@gmail.com">InfinityWin@gmail.com</a></span> </p>
      </div>





      <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />
      <div className={`place-bet-popup ${alertsuccess ? "active" : ""}`}>
        <div className='text-sm'>{successMessage}</div>
      </div>

      <AlertCopmponent alertPopup={alerts} message={successMessage} />
    </>
  );
}

export default PaymentPage2;
