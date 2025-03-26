import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDiseaseById } from "../features/diseases/disease.slice";
import { Link, useParams } from "react-router";
import Swal from "sweetalert2";
import { api } from "../helpers/api";

export default function DiseaseDetail() {
  //   const disease = useSelector((state) => state.disease.diseases);
  //   const dispatch = useDispatch();
  //   console.log("🐄 - DiseaseDetail - diseaseById:", disease);
  const { diseaseId } = useParams();
  const [disease, setDisease] = useState("");

  async function fetchDiseaseById() {
    try {
      const response = await api.get(`/diseases/${diseaseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setDisease(response.data[0]);
      console.log("🐄 - fetchDiseaseById - response:", response.data[0]);
    } catch (error) {
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  useEffect(() => {
    // dispatch(fetchDiseaseById(diseaseId));
    fetchDiseaseById();
  }, []);

  return (
    <section>
      <div className="card card-border bg-base-100 w-screen card-xl">
        <div className="card-body">
          <h1>Disease Details</h1>
          <h2 className="card-title">{disease?.diagnose}</h2>
          <p>{disease?.symptoms}</p>
          <h4>Therapy Guideline:</h4>
          Medicine:
          <ul>
            {disease.DiseaseDrugs?.map((drug) => (
              <li> - {drug.Drug.name}</li>
            ))}
          </ul>
          <p>Non-medicinal: {disease?.recommendation}</p>
          <p>Pasien: {disease.User?.email}</p>
          <div className="card-actions justify-end">
            <Link to="/drugs">
              <button
                className="btn btn-primary"
                onClick={() => {
                  localStorage.setItem("diseaseId", diseaseId);
                }}
              >
                Add Drugs
              </button>
            </Link>
            <button className="btn btn-primary">Redeem Drugs</button>
          </div>
        </div>
      </div>
    </section>
  );
}
