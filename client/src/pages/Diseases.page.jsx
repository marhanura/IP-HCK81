import { fetchDiseases } from "../features/diseases/disease.slice";
import Pagination from "../components/Pagination";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import { Link } from "react-router";

export default function DiseasesPage() {
  const diseasesList = useSelector((state) => state.disease.diseases);
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("");

  useEffect(() => {
    dispatch(fetchDiseases());
  }, [filter]);

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
          <option value="not redemeed">Not redemeed</option>
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
                buttonText="Redeem Drugs"
                linkTo={`/redeem-drugs/${disease.id}`}
                buttonText2={"See Details"}
                linkTo2={`/diseases/${disease.id}`}
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
