import { Outlet, useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { useState } from "react";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { api } from "../helpers/api";

export default function AuthLayout() {
  const [user, setUser] = useState("");
  const navigate = useNavigate();
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
          console.log("🐄 - fetchUser - response:", response);
          setUser(response.data);
        } catch (error) {
          Swal.fire({
            text: error.response.data.message,
            icon: "error",
            timer: 1500,
          });
        }
      }
      fetchUser();
    } else {
      navigate("/login");
    }
  }, [access_token]);

  return (
    <>
      <Navbar />
      <Outlet context={user} />
    </>
  );
}
