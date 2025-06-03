import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import { api } from "../helpers/api";

export default function DiseaseDetail() {
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
    } catch (error) {
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  useEffect(() => {
    fetchDiseaseById();
  }, []);

  async function redeemDrugs() {
    try {
      const response = await api.get(`/redeem-drugs/${diseaseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      window.snap.pay(response.data.midtransToken, {
        onSuccess: async function () {
          Swal.fire({
            text: "Payment success",
            icon: "success",
            timer: 3000,
          });
          await api.patch(
            `/redeem-drugs/${diseaseId}`,
            {
              status: "redeemed",
              paymentStatus: "paid",
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            }
          );
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
      .then(async (result) => {
        if (result.isConfirmed) {
          await api.delete(`/diseases/${diseaseId}`, {
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
    <section className="min-h-screen grid place-items-center bg-base-100 -mt-15">
      <div className="card card-border bg-[#1c3d70] text-base-100 w-200 card-xl">
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
            <strong>Patient:</strong> {disease.User?.username}
          </p>
          <div className="card-actions justify-end">
            {disease?.status === "redeemed" ? (
              <button className="btn bg-base-100 shadow-none hover:cursor-default hover:opacity-100 hover:bg-base-100">
                Drugs Redeemed
              </button>
            ) : (
              <>
                <Link to="/drugs">
                  <button
                    className="btn btn-primary shadow-none"
                    onClick={() => {
                      localStorage.setItem("diseaseId", disease.id);
                    }}
                  >
                    Add Drugs
                  </button>
                </Link>
                <button
                  className="btn btn-secondary shadow-none"
                  onClick={redeemDrugs}
                >
                  Redeem Drugs
                </button>
              </>
            )}

            <button
              className="btn bg-[#f16634] text-base-100 shadow-none border-none"
              onClick={deleteDisease}
            >
              Delete Disease
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
