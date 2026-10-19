import React from "react";
import EmptyImg from "../../assets/empty.png";
const EmptyData = () => {
  return (
    <>
     <div className="mt-16">
       <img
        src={EmptyImg}
        alt=""
        className="w-56 flex items-center justify-center m-auto invert"
      />
      <p className="fs-sm gray-text text-center mt-3">No more</p>
     </div>
    </>
  );
};

export default EmptyData;
