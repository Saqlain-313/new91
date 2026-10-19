import React, { useEffect, useState } from 'react';
import { recharge, rechargeGet } from '../../store/reducer/userReducer';
import { useDispatch, useSelector } from "react-redux"
import CopyCopmponent from '../../components/CopyCopmponent';
import AlertCopmponent from '../../components/AlertComponent';
import { Link, useNavigate } from 'react-router-dom'
const PaymentPageUsdt2 = () => {
    const { rechargegetData } = useSelector((state) => state.user)
    const [upi, setUpi] = useState("")
    const [usdt, setUsdt] = useState("TWLu5DGnkv9d61dzsEa8WtHCjZctaZpZv3")
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
    const [copied, setCopied] = useState(false);


    const copyToClipCode2 = (data) => {
        navigator.clipboard.writeText(data).then(() => {
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
            // setUsdt(res?.payload?.infoBank[0]?.usdt)
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
            // setUpi(res.payload.infoBank[0].stk)
            // setUsdt(res.payload.infoBank[0].usdt)
            setQrcode1(res.payload.qrcode1)

            setPay1(`upi://pay?pa=${encodeURIComponent(res.payload.infoBank[0].stk)}&pn=Merchant&am=${encodeURIComponent(rechargegetData?.money)}&cu=INR`);

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

    // time make Total time in seconds (59 min * 60 + 53 sec)
    const [timeLeft, setTimeLeft] = useState(59 * 60 + 53);

    useEffect(() => {
        if (timeLeft <= 0) return; // Stop if timer hits 0

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer); // Cleanup
    }, [timeLeft]);

    // Convert to MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (

        <div className='bg-gray-200 '>
            <div className='bg-white p-1 py-3 sticky top-0 z-30'>
                <div className="container-section flex items-center relative">
                    <h1 className='heading-h1 text-[#2a2a2a] text-3xl font-semibold text-start'>USDT</h1>
                </div>
            </div>
            <div className="bg-white font-sans p-5 mt-7">
                {/* Header */}

                <div className='flex flex-col items-center justify-center font-medium text-[#4a4a4a] border-b border-[var(--Dividing-line_color)]'>
                    <span className="text-lg text-center ">Oder No :</span>
                    <span className="font-semibold text-lg mb-1">{typeid}</span>
                    {/* <span className="text-lg font-bold text-purple-700 mr-2">${((rechargegetData?.money) / 90)?.toFixed(2)}</span> */}
                </div>

                {/* Amount in USDT */}
                <div className="flex flex-col items-center justify-center mt-2">
                    <div className="text-[#68aa9c] font-bold text-3xl">${((rechargegetData?.money) / 93)?.toFixed(2)} <span className='text-lg text-[#c7c7c7] '>(USDT)</span> </div>
                    <div className='bg-[#68aa9c] text-white text-center p-1 w-[60%] mt-2 '>
                        <button
                            onClick={() =>
                                copyToClipCode2(typeid)
                            }
                            className="text-white text-sm font-medium ml-2"
                        >
                            {copied === "address" ? "Copied" : "Copy"}
                        </button>
                    </div>
                </div>

                <div className='w-[30%] mx-auto mt-5 border-b-2 border-[#68aa9c]'>
                    <div className="text-xs text-[#68aa9c] text-center mb-1 font-medium ">USDT-TRC20</div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                    <div className="relative">
                        <img
                            src="/usdt2.jpeg"
                            alt="QR Code"
                            className="w-64 h-64"
                        />
                    </div>
                </div>


                {/* Wallet Address */}
                  <p className='text-black text-center'>{usdt}</p>
              
                <div className='bg-[#68aa9c] text-white text-center p-1 w-[60%] mx-auto my-2 '>
                    <button
                        onClick={() =>
                            copyToClipCode2(usdt)
                        }
                        className="text-white text-sm font-medium ml-2"
                    >
                        {copied === "address" ? "Copied" : "Copy"}
                    </button>
                </div>

                <div className='mt-2'>
                    <div className="text-red-500 text-xl font-bold text-center">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                    <div className='text-gray-400 font-semibold text-center'>Please Pay within {String(minutes).padStart(2, '0')} minutes and {String(seconds).padStart(2, '0')} seconds</div>
                </div>
                 <div className="flex items-center justify-center mt-4 ">
          <input type="text" placeholder="Enter the usdt address" value={utr} onChange={(e) => setUtr(e.target.value)} className="bg-white border text-gray-500 intput-black focus:outline-none rounded px-3 py-1 w-full" />
          <button className="ml-2 nav-bg text-white px-3 py-1 rounded" onClick={handleSubmit}>Submit</button>
        </div>
            </div>


            <div className=" ">
                <CopyCopmponent copyPopup={copyPopup} message="Copy successful" />
                <div className={`place-bet-popup ${alertsuccess ? "active" : ""}`}>
                    <div className='text-sm'>{successMessage}</div>
                </div>
                <AlertCopmponent alertPopup={alerts} message={successMessage} />
            </div>

            <div className='bg-white h-[6rem] relative bottom-[-96px]'>

            </div>
        </div>
    );
}

export default PaymentPageUsdt2;

