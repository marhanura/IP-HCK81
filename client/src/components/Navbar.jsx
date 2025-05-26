import Swal from "sweetalert2";
import Logo from "../assets/zehat-logo.png";
import { useNavigate } from "react-router";
import { api } from "../helpers/api";
import { useState } from "react";
import { useEffect } from "react";

export default function Navbar() {
  const [user, setUser] = useState("");
  const access_token = localStorage.getItem("access_token");
  const navigate = useNavigate();

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

  useEffect(() => {
    if (access_token) {
      fetchUser();
    }
  }, [access_token]);

  async function handleLogout(e) {
    e.preventDefault();
    Swal.fire({
      text: "Are you sure you want to log out?",
      icon: "question",
      showCancelButton: true,
    })
      .then((result) => {
        if (result.isConfirmed) {
          localStorage.clear();
          Swal.fire({
            text: "Logged out successfully",
            icon: "success",
            timer: 1500,
          });
          fetchUser();
          navigate("/");
        }
      })
      .catch((error) => {
        console.log("🐄 - handleLogout - error:", error);
        Swal.fire({ text: error.response.data.message, icon: "error" });
      });
  }

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1 pl-3">
        <a href="/">
          <img src={Logo} alt="Zehat Logo" className="h-10" />
        </a>
      </div>
      <div className="flex-none z-25">
        <ul className="menu menu-horizontal px-1">
          <ul className="menu menu-horizontal px-1">
            <li>
              <a href="/drugs">Drugs Catalogue</a>
            </li>
            {user.role === "tenaga kesehatan" && (
              <>
                <li>
                  <a href="/diseases">Diagnoses</a>
                </li>
                <li>
                  <a href="/users">Patients</a>
                </li>
              </>
            )}
            <li>
              {access_token ? (
                <details>
                  <summary>Hello, {user.username}!</summary>
                  <ul className="bg-base-100 rounded-t-none p-2 right-0">
                    <li>
                      <a href={`/diseases/users/${user.id}`}>My Page</a>
                    </li>
                    <li>
                      <a href="/logout" onClick={handleLogout}>
                        Log Out
                      </a>
                    </li>
                  </ul>
                </details>
              ) : (
                <a href="/login">Log In</a>
              )}
            </li>
          </ul>
        </ul>
      </div>
    </div>
  );
}
