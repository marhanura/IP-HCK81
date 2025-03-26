import { Navigate, Outlet } from "react-router";
import Navbar from "../components/Navbar";

export default function LoginLayout() {
  const access_token = localStorage.getItem("access_token");

  if (access_token) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
