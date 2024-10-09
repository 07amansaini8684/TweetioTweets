import { useState } from "react";
// react router dom
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignupPage from "./pages/auth/signup/SignupPage";
import LoginPage from "./pages/auth/log/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notifications/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
// react hot toast
import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const {
    data: authUser,
    isLoading,
    isError,
    error,
  } = useQuery({
    // we use queryKey to give a unique name to our query and refer to it later 
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if(data.message) return null
        // check the res
        if (!res.ok || data.error) {
          throw new Error(data.message || "Something went wrong");
        }
        // console.log("authUser data", data);
        return data;
      } catch (error) {
        // console.error(error);
        // toast.error("Are you loggedIn");
        throw new Error(error);
      }
    },
    retry : false,
  });
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl mx-auto">
      {/* // anyting outside the routes is a common components */}
    { authUser && < Sidebar />}
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/notifications"
          element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
