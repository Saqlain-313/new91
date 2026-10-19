import { useSelector } from "react-redux";
import loader from "../assets/loader.png";
const Loader = () => {
  const { bannergetData } = useSelector((state) => state.user);
  return (
    <>
      <div className="loader z-50" role="status">
        <div className="outer-layer rounded-full">
          {" "}
          <img src={loader} alt="" className="h-full w-full imgs" />
        </div>

        <img src={bannergetData?.gameall?.logo1} alt="" className="imgs2" />
      </div>
    </>
  );
};

export default Loader;
