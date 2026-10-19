import React from "react";
import ServerBg from "../../assets/serverbg.png";
import { Link } from "react-router-dom";
import CustomeNavbar from "../../components/CustomeNavbar";
const Server = () => {
  return (
    <>
     
             <CustomeNavbar name="Agent line customer service"/>
      <div className="blue-linear">
        <img src={ServerBg} alt="" className="px-14" />
      </div>
    </>
  );
};

export default Server;
