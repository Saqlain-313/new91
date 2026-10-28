import { useEffect, useState } from "react";

const Avatar1 =
  "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/mrfykemt5slanyi5.png";
const Avatar2 = "https://i.ibb.co/4gDkSFQh/img1.png";
const Avatar3 = "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/800.png";
const Avatar4 = Avatar3;
const Avatar5 = Avatar3;

const earnings = [
  {
    id: 1,
    name: "Mem***UEW",
    amount: "100,992",
    image: Avatar1,
  },
  {
    id: 2,
    name: "Mem***CBJ",
    amount: "70,866",
    image: Avatar2,
  },
  {
    id: 3,
    name: "Mem***ZWS",
    amount: "69087",
    image: Avatar3,
  },
  {
    id: 4,
    name: "Mem***SUG",
    amount: "60560",
    image: Avatar5,
  },
  {
    id: 5,
    name: "Mem***HOG",
    amount: "58933",
    image: Avatar3,
  },
];

const generateRandomText = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  return (
    "MEM***" +
    Array.from(
      { length: 3 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("")
  );
};

const WinningInformation = () => {
  const [currentEarnings, setCurrentEarnings] = useState(earnings);

  useEffect(() => {
    const avatars = [Avatar1, Avatar2, Avatar3, Avatar4, Avatar5];

    const interval = setInterval(() => {
      const newEarning = {
        id: `${Date.now()}-${Math.random()}`,
        name: generateRandomText(),
        amount: Math.floor(Math.random() * 50000 + 50000).toLocaleString(
          "en-IN",
        ),
        image: avatars[Math.floor(Math.random() * avatars.length)],
      };

      setCurrentEarnings((prev) => [newEarning, ...prev].slice(0, 5));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* CSS isi component ke andar */}
      <style>{`
        .winning-information {
          width: 100%;
          min-width: 0;
          margin-top: 16px;
        }

        .winning-list {
          width: 100%;
          height: 350px;
          overflow: hidden;
          position: relative;
          isolation: isolate;
          contain: layout paint;
          border-radius: 10px;
        }

        .winning-row {
          width: 100%;
          height: 70px;
          min-height: 70px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--nav-bg, #201e2b);
          border-bottom: 1px solid #525167;
        }

        .winning-row:first-child {
          animation: winningSlideIn 300ms ease-out both;
        }

        .winning-avatar {
          width: 40px;
          height: 50px;
          flex: 0 0 40px;
          overflow: hidden;
          border-radius: 4px;
        }

        .winning-avatar img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .winning-labels,
        .winning-values {
          min-width: 0;
          flex: 1 1 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          overflow: hidden;
        }

        .winning-labels span,
        .winning-values span {
          display: block;
          min-width: 0;
          font-size: 12px;
          line-height: 16px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .winning-labels {
          color: #fff;
        }

        .winning-values {
          text-align: right;
          color: #fff;
        }

        .winning-values .winning-amount {
          color: #3b82f6;
        }

        @keyframes winningSlideIn {
          from {
            opacity: 0.65;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .winning-row:first-child {
            animation: none;
          }
        }
      `}</style>

      <section className="winning-information">
        <div className="flex items-center border-l-4 border-color-green text-sm mb-2">
          <h2 className="heading-h3 font-medium ml-1 text-whites">
            Winning Information
          </h2>
        </div>

        <div className="winning-list">
          {currentEarnings.map((item) => (
            <div key={item.id} className="winning-row">
              <div className="winning-avatar">
                <img src={item.image} alt="Profile" />
              </div>

              <div className="winning-labels">
                <span>User</span>
                <span>Winning amount</span>
              </div>

              <div className="winning-values">
                <span>{item.name}</span>
                <span className="winning-amount">{item.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default WinningInformation;
