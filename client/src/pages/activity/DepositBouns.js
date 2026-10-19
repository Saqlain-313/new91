import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { recharheBonus } from "../../store/reducer/userReducer";

import CustomeNavbar from "../../components/CustomeNavbar";

const DepositBouns = () => {
  const { rechargeBonusData } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(recharheBonus());
  }, [dispatch]);

  return (
    <div>
      <CustomeNavbar name="Deposit Bonus" />
      <div className="relative container-section first-deposit bgs-body py-2">
        <div className="middle-content-section ">
          <ul>
            {rechargeBonusData?.map((item, i) => (
              <li key={i} onClick={() => navigate("/wallet/Recharge")}>
                <div className="first-c">
                  <p className="text-whites">
                    First deposit{" "}
                    <span className="text-[#feaa57]">
                      {item.recAmount.toLocaleString()}
                    </span>
                  </p>
                  <span className="text-[#DD9138]">
                    +₹{item.bonus.toLocaleString()}.00
                  </span>
                </div>
                <p className="color-gray">
                  Deposit {item.recAmount.toLocaleString()} for the first time
                  in your account and you can receive
                  {(
                    Number(item.recAmount) + Number(item.bonus)
                  ).toLocaleString()}
                </p>
                <div className="bottom-c">
                  <div className="slider-box border py-1 text-xs">
                    0/{item.recAmount.toLocaleString()}
                  </div>
                  <button className="border fs-sm border-[#feaa57]">
                    Deposit
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-4 m-4 bg-light flex flex-col items-center rounded ">
        {/* Description */}
        <div className="text-xs text-whites font-sm space-y-1 max-w-xl">
          <p className="flex items-start gap-1">
            <span>
              <svg
              className="text-[#FD7D76]"
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
            Exclusive for the first recharge of the account. There is only one
            chance. The more you recharge, the more rewards you will receive.
            The highest reward is ₹1,000.00;
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
            The platform advocates fairness, justice, and openness. We mainly
            operate fair lottery, blockchain games, live casinos, and slot
            machine games.
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
            Chennai91 works with more than 10,000 online live game dealers and
            slot games, all of which are verified fair games.
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
            Chennai91 supports fast deposit and withdrawal and looks forward
            to your visit.
          </p>
          <br />
          <p className="text-[#FD7D76]">
            Gambling can be addictive, please play rationally.
          </p>
          <p className="text-[#FD7D76]">
            Chennai91 only accepts customers above the age of 18.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepositBouns;
