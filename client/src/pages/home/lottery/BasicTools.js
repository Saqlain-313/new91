import Cookies from "js-cookie";
import { Link } from "react-router-dom";
const BasicTools = () => {
  const token = Cookies.get("auth");
  const tools = [
    { name: "Language", icon: "🌐", bgColor: "bg-green-500", link: "#" },
    {
      name: "Notification",
      icon: "📢",
      bgColor: "bg-orange-500",
      link: "/main/Notification",
    },
    {
      name: "24/7Customer service",
      icon: "👤",
      bgColor: "bg-blue-500",
      link: `https://h5.workorder.support.max-win.site/?token=${token}`,
    },
    { name: "Beginner's Guide", icon: "📖", bgColor: "bg-red-500", link: "#" },
    {
      name: "About us",
      icon: "ℹ️",
      bgColor: "bg-blue-400 ",
      link: "/main/About",
    },
  ];

  return (
    <div className=" flex justify-center items-center object-cover ">
      <div className="rounded-lg p-4 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-whites mb-4 flex items-center">
          <span className="border-after mt-2 text-whites text-lg">
            Basic Tools
          </span>
        </h2>
        <div className="bg-blues items-center grid grid-cols-3 gap-4 p-4 rounded object-fill">
          {tools.map((tool, index) => (
            <Link
              key={index}
              to={tool.link}
              className="flex flex-col  items-center justify-center h-20 w-full p-2  rounded object-cover  "
            >
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full text-2xl ${tool.bgColor}`}
              >
                {tool.icon}
              </div>
              <p className="text-sm font-medium text-whites mt-2 text-center">
                {tool.name}
              </p>
            </Link>
          ))}
          <a
            href="/app.apk"
            download
            className="flex flex-col  items-center justify-center h-20 w-full p-2  rounded object-cover  "
          >
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-full text-2xl bg-teal-500`}
            >
              📥
            </div>
            <p className="text-sm font-medium text-whites mt-2 text-center">
              Download APP
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default BasicTools;
