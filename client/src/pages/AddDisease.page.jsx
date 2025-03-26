import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router";
import { api } from "../helpers/api";

export default function AddDisease() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const { userId } = useParams();

  async function addDisease(e) {
    e.preventDefault();
    try {
      const response = await api.post(
        `/diseases/add/${userId}`,
        { symptoms },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      Swal.fire({
        text: "New diagnose generated successfully",
        icon: "success",
      });
      navigate(`/diseases/${response.data.id}`);
    } catch (error) {
      console.log("🐄 - addDisease - error:", error);
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  return (
    <section className="flex flex-wrap items-center justify-center h-screen">
      <fieldset className="fieldset w-xl bg-base-200 border border-base-300 p-4 rounded-box">
        <legend className="fieldset-legend">Generate New Disease</legend>
        <form
          onSubmit={addDisease}
          className="flex flex-col gap-2 items-center"
        >
          <textarea
            type="text"
            className="input w-full h-30"
            placeholder="Enter your symptoms"
            name="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <button className="btn btn-neutral mt-4 w-80">Diagnose</button>
        </form>
      </fieldset>
    </section>
  );
}
