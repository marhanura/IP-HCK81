import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import { useEffect } from "react";
import { fetchDrugs } from "../features/drugs/drug.slice";
import Pagination from "../components/Pagination";

export default function DrugList() {
  const drugsList = useSelector((state) => state.drug.drugs);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDrugs());
  }, []);

  return (
    <section>
      <div className="flex flex-wrap gap-4">
        {drugsList.data ? (
          <>
            {drugsList.data.map((drug) => (
              <Card
                key={drug.id}
                title={drug.name}
                description={drug.price}
                buttonText={drug.category}
              />
            ))}
            <Pagination
              page={drugsList.currentPage}
              totalPages={drugsList.totalPages}
            />
          </>
        ) : (
          <span className="loading loading-spinner text-primary"></span>
        )}
      </div>
    </section>
  );
}
