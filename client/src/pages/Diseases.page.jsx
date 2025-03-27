import { fetchDiseases } from "../features/diseases/disease.slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

export default function DiseasesPage() {
  const diseasesList = useSelector((state) => state.disease.diseases);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");

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

  useEffect(() => {
    dispatch(fetchDiseases(filter));
  }, [dispatch, filter]);

  return (
    <section className="flex-row h-100 justify-center">
      <div className="text-center">
        <h1 className="text-2xl m-5 text-center">Diseases List</h1>
        <select
          className="select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="" disabled>
            Filter by status
          </option>
          <option value="">All Status</option>
          <option value="not redeemed">Not redemeed</option>
          <option value="redeemed">Redemeed</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-4 justify-center m-5">
        {diseasesList.length > 0 ? (
          <>
            {diseasesList.map((disease) => (
              <Card
                key={disease.id}
                title={disease.diagnose}
                description={`Symptoms: ${disease.symptoms}`}
                info={`Recommendation: ${disease.recommendation}`}
                buttonText={"See Details"}
                linkTo={`/diseases/${disease.id}`}
              />
            ))}
          </>
        ) : (
          <p>No diseases available</p>
        )}
      </div>
    </section>
  );
}
