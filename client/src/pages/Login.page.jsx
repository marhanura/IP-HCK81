import SideImage from "../assets/drugs-image.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { api } from "../helpers/api";
import axios from "axios";

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
      Swal.fire({ text: "Logged in successfully", icon: "success" });
      navigate("/");
    } catch (error) {
      console.log("🐄 - handleLogin - error:", error);
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  // async function handleCredentialResponse(response) {
  //   try {
  //     const { data } = await api.post("/google-login", {
  //       data: { googleToken: response.credential },
  //     });
  //     console.log("🐄 - handleCredentialResponse - response:", data);
  //     localStorage.setItem("access_token", data.access_token);
  //     localStorage.setItem("role", data.user.role);
  //     Swal.fire({ text: "Logged in successfully", icon: "success" });
  //     navigate("/");
  //   } catch (error) {
  //     Swal.fire({ text: error.response.data.message, icon: "error" });
  //     console.log("🐄 - handleCredentialResponse - error:", error);
  //   }
  // }

  // useEffect(() => {
  //   google.accounts.id.initialize({
  //     client_id:
  //       "991430132724-83n0i0enfhahr81cet402tsheob8up74.apps.googleusercontent.com",
  //     callback: handleCredentialResponse,
  //   });
  //   google.accounts.id.renderButton(
  //     document.getElementById("google-login-button"),
  //     { theme: "outline", size: "large" } // customization attributes
  //   );
  //   google.accounts.id.prompt(); // also display the One Tap dialog
  // }, []);

  useEffect(() => {
    // Initialize the Google Sign-In button
    google.accounts.id.initialize({
      client_id:
        "991430132724-83n0i0enfhahr81cet402tsheob8up74.apps.googleusercontent.com",
      callback: async (response) => {
        console.log("Encoded JWT ID token: " + response.credential);

        const { data } = await axios.post(
          "http://localhost:3000/google-login",
          {
            googleToken: response.credential,
          }
        );
        localStorage.setItem("access_token", data.access_token);
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

          <button className="btn btn-neutral mt-4" type="submit">
            Log In
          </button>
        </form>
        <button className="btn bg-white text-black border-[#e5e5e5]">
          <svg
            aria-label="Google logo"
            width="16"
            height="16"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <g>
              <path d="m0 0H512V512H0" fill="#fff"></path>
              <path
                fill="#34a853"
                d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
              ></path>
              <path
                fill="#4285f4"
                d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
              ></path>
              <path
                fill="#fbbc02"
                d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
              ></path>
              <path
                fill="#ea4335"
                d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
              ></path>
            </g>
          </svg>
          Login with Google
        </button>
        <div id="google-login-button"></div>
        <p>
          Don't have an account? <a href="/register">Create an account</a>
        </p>
      </fieldset>
      <img src={SideImage} alt="Side Image" width="30%" />
    </section>
  );
}
