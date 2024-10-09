import XSvg from "../svgs/X";

import { HiMiniHome } from "react-icons/hi2";
import { VscBellDot } from "react-icons/vsc";
import { FaUserAstronaut } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Sidebar = () => {
  const queryClient = useQueryClient();

  // use mutation
  const {
    mutate: logout,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Something went wrong");
        }
      } catch (error) {
        console.error(error);
        throw new Error(error);
      }
    },
    onSuccess: () => {
      // make toast
      toast.success("Logged out successfully");
      //refetching the authuser
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // getting data from the authUser which we are taking by the useQuery
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  //   console.log("this is the data", data)

  return (
    <div className="md:flex-[2_2_0] w-18 max-w-52">
      <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full">
        <Link to="/" className="flex justify-center md:justify-start">
          <XSvg className="p-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
        </Link>
        <ul className="flex flex-col gap-3 mt-4">
          <li className="flex w-full justify-center md:justify-start">
            <Link
              to="/"
              className="flex w-full gap-3 items-center hover:bg-zinc-800 transition-all rounded-md duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <HiMiniHome className="w-7 h-7" />
              <span className="text-lg hidden md:block">Home</span>
            </Link>
          </li>
          <li className="flex w-full justify-center md:justify-start">
            <Link
              to="/notifications"
              className="flex gap-3 items-center hover:bg-zinc-800 transition-all rounded-md duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <VscBellDot className="w-6 h-6" />
              <span className="text-lg hidden md:block">Notifications</span>
            </Link>
          </li>

          <li className="flex w-full justify-center md:justify-start">
            <Link
              to={`/profile/${authUser?.username}`}
              className="flex gap-3 items-center hover:bg-zinc-800 transition-all rounded-md duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <FaUserAstronaut className="w-6 h-6" />
              <span className="text-lg hidden md:block">Profile</span>
            </Link>
          </li>
        </ul>
        {authUser && (
          <Link
            to={`/profile/${authUser.username}`}
            className="mt-auto mb-10 mr-2 ml-2 flex items-center gap-2 transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-md"
          >
            <div className="avatar hidden md:inline-flex">
              <div className="w-8 rounded-md">
                <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
              </div>
            </div>
            <div className="flex items-center justify-between flex-1">
              <div className="hidden md:block">
                <p className="text-white font-bold text-sm w-20 truncate">
                  {authUser?.fullName}
                </p>
                <p className="text-slate-500 text-sm">@{authUser?.username}</p>
              </div>
              <BiLogOut
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
