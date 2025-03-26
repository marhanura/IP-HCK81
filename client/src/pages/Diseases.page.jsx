import { fetchDiseases } from "../features/diseases/disease.slice";
import Pagination from "../components/Pagination";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DiseasesPage() {
  const diseasesList = useSelector((state) => state.disease.diseases);
  console.log("🐄 - DiseasesPage - diseasesList:", diseasesList);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDiseases());
  }, []);

  return (
    <section>
      <div className="flex flex-wrap gap-4">
        {/* {console.log(diseasesList.data)} */}
        {/* {drugsList.data ? (
          <>
            {drugsList.data.map((drug) => (
              <Card key={drug.id} data={drug} />
            ))}
            <Pagination
              page={drugsList.currentPage}
              totalPages={drugsList.totalPages}
            />
          </>
        ) : (<span className="loading loading-spinner text-primary"></span>
        )} */}
      </div>
    </section>
  );
}
