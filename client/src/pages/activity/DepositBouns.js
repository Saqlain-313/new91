import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { recharheBonus } from "../../store/reducer/userReducer";

import CustomeNavbar from "../../components/CustomeNavbar";

const DepositBouns = () => {
  const { rechargeBonusData, rechargeList2Data } = useSelector(
    (state) => state.user,
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(recharheBonus());
  }, [dispatch]);

  return (
    <div>
      <CustomeNavbar name="Deposit Bonus" />
      <div className="relative container-section first-deposit bgs-body py-2">
        {rechargeList2Data?.length === 0 && (
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
        )}
      </div>

      <div className="relative m-4 nav-bg flex flex-col items-center rounded">
        {/* Description */}
        <div className="p-4 pt-12 rounded-lg nav-bg shadow-md font-['Roboto','Inter',sans-serif] relative">
          {/* SVG and H2 are now positioned relative to this div */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            {/* Adjusted SVG size and positioning for better visual balance */}
            <svg className="w-64 h-32 text-green-600">
              <use href="#icon-ruleHead"></use>
            </svg>
            {/* Adjusted H2 positioning to be within the SVG's visual area */}
            <h2 className="text-lg font-semibold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
              Activity Rules
            </h2>
          </div>

          <ul className="list-disc pl-5 space-y-2 text-sm color-l mt-4">
            {/* Added margin-top to the list to ensure it doesn't overlap the header */}
            <li>
              Exclusive for the first recharge of the account. There is only one
              chance. The more you recharge, the more rewards you will receive.
              The highest reward is ₹0.00;
            </li>
            <li>Activities cannot be participated in repeatedly;</li>
            <li>
              Rewards can only be claimed manually on IOS, Android, H5, and PC;
            </li>
            <li>
              The bonus (excluding the principal) given in this event requires 1
              times the coding turnover (i.e. valid bets) before it can be
              withdrawn, and the coding does not limit the platform;
            </li>
            <li>
              This event is limited to normal human operations by the account
              owner. It is prohibited to rent, use plug-ins, robots, gamble with
              different accounts, brush each other, arbitrage, interfaces,
              protocols, exploit loopholes, group control or other technical
              means to participate, otherwise it will be canceled or Rewards
              will be deducted, frozen, or even blacklisted;
            </li>
            <li>
              In order to avoid differences in text understanding, the platform
              reserves the right of final interpretation of this event.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DepositBouns;
