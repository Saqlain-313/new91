import { useSelector } from "react-redux";
const img1 = "https://i.ibb.co/5h83FVg8/aeieswin.png";

const MainLoader = () => {
  const { bannergetData } = useSelector((state) => state.user);

  return (
    <div className="main-loadar fixed z-[99999] w-full md:w-[25rem] top-0 bottom-0 flex flex-col gap-5 items-center justify-center h-screen overflow-hidden p-0">
      <img src={img1} className=" h-auto w-[270px]" alt="" loading="lazy" />
      <h2 className="text-white font-bold arial text-[18px]">
        Withdraw fast, safe and stable
      </h2>
      <img
        src={bannergetData?.gameall?.logo1}
        className="w-[200px] h-auto mt-[70px]"
        alt="logo"
        loading="lazy"
      />
    </div>
  );
};

export default MainLoader;
