import { useSelector } from "react-redux";
import Img2 from "../../../assets/icons/1.svg";
import Img4 from "../../../assets/icons/2.svg";
import Img5 from "../../../assets/icons/3.svg";
import Img6 from "../../../assets/icons/4.png";
import Img7 from "../../../assets/icons/5.svg";
import Img8 from "../../../assets/icons/6.svg";

// Array of partner data
const partners = [
  { name: "Microgaming", img: Img2, link: "/home/AllOnlineGames?game=Slots" },
  { name: "Evolution", img: Img4, link: "/home/AllOnlineGames?game=Slots" },
  { name: "JILI", img: Img5, link: "/home/AllOnlineGames?game=Slots" },
  { name: "AG", img: Img6, link: "/home/AllOnlineGames?game=Slots" },
  { name: "AG", img: Img7, link: "/home/AllOnlineGames?game=Slots" },
  { name: "AG", img: Img8, link: "/home/AllOnlineGames?game=Slots" },
];

const PlatformDetails = () => {
  const { bannergetData } = useSelector((state) => state.user);
  return (
    <div className="p-4 m-4 nav-bg flex flex-col items-center rounded ">
      {/* Header */}
      <div className="flex space-x-5 gap-8 items-center w-full h-auto max-w-xl mb-6 ">
        <img
          src={bannergetData?.gameall?.logo}
          alt="Logo"
          className=" h-auto mb-2 w-40"
        />
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-12 h-12 rounded-full text-red-500 font-bold text-lg border-red-500 border-2">
            18+
          </span>
        </div>
      </div>

      {/* Partners */}
      {/* <div className="grid grid-cols-3 gap-6 mb-6 max-w-xl">
        {partners.map((partner, index) => (
          // Use Link component for navigation
          <Link to={partner.link} key={index}>
            <div
              className="bgs-body p-2 flex justify-center items-center w-full rounded-md"
            >
              <img
                src={partner.img}
                alt={partner.name}
                className={`h-10 w-40 ${index === 3 ? "invert-[1]" : ""}`}
              />
            </div>
          </Link>
        ))}
      </div> */}

      {/* Description */}
      <div className="text-xs text-whites font-sm space-y-2 max-w-xl">
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
                fill="#21D9CC"
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
                fill="#21D9CC"
              ></rect>
            </svg>
          </span>{" "}
          Sikkim works with more than 10,000 online live game dealers and slot
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
                fill="#21D9CC"
              ></rect>
            </svg>
          </span>{" "}
          Sikkim supports fast deposit and withdrawal and looks forward to your
          visit.
        </p>
        <br />
        <p className="text-[#21D9CC]">
          Gambling can be addictive, please play rationally.
        </p>
        <p className="text-[#21D9CC]">
          sikkim only accepts customers above the age of 18.
        </p>
      </div>
    </div>
  );
};

export default PlatformDetails;
