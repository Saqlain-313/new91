import { useEffect, useState } from "react";
import FeedbackImg from "../../assets/feedbackImg.png";
import CustomeNavbar from "../../components/CustomeNavbar";

const Feedback = () => {
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!feedback.trim()) {
      return;
    }

    // Connect your feedback API here.
    console.log("Feedback:", feedback);
  };

  return (
    <div className="min-h-screen w-full bg-[#15121d]">
      <CustomeNavbar name="Feedback" />

      <main className="w-full max-w-[540px] mx-auto px-4 sm:px-5 pt-4 pb-8">
        <form onSubmit={handleSubmit}>
          {/* Feedback Input */}
          <div className="w-full">
            <textarea
              name="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Welcome to feedback, please give feedback-please describe the problem in detail when providing feedback, preferably attach a screenshot of the problem you encountered, we will immediately process your feedback!"
              className="block w-full h-[340px] sm:h-[450px] rounded-[15px] bg-[#252525] text-white placeholder:text-[#9ca5b5] placeholder:font-medium text-sm leading-[1.15] p-5 resize-y outline-none focus:ring-2 focus:ring-cyan-400/50 transition-shadow"
            />
          </div>

          {/* Rewards Section */}
          <section className="mt-10 sm:mt-12 flex flex-col items-center text-center">
            <h2 className="text-white text-lg sm:text-xl font-semibold leading-7">
              Send helpful feedback
            </h2>

            <p className="text-white text-lg sm:text-xl font-semibold leading-7 mt-1">
              Chance to win Mystery Rewards
            </p>

            <img
              src={FeedbackImg}
              alt="Mystery rewards illustration"
              className="w-[230px] sm:w-[260px] max-w-full h-auto object-contain my-5"
            />
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!feedback.trim()}
            className="w-full min-h-[54px] mt-3 rounded-full bg-gradient-to-r from-[#20d5c1] to-[#20a9e8] text-white text-lg font-semibold flex items-center justify-center transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </form>
      </main>
    </div>
  );
};

export default Feedback;
