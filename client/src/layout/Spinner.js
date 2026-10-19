import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import loader from "../assets/loader-out.png";
import "./spinner.css"
import { useSelector } from "react-redux";

const Spinner = ({ path = "login" }) => {
    const [count, setCount] = useState(3);
    const navigate = useNavigate();
    const location = useLocation();
    const { bannergetData } = useSelector((state) => state.user);
    const { userInfo } = useSelector((state) => state.auth);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCount((prevValue) => --prevValue);
        }, 1000);
        if(userInfo){
            navigate({
                state: location.pathname,
            });
        }
        count === 0 &&
            navigate(`/${path}`, {
                state: location.pathname,
            });
        return () => clearInterval(interval);
    }, [count, navigate, location, path]);
    return (
        <>
        {count !== 0 ?
           <div className="loader z-50" role="status">
                  <div className="outer-layer rounded-full">
                    {" "}
                    <img src={loader} alt="" className="h-full w-full imgs" />
                  </div>
          
                  <img src={bannergetData?.gameall?.logo1} alt="" className="imgs2"/>
                </div>
        : ""}
        </>
    );
};

export default Spinner;