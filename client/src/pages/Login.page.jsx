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
      Swal.fire({ text: "Logged in successfully", icon: "success" });
      navigate("/");
    } catch (error) {
      console.log("🐄 - handleLogin - error:", error);
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  async function handleCredentialResponse(response) {
    try {
      const { data } = await api.post("/google-login", {
        data: { googleToken: response.credential },
      });
      console.log("🐄 - handleCredentialResponse - response:", data);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("role", data.user.role);
      Swal.fire({ text: "Logged in successfully", icon: "success" });
      navigate("/");
    } catch (error) {
      Swal.fire({ text: error.response.data.message, icon: "error" });
      console.log("🐄 - handleCredentialResponse - error:", error);
    }
  }

  useEffect(() => {
    google.accounts.id.initialize({
      client_id:
        "991430132724-83n0i0enfhahr81cet402tsheob8up74.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(
      document.getElementById("google-login-button"),
      { theme: "outline", size: "large" } // customization attributes
    );
    google.accounts.id.prompt(); // also display the One Tap dialog
  }, []);

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Login now!</h1>
          <img src={SideImage} alt="Side Image" width="70%" />
        </div>
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <div className="card-body">
            <fieldset className="fieldset">
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
              <div id="google-login-button"></div>
              <p>
                Don't have an account? <a href="/register">Create an account</a>
              </p>
            </fieldset>
          </div>
        </div>
      </div>
    </div>

    // <section className="flex flex-wrap items-center justify-center h-screen">
    //   <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
    //     <legend className="fieldset-legend">Login</legend>
    //     <form onSubmit={handleLogin}>
    //       <label className="fieldset-label">Email</label>
    //       <input
    //         type="email"
    //         className="input"
    //         placeholder="Email"
    //         name="email"
    //         value={email}
    //         onChange={(e) => setEmail(e.target.value)}
    //       />

    //       <label className="fieldset-label">Password</label>
    //       <input
    //         type="password"
    //         className="input"
    //         placeholder="Password"
    //         name="password"
    //         value={password}
    //         onChange={(e) => setPassword(e.target.value)}
    //       />

    //       <button className="btn btn-neutral mt-4" type="submit">
    //         Log In
    //       </button>
    //     </form>
    //     <p>
    //       Don't have an account? <a href="/register">Create an account</a>
    //     </p>
    //   </fieldset>
    //   <img src={SideImage} alt="Side Image" width="30%" />
    // </section>
  );
}
