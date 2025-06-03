import { fetchDiseases } from "../features/diseases/disease.slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import Loading from "../components/Loading";

export default function DiseasesPage() {
  const diseasesList = useSelector((state) => state.disease.diseases);
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("");

  useEffect(() => {
    dispatch(fetchDiseases(filter));
  }, [dispatch, filter]);

  return (
    <section className="flex-row h-100 justify-center pt-25">
      <div className="text-center">
        <h1 className="text-2xl m-5 text-center">Diagnoses List</h1>
        <select
          className="select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="" disabled>
            Filter by status
          </option>
          <option value="">All Status</option>
          <option value="not redeemed">Not redeemed</option>
          <option value="redeemed">Redeemed</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-4 justify-center m-5">
        {diseasesList ? (
          diseasesList.length > 0 ? (
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
            <div className="text-center">No diagnoses yet.</div>
          )
        ) : (
          <Loading />
        )}
      </div>
    </section>
  );
}
