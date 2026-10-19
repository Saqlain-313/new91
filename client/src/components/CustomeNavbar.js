import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { IoChevronDown } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const CustomeNavbar = ({
  name,
  details,
  link,
  logo,
  bgClass = "bg-body",
}) => {
  const { bannergetData } = useSelector((state) => state.user);

  const navigate = useNavigate();

  // Language popup
  const [languageOpen, setLanguageOpen] = useState(false);

  // US flag image
  const usFlag = "https://i.ibb.co/twkj2KXr/en-Bw55-K-VV.png";

  // India flag image
  const indiaFlag = "https://flagcdn.com/w40/in.png";

  // Selected language
  const [selectedLanguage, setSelectedLanguage] = useState({
    code: "EN",
    flag: usFlag,
  });

  // Languages
  const languages = [
    {
      code: "EN",
      name: "English",
      flag: usFlag,
    },
    {
      code: "HD",
      name: "Hindi",
      flag: indiaFlag,
    },
    {
      code: "TA",
      name: "Tamil",
      flag: indiaFlag,
    },
    {
      code: "TE",
      name: "Telugu",
      flag: indiaFlag,
    },
  ];

  // Back button
  const handleBack = () => {
    navigate(-1);
  };

  // Language select
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setLanguageOpen(false);
  };

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <div
        className={`${bgClass} p-1 py-3 sticky top-0 z-40`}
      >
        <div className="container-section flex items-center relative min-h-[30px]">

          {/* ================= BACK BUTTON ================= */}
          <button
            type="button"
            onClick={handleBack}
            className="absolute left-0 flex items-center justify-center z-10"
          >
            <IoIosArrowBack className="text-xl text-white" />
          </button>

          {/* ================= PAGE NAME ================= */}
          {name && (
            <h1 className="heading-h2 text-black text-center flex justify-center items-center m-auto">
              {name}
            </h1>
          )}

          {/* ================= LOGO ================= */}
          {logo && (
            <div className="text-center flex justify-center items-center m-auto">
              <img
                src={bannergetData?.gameall?.logo1}
                alt="logo"
                className="w-36"
              />
            </div>
          )}

          {/* ================= DETAILS ================= */}
          {details && (
            <p className="absolute right-1">
              <Link
                className="fs-sm text-whites"
                to={link}
              >
                {details}
              </Link>
            </p>
          )}

          {/* =================================================
              LANGUAGE BUTTON
          ================================================== */}
          {!details && (
            <button
              type="button"
              onClick={() => setLanguageOpen(true)}
              className="
                absolute
                right-1
                flex
                items-center
                gap-1.5
                text-white
                text-sm
                font-medium
                cursor-pointer
              "
            >
              {/* Flag */}
              <img
                src={selectedLanguage.flag}
                alt={selectedLanguage.code}
                className="w-6 h-6 object-contain"
              />

              {/* Language Code */}
              <span className="text-base">
                {selectedLanguage.code}
              </span>

              {/* Arrow */}
              {/* <IoChevronDown className="text-sm" /> */}
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          LANGUAGE POPUP
      ====================================================== */}
      {languageOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/60
          "
          onClick={() => setLanguageOpen(false)}
        >
          {/* ================= POPUP BOX ================= */}
          <div
            className="
              absolute
              left-1/2
              bottom-0
              -translate-x-1/2
              w-full
              max-w-[375px]
              bg-white
              overflow-hidden
              shadow-2xl
              rounded-xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* ================= LANGUAGE LIST ================= */}
            <div className="px-4">

              {languages.map((language, index) => {
                const isSelected =
                  selectedLanguage.code === language.code;

                return (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() =>
                      handleLanguageSelect(language)
                    }
                    className={`
                      w-full
                      flex
                      items-center
                      justify-between
                      py-4
                      cursor-pointer
                      ${
                        index !== languages.length - 1
                          ? "border-b border-gray-200"
                          : ""
                      }
                    `}
                  >
                    {/* ================= LEFT ================= */}
                    <div className="flex items-center gap-3">

                      {/* Flag Image */}
                      <img
                        src={language.flag}
                        alt={language.code}
                        className="
                          w-7
                          h-7
                          object-contain
                        "
                      />

                      {/* Language Code */}
                      <span
                        className="
                          text-[15px]
                          font-medium
                          text-[#26364a]
                        "
                      >
                        {language.code}
                      </span>
                    </div>

                    {/* ================= RIGHT ================= */}
                    <div
                      className={`
                        w-5
                        h-5
                        rounded-full
                        border
                        flex
                        items-center
                        justify-center
                        ${
                          isSelected
                            ? "bg-[#ff5b63] border-[#ff5b63]"
                            : "border-gray-300 bg-white"
                        }
                      `}
                    >
                      {isSelected && (
                        <FaCheck
                          className="
                            text-white
                            text-[10px]
                          "
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomeNavbar;