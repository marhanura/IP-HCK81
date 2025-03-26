import Swal from "sweetalert2";
import Logo from "../assets/zehat-logo.png";
import { useNavigate } from "react-router";

export default function Navbar() {
  const access_token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

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
          Swal.fire({ text: "Logged out successfully", icon: "success" });
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
      <div className="flex-1">
        <a className="btn btn-ghost text-xl" href="/">
          <img src={Logo} alt="Zehat Logo" className="h-10" />
        </a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {role === "tenaga kesehatan" ? (
            <>
              <li>
                <a href="/diseases">Diagnoses</a>
              </li>
              <li>
                <a href="/users">Users</a>
              </li>
              <li>
                <a href="/drugs">Drugs List</a>
              </li>
            </>
          ) : (
            <li>
              <a href="/drugs">Drugs List</a>
            </li>
          )}
          <li>
            {access_token ? (
              <a href="/logout" onClick={handleLogout}>
                Log Out
              </a>
            ) : (
              <a href="/login">Log In</a>
            )}
          </li>
          {/* <li>
            <details>
              <summary>Parent</summary>
              <ul className="bg-base-100 rounded-t-none p-2">
                <li>
                  <a>Link 1</a>
                </li>
                <li>
                  <a>Link 2</a>
                </li>
              </ul>
            </details>
          </li> */}
        </ul>
      </div>
    </div>
  );
}
