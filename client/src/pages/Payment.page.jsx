import { useNavigate, useParams } from "react-router";
import { api } from "../helpers/api";
import Swal from "sweetalert2";
import axios from "axios";

export default function PaymentPage() {
  const { diseaseId } = useParams();
  const navigate = useNavigate();

  async function redeemDrugs() {
    try {
      const response = await api.get(`/redeem-drugs/${diseaseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log("🐄 - redeemDrugs - response:", response.data);
      window.snap.pay(response.data.midtransToken, {
        onSuccess: function (result) {
          console.log("🐄 - redeemDrugs - result:", result);
          Swal.fire({
            text: "Payment success",
            icon: "success",
          });
          // axios.patch(
          //   "http://localhost:3000/redeem-drugs/1",
          //   {
          //     redeemStatus: "redemeed",
          //     paymentStatus: "paid",
          //   },
          //   {
          //     headers: {
          //       Authorization:
          //         "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzQyOTY3MTE0fQ.aN90Pxnstf4BBCy9GMUzgc666ZD_qT8DgTugayjmmtM",
          //     },
          //   }
          // );
          navigate("/");
        },
      });
    } catch (error) {
      console.log("🐄 - redeemDrugs - error:", error);
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  return (
    <section>
      <div>
        <h1>Payment Page</h1>
        <button className="btn btn-primary" onClick={redeemDrugs}>
          Redeem Drug
        </button>
      </div>
    </section>
  );
}
