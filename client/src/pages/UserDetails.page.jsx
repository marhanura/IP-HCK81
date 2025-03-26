import { useDispatch, useSelector } from "react-redux";
import { fetchDiseaseByUser } from "../features/diseases/disease.slice";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Swal from "sweetalert2";
import { api } from "../helpers/api";
import Card from "../components/Card";

export default function UserDetails() {
  const usersDisease = useSelector((state) => state.user.users);
  const dispatch = useDispatch();
  const { userId } = useParams();
  const [diseases, setDiseases] = useState([]);

  async function fetchDiseaseByUser() {
    try {
      const response = await api.get(`/diseases/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      console.log("🐄 - fetchDiseaseByUser - response:", response.data);
      setDiseases(response.data);
    } catch (error) {
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  useEffect(() => {
    fetchDiseaseByUser();
  }, []);

  return (
    <section>
      <h1>User Details</h1>

      {diseases.map((disease) => (
        <Card
          key={disease.id}
          title={disease.diagnose}
          description={`Symptoms: ${disease.symptoms}`}
          info={`Recommendation: ${disease.recommendation}`}
          buttonText="Redeem Drugs"
          linkTo={`/redeem-drugs/${disease.id}`}
          buttonText2={"See Details"}
          linkTo2={`/diseases/${disease.id}`}
        />
      ))}
    </section>
  );
}
