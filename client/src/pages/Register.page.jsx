import SideImage from "../assets/drugs-image.png";
import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import { api } from "../helpers/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    try {
      const response = await api.post(
        "/register",
        { email, password, role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      console.log("🐄 - handleRegister - response:", response);
      Swal.fire({ text: "New user added successfully", icon: "success" });
      navigate("/login");
    } catch (error) {
      console.log("🐄 - handleRegister - error:", error);
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  return (
    <section className="flex flex-wrap items-center justify-center h-screen">
      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend">Register</legend>
        <form onSubmit={handleRegister}>
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
          <input
            type="password"
            className="input"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
            <option value="tenaga kesehatan">Tenaga Kesehatan</option>
            <option value="pasien">Pasien</option>
          </select>
          <button className="btn btn-neutral mt-4 w-full">
            Create Account
          </button>
        </form>
        <p className="text-center">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </fieldset>
      <img src={SideImage} alt="Side Image" width="30%" />
    </section>
  );
}
