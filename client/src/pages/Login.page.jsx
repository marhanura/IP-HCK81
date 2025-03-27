import SideImage from "../assets/drugs-image.png";
import { useEffect, useState } from "react";
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
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("userId", response.data.id);
      Swal.fire({ text: "Logged in successfully", icon: "success" });
      navigate("/");
    } catch (error) {
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  useEffect(() => {
    google.accounts.id.initialize({
      client_id:
        "991430132724-83n0i0enfhahr81cet402tsheob8up74.apps.googleusercontent.com",
      callback: async (response) => {
        console.log("Encoded JWT ID token: " + response.credential);

        const { data } = await api.post("/google-login", {
          googleToken: response.credential,
        });
        localStorage.setItem("access_token", data.access_token);
        navigate("/");
      },
    });

    google.accounts.id.renderButton(
      document.getElementById("google-login-button"),
      { theme: "outline", size: "large" }
    );
    google.accounts.id.prompt();
  }, []);

  return (
    <section className="flex flex-wrap items-center justify-center h-screen">
      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend">Log In</legend>
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

          <button className="btn btn-neutral mt-4 w-full" type="submit">
            Log In
          </button>
        </form>
        <div
          id="google-login-button"
          className="w-full flex justify-center"
        ></div>
        <p className="text-center">
          Don't have an account? <a href="/register">Create an account</a>
        </p>
      </fieldset>
      <img src={SideImage} alt="Side Image" width="30%" />
    </section>
  );
}
