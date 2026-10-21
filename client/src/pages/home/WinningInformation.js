// src/Slider.js
import { useEffect, useState } from "react";

const Avatar1 =
  "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/mrfykemt5slanyi5.png";
const Avatar2 = "https://i.ibb.co/4gDkSFQh/img1.png";
const Avatar3 = "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/800.png";
const Avatar4 = "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/800.png";
const Avatar5 = "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/800.png";

const earnings = [
  {
    id: 1,
    name: "Mem***UEW",
    rank: "NO1",
    amount: "100,992",
    highlight: true,
    image: Avatar1,
  },
  {
    id: 2,
    name: "Mem***CBJ",
    rank: "NO2",
    amount: "70,866",
    highlight: true,
    image: Avatar2,
  },
  {
    id: 3,
    name: "Mem***ZWS",
    rank: "NO3",
    amount: "69087",
    highlight: true,
    image: Avatar3,
  },
  {
    id: 4,
    name: "Mem***SUG",
    rank: "NO4",
    amount: "60560",
    highlight: false,
    image: Avatar5,
  },
  {
    id: 5,
    name: "Mem***HOG",
    rank: "NO5",
    amount: "58933",
    highlight: false,
    image: Avatar3,
  },
];
// Random text and number generators
const generateRandomText = () => {
  const prefix = "MEM***";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = prefix;
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getRandomINumber = () => {
  return (Math.random() * 1000).toFixed(2);
};

// Function to pick a random item from the data array
const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Component for showing winning information
const WinningInformation = () => {
  const [currentEarnings, setCurrentEarnings] = useState(earnings);

  // Function to generate a random earning entry
  const generateRandomEarning = () => {
    const avatars = [Avatar1, Avatar2, Avatar3, Avatar4, Avatar5];
    const randomAmount = Math.floor(Math.random() * (100000 - 50000) + 50000);

    return {
      id: Math.random(),
      name: generateRandomText(),
      rank: `NO${Math.floor(Math.random() * 5) + 1}`,
      amount: randomAmount.toLocaleString(),
      highlight: Math.random() > 0.5,
      image: avatars[Math.floor(Math.random() * avatars.length)],
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate a new random earning
      const newEarning = generateRandomEarning();

      // Update the earnings list, keeping only the last 5 entries
      setCurrentEarnings((prev) => {
        const updated = [newEarning, ...prev.slice(0, 4)];
        return updated;
      });
    }, 1000); // Update every 1 second

    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }, []);
  return (
    <>
      {/* <h3 className="border-after mt-2 text-whites font-[400]">
        Winning Information
      </h3> */}
      <div className="flex items-center mt-4  border-l-4 border-color-green text-sm mb-2">
        {" "}
        <h1 className="heading-h3 font-medium ml-1 text-whites">
          Winning Information
        </h1>
      </div>

      <div className="winning-item">
        <div className="slider-container">
          <div className="slider">
            {currentEarnings.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-4 gap-3 nav-bg border-b border-[#525167]"
              >
                <div className="flex-shrink-0 w-[40px] h-[50px] object-cover overflow-hidden">
                  <img
                    src={item.image}
                    alt="profile"
                    className="w-[40px] h-[50px] object-cover overflow-hidden "
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col justify-center gap-2 text-whites">
                    <span className=" text-sm">User</span>
                    <span className="text-sm">Winning amount</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col justify-between text-end gap-2">
                    <span className=" text-sm text-whites">{item.name}</span>
                    <span className={`text-[12px] text-blue`}>
                      {item.amount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default WinningInformation;
