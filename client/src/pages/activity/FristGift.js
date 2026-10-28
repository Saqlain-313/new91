import { useEffect, useState } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import CustomeNavbar from "../../components/CustomeNavbar";
import { getRedeemGift } from "../../store/reducer/activityReducer";

const FristGift = () => {
  const dispatch = useDispatch();
  const [alert, setAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(getRedeemGift());
    window.scrollTo(0, 0);
  }, [dispatch]);

  return (
    <>
      <CustomeNavbar name="First gift" />

      <main className="w-full max-w-5xl mx-auto pb-6">
        {/* Banner */}
        <section
          className="relative w-full min-h-[220px] sm:min-h-[240px] bg-cover bg-center bg-no-repeat overflow-hidden"
          style={{
            backgroundImage:
              'url("https://jalwagames6.com/assets/png/box-5efaaed8.png"), linear-gradient(103deg, rgb(250, 172, 72) 4.77%, rgb(247, 96, 43) 96.1%)',
          }}
        >
          <div className="relative flex min-h-[220px] sm:min-h-[240px] items-center px-4 py-6 sm:px-8">
            <div className="w-full max-w-lg text-white">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                First gift
              </h1>

              <p className="text-xs sm:text-sm opacity-95 mb-4 leading-relaxed">
                There are two types of new member gift package rewards:
              </p>

              <div className="space-y-3 mb-4">
                <p className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed">
                  <span className="shrink-0 font-bold bg-white text-orange-500 rounded-full w-5 h-5 flex items-center justify-center">
                    1
                  </span>
                  <span>Bonus for first deposit negative profit</span>
                </p>

                <p className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed">
                  <span className="shrink-0 font-bold bg-white text-orange-500 rounded-full w-5 h-5 flex items-center justify-center">
                    2
                  </span>
                  <span>Play games and get bonuses only for new members</span>
                </p>
              </div>

              <Link
                to="/main/firstgift/Eventdetail"
                className="inline-flex items-center justify-center border border-white rounded-full px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-white hover:text-orange-500 transition-colors"
              >
                Activity details
              </Link>
            </div>
          </div>
        </section>

        {/* Event Start Time */}
        <section className="mx-3 sm:mx-4 mt-5 nav-bg rounded-xl shadow-sm p-4 sm:p-6">
          <div className="text-center mb-4">
            <h2 className="text-base sm:text-lg font-semibold color-l">
              Event start time
            </h2>
            <div className="w-12 h-1 bg-green-500 rounded-full mx-auto mt-2" />
          </div>

          <p className="text-sm sm:text-base text-center font-semibold color-l break-words">
            2025-06-09 00:00:00
          </p>
        </section>

        {/* Package Rules */}
        <section className="mx-3 sm:mx-4 mt-5 nav-bg rounded-xl shadow-sm overflow-hidden">
          <h2 className="text-base sm:text-lg font-semibold text-white px-4 py-4">
            Package rules
          </h2>

          {/* Responsive table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-white text-xs sm:text-sm text-center">
              <thead>
                <tr className="blue-linear">
                  <th className="px-3 py-3 font-medium">
                    Conditions of participation
                  </th>
                  <th className="px-3 py-3 font-medium">
                    Get Compensation Bonus
                  </th>
                  <th className="px-3 py-3 font-medium">Bonus limit</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-white/10">
                  <td className="px-3 py-4 leading-relaxed">
                    First deposit for new users
                  </td>

                  <td className="px-3 py-4 leading-relaxed">
                    Total{" "}
                    <span className="text-base sm:text-lg text-red-500 font-bold">
                      35%
                    </span>{" "}
                    compensation from First Deposit Amount
                  </td>

                  <td className="px-3 py-4 text-red-500 font-bold whitespace-nowrap">
                    ₹150.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="px-4 py-3 text-[11px] text-white/60 sm:hidden">
            Swipe horizontally to view all columns.
          </p>
        </section>

        {/* Package Tips */}
        <section className="mx-3 sm:mx-4 mt-5 nav-bg rounded-xl shadow-sm p-4 flex items-start gap-3">
          <IoInformationCircleOutline className="text-xl sm:text-2xl text-red-500 shrink-0 mt-0.5" />

          <p className="text-xs sm:text-sm leading-relaxed text-red-500">
            The membership system that meets the standard automatically
            distributes bonuses.
          </p>
        </section>
      </main>

      {/* Alert */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed z-50 bottom-5 left-1/2 -translate-x-1/2 max-w-[calc(100%-2rem)] px-4 py-3 rounded-lg bg-black text-white text-sm shadow-lg transition-all duration-300 ${
          alert
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {successMessage}
      </div>
    </>
  );
};

export default FristGift;
