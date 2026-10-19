import React, { useState } from "react";
import { IoIosArrowBack, IoIosCheckmarkCircle } from "react-icons/io";
import { AvatarData } from "./AvatarData";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { changeUserPhoto, userDetail } from "../../store/reducer/authReducer";
import CustomeNavbar from "../../components/CustomeNavbar";

const Avatar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const avatarArray = Object.values(AvatarData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleUpdate = (photo) => {
    dispatch(changeUserPhoto(photo)).then((res) => {
      if (res.payload.status) {
        dispatch(userDetail());
        navigate("/main");
      }
    });
    // //console.log("object",photo)
  };
  return (
    <>
    

       <CustomeNavbar name="Change avatar"/>

      <div className="container-section p-2 mt-2">
        <div className="grid grid-cols-12 gap-3">
          {avatarArray.map((item, index) => (
            <div
              className={`col-span-4 rounded-lg relative ${
                userInfo?.userPhoto == index
                  ? "border-2 border-[--bg-color-l]"
                  : ""
              }`}
              key={index}
            >
              <img
                src={item}
                alt={`Avatar ${index + 1}`}
                className={`rounded-lg ${
                  userInfo?.userPhoto == index
                    ? "border-2 border-[--bg-color-l]"
                    : ""
                }`}
                onClick={() => handleUpdate(index)}
                loading="lazy"
              />
              {userInfo?.userPhoto == index ? (
                <span className="absolute bottom-0 text-2xl right-0 color-l">
                  <IoIosCheckmarkCircle />
                </span>
              ) : (
                ""
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Avatar;
