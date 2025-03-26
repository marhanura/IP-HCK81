import { fetchDiseases } from "../features/diseases/disease.slice";
import Pagination from "../components/Pagination";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import { Link } from "react-router";

export default function DiseasesPage() {
  const diseasesList = useSelector((state) => state.disease.diseases);
  console.log("🐄 - DiseasesPage - diseasesList:", diseasesList);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDiseases());
  }, []);

  return (
    <section className="flex flex-wrap h-100 justify-center">
      <div>
        <h1 className="text-2xl m-5 text-center">Diseases List</h1>
        <select className="select">
          <option value="" disabled>
            Sort by date
          </option>
          <option value="asc">Oldest</option>
          <option value="desc">Newest</option>
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
          <span className="loading loading-spinner text-primary"></span>
        )}
      </div>
    </section>
  );
}
