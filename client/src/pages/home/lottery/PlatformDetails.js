import { useSelector } from "react-redux";
import Img2 from "../../../assets/icons/1.svg";
import Img4 from "../../../assets/icons/2.svg";
import Img5 from "../../../assets/icons/3.svg";
import Img6 from "../../../assets/icons/4.png";
import Img7 from "../../../assets/icons/5.svg";
import Img8 from "../../../assets/icons/6.svg";

// Array of partner data
const partners = [
  { name: "Microgaming", img: Img2 },

  { name: "Evolution", img: Img4 },
  { name: "JILI", img: Img5 },
  { name: "AG", img: Img6 },
  { name: "AG", img: Img7 },
  { name: "AG", img: Img8 },
];

const PlatformDetails = () => {
  const { bannergetData } = useSelector((state) => state.user);
  return (
    <div className="p-3 flex flex-col items-center rounded">
      <div
        className="
          winning-item
          w-full
          p-3
          bg-white
          overflow-visible
          rounded-[14px]
          border
          border-[#EEEEEE]
          shadow-[0_4px_16px_rgba(0,0,0,0.08)]
        "
      >
        {/* Header */}
        <div className="flex justify-center gap-1 items-center w-full h-auto mb-2 mt-5">
          <div className="flex justify-center items-center">
            <span className="w-10 h-10 rounded-full bg-red-500 inline-flex justify-center items-center font-semibold">
              +18
            </span>
          </div>

          {/* <span className="w-1/2 flex justify-center items-center">
            <img
              src="https://i.ibb.co/TJKjssH/telegram.png"
              alt=""
              loading="lazy"
              className="h-12"
            />
          </span> */}
          {/* <img
            src="https://i.ibb.co/QjTbrcCg/u18-7146ab6f.webp"
            alt=""
            className="w-7"
          /> */}
          {/* <img
            src={bannergetData?.gameall?.logo}
            alt="Logo"
            className=" h-auto w-24"
          /> */}
        </div>

        <div className="w-full px-3 border-[#D8EBE4]">
          <ul className="space-y-1">
            <li className="flex items-start gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
              <p className="text-[#7D889D] text-[12px] leading-relaxed">
                The platform advocates fairness, justice, and openness. We mainly
                operate fair lottery, blockchain games, live casinos, and slot
                machine games.
              </p>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
              <p className="text-[#7D889D] text-[12px] leading-relaxed">
                Chennai91 works with more than 10,000 online live game dealers
                and slot games, all of which are verified fair games.
              </p>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></span>
              <p className="text-[#7D889D] text-[12px] leading-relaxed">
                Chennai91 supports fast deposit and withdrawal, and looks
                forward to your visit.
              </p>
            </li>
          </ul>

          <div className="mt-5 pl-5 space-y-1">
            <p className="text-red-400 text-[12px]">
              Gambling can be addictive, please play rationally.
            </p>
            <p className="text-red-400 text-[12px]">
              Chennai91 only accepts customers above the age of 18.
            </p>
          </div>
        </div>

        {/* Partners */}
        {/* <div className="grid grid-cols-3 gap-6 mb-6 max-w-xl">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="bgs-body p-2 flex justify-center items-center w-full rounded-md"
            >
              <img
                src={partner.img}
                alt={partner.name}
                className={`h-10 w-40 ${index === 3 ? "invert-0" : ""}`}
              />
            </div>
          ))}
        </div> */}

        {/* Description */}
        {/* <div className="text-xs text-whites font-sm space-y-2 max-w-xl">
          <p className="flex items-start gap-1">
            <span>
              <svg
                data-v-ca43e9bb=""
                width="8"
                height="8"
                viewBox="0 0 11 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  data-v-ca43e9bb=""
                  x="5.65625"
                  width="8"
                  height="8"
                  rx="1"
                  transform="rotate(45 5.65625 0)"
                  fill="#F5CC2C"
                ></rect>
              </svg>
            </span>{" "}
            The platform advocates fairness, justice, and openness. We mainly
            operate fair lottery, blockchain games, live casinos, and slot machine
            games.
          </p>
          <p className="flex items-start gap-1">
            <span>
              <svg
                data-v-ca43e9bb=""
                width="8"
                height="8"
                viewBox="0 0 11 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  data-v-ca43e9bb=""
                  x="5.65625"
                  width="8"
                  height="8"
                  rx="1"
                  transform="rotate(45 5.65625 0)"
                  fill="#F5CC2C"
                ></rect>
              </svg>
            </span>{" "}
            Chennai91 works with more than 10,000 online live game dealers and slot
            games, all of which are verified fair games.
          </p>
          <p className="flex items-start gap-1">
            <span>
              <svg
                data-v-ca43e9bb=""
                width="8"
                height="8"
                viewBox="0 0 11 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  data-v-ca43e9bb=""
                  x="5.65625"
                  width="8"
                  height="8"
                  rx="1"
                  transform="rotate(45 5.65625 0)"
                  fill="#F5CC2C"
                ></rect>
              </svg>
            </span>{" "}
            Chennai91 supports fast deposit and withdrawal and looks forward to your
            visit.
          </p>
          <br />
          <p className="text-[#F5CC2C]">
            Gambling can be addictive, please play rationally.
          </p>
          <p className="text-[#F5CC2C]">
            Chennai91 only accepts customers above the age of 18.
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default PlatformDetails;