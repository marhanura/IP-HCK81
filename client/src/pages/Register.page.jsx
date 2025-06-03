import SideImage from "../assets/drugs-image.png";
import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import { api } from "../helpers/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  async function handleRegister(e) {
    e.preventDefault();
    try {
      await api.post(
        "/register",
        { username, email, password, role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      Swal.fire({ text: "Register successful", icon: "success", timer: 2000 });
      navigate("/login");
    } catch (error) {
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  return (
    <section className="flex flex-wrap items-center justify-center h-screen gap-10">
      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend">Register</legend>
        <form onSubmit={handleRegister}>
          <label className="fieldset-label">Username</label>
          <input
            type="username"
            className="input"
            placeholder="Username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label className="fieldset-label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="fieldset-label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="input"
              placeholder="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={togglePassword}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          <label className="fieldset-label">Role</label>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="select"
          >
            <option value="" disabled>
              Choose your role
            </option>
            <option value="tenaga kesehatan">Health Worker</option>
            <option value="pasien">Patient</option>
          </select>
          <button className="btn btn-neutral mt-4 w-full">
            Create Account
          </button>
        </form>
        <p className="text-center">
          Already have an account?{" "}
          <a href="/login" className="font-bold">
            Log in
          </a>
        </p>
      </fieldset>
      <img src={SideImage} alt="Side Image" width="30%" />
    </section>
  );
}
