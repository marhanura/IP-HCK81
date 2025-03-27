import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDiseaseById } from "../features/diseases/disease.slice";
import { Link, useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import { api } from "../helpers/api";

export default function DiseaseDetail() {
  //   const disease = useSelector((state) => state.disease.diseases);
  //   const dispatch = useDispatch();
  //   console.log("🐄 - DiseaseDetail - diseaseById:", disease);
  const { diseaseId } = useParams();
  const [disease, setDisease] = useState("");
  const navigate = useNavigate();

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

  async function redeemDrugs() {
    try {
      const response = await api.get(`/redeem-drugs/${diseaseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log("🐄 - redeemDrugs - response:", response.data);
      window.snap.pay(response.data.midtransToken, {
        onSuccess: async function (result) {
          console.log("🐄 - redeemDrugs - result:", result);
          Swal.fire({
            text: "Payment success",
            icon: "success",
          });
          const updateStatus = await api.patch(
            `/redeem-drugs/${diseaseId}`,
            {
              status: "redemeed",
              paymentStatus: "paid",
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            }
          );
          console.log("🐄 - updateStatus:", updateStatus);
          navigate("/");
        },
      });
    } catch (error) {
      console.log("🐄 - redeemDrugs - error:", error);
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  async function deleteDisease(e) {
    e.preventDefault();
    Swal.fire({
      text: "Are you sure you want to delete disease?",
      icon: "question",
      showCancelButton: true,
    })
      .then((result) => {
        if (result.isConfirmed) {
          api.delete(`/diseases/${diseaseId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          Swal.fire({ text: "Disease deleted successfully", icon: "success" });
          navigate("/diseases");
        }
      })
      .catch((error) => {
        Swal.fire({ text: error.response.data.message, icon: "error" });
      });
  }

  return (
    <section className="flex justify-center p-5">
      <div className="card card-border bg-base-100 w-200 card-xl">
        <div className="card-body">
          <p className="text-xs">Disease Details</p>
          <h2 className="card-title">{disease?.diagnose}</h2>
          <p>
            <strong>Symptoms:</strong> {disease?.symptoms}
          </p>
          <h4>
            <strong>Therapy Guideline:</strong>
          </h4>
          <u>Medicine:</u>
          <ul>
            {disease.DiseaseDrugs?.map((drug) => (
              <li key={drug.Drug.id}> - {drug.Drug.name}</li>
            ))}
          </ul>
          <p>
            <u>Non-medicinal:</u> {disease?.recommendation}
          </p>
          <p>
            <strong>Pasien:</strong> {disease.User?.username}
          </p>
          <div className="card-actions justify-end">
            <Link to="/drugs">
              <button
                className="btn btn-primary"
                onClick={() => {
                  localStorage.setItem("diseaseId", disease.id);
                }}
              >
                Add Drugs
              </button>
            </Link>
            <button className="btn btn-secondary" onClick={redeemDrugs}>
              Redeem Drugs
            </button>
            <button className="btn btn-danger" onClick={deleteDisease}>
              Redeem Drugs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
