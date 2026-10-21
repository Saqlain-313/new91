import { IoIosArrowBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const CustomeNavbar = ({ name, details, link, logo }) => {
  const { bannergetData } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const handle = () => {
    navigate(-1);
  };
  return (
    <>
      <div className="nav-bg p-1 py-3 sticky top-0 z-10">
        <div className="container-section flex  items-center relative">
          <button className="absolute ">
            <Link onClick={handle}>
              {" "}
              <IoIosArrowBack className="text-xl text-whites" />
            </Link>
          </button>
          {name && (
            <h1 className="heading-h1 whites text-center flex justify-center items-center m-auto">
              {name}
            </h1>
          )}
          {logo && (
            <div className="text-center flex justify-center items-center m-auto">
              <img
                src={bannergetData?.gameall?.logo1}
                alt=""
                className="w-28"
              />
            </div>
          )}

          {details && (
            <p className="absolute right-1">
              <Link className="fs-sm whites" to={link}>
                {details}
              </Link>
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomeNavbar;
