import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import { useState } from "react";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { api } from "../helpers/api";
import Footer from "../components/Footer";

export default function HomeLayout() {
  const [user, setUser] = useState("");
  const access_token = localStorage.getItem("access_token");

  useEffect(() => {
    if (access_token) {
      async function fetchUser() {
        try {
          const response = await api.get(`/logged-user`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          setUser(response.data);
        } catch (error) {
          Swal.fire({ text: error.response.data.message, icon: "error" });
        }
      }
      fetchUser();
    }
  }, [access_token]);

  return (
    <>
      <Navbar />
      <Outlet context={user} />
    </>
  );
}
