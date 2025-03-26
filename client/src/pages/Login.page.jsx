import SideImage from "../assets/drugs-image.png";
import { useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { api } from "../helpers/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    try {
      e.preventDefault();
      const response = await api.post("/login", { email, password });
      console.log(response.data.access_token, "<< ini access token");
      localStorage.setItem("access_token", response.data.access_token);
      Swal.fire({ text: "Logged in successfully", icon: "success" });
      navigate("/");
    } catch (error) {
      Swal.fire({ text: error.response.data.message, icon: "error" });
      console.log(error, "<< error di login");
    }
  }

  return (
    <section className="flex flex-wrap items-center justify-center h-screen">
      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend">Login</legend>
        <form onSubmit={handleLogin}>
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

          <button className="btn btn-neutral mt-4" type="submit">
            Log In
          </button>
        </form>
        <p>
          Don't have an account? <a href="/register">Create an account</a>
        </p>
      </fieldset>
      <img src={SideImage} alt="Side Image" width="30%" />
    </section>
  );
}
