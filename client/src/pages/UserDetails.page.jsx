import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import { api } from "../helpers/api";
import Card from "../components/Card";

export default function UserDetails() {
  const { userId } = useParams();
  const [user, setUser] = useState("");
  const [diseases, setDiseases] = useState([]);
  const navigate = useNavigate();

  async function fetchDiseaseByUser() {
    try {
      const response = await api.get(`/diseases/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setUser(response.data);
      setDiseases(response.data.Diseases);
    } catch (error) {
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  async function deleteUser(e) {
    e.preventDefault();
    Swal.fire({
      text: "Are you sure you want to delete user?",
      icon: "question",
      showCancelButton: true,
    })
      .then((result) => {
        if (result.isConfirmed) {
          api.delete(`/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          Swal.fire({ text: "User deleted successfully", icon: "success" });
          navigate("/");
        }
      })
      .catch((error) => {
        Swal.fire({ text: error.response.data.message, icon: "error" });
      });
  }

  useEffect(() => {
    fetchDiseaseByUser();
  }, []);

  async function redeemDrugs(diseaseId) {
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
              status: "redeemed",
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

  return (
    <section className="flex-row h-100 justify-center">
      <div className="text-center">
        <h1 className="text-2xl m-5 text-center">User Details</h1>
        <p>{user.username}</p>
        <p>{user.email}</p>
        <button className="btn btn-secondary" onClick={deleteUser}>
          Delete
        </button>
      </div>
      <div className="flex flex-wrap gap-4 justify-center m-5">
        {diseases?.map((disease) => (
          <Card
            key={disease.id}
            title={disease.diagnose}
            description={`Symptoms: ${disease.symptoms}`}
            info={`Recommendation: ${disease.recommendation}`}
            buttonText="Redeem Drugs"
            onClick={() => redeemDrugs(disease.id)}
            buttonText2={"See Details"}
            linkTo2={`/diseases/${disease.id}`}
          />
        ))}
      </div>
    </section>
  );
}
