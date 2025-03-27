import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import { useEffect, useState } from "react";
import { fetchDrugs } from "../features/drugs/drug.slice";
import Pagination from "../components/Pagination";
import Swal from "sweetalert2";
import { api } from "../helpers/api";
import { useNavigate } from "react-router";

export default function DrugList() {
  const { drugs, totalPages, currentPage } = useSelector((state) => state.drug);
  const dispatch = useDispatch();
  const diseaseId = localStorage.getItem("diseaseId");
  console.log("🐄 - DrugList - diseaseId:", diseaseId);
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  async function addDrug(drugId) {
    // e.preventDefault();
    try {
      if (diseaseId === null) {
        await navigate("/diseases");
        localStorage.setItem("drugId", drugId);
        // localStorage.removeItem("drugId");
      } else {
        const response = await api.post(
          `/diseases/${diseaseId}/${drugId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        localStorage.removeItem("diseaseId");
        console.log("🐄 - addDrug - response:", response);
        await Swal.fire({
          text: "New drug added successfully",
          icon: "success",
        });
      }
    } catch (error) {
      console.log("🐄 - addDrug - error:", error);
      // Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  useEffect(() => {
    dispatch(fetchDrugs({ search, page }));
  }, [search, page]);

  return (
    <section className="flex-row h-100 justify-center">
      <div className="m-5 text-center">
        <h1 className="text-2xl m-5">Drug Catalogue</h1>
        <div className="join">
          <div>
            <label className="input validator join-item">
              <input
                type="text"
                placeholder="Search drug name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
          <button className="btn btn-neutral join-item" type="submit">
            Search
          </button>
        </div>
      </div>
      {drugs.data ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {drugs.data.map((drug) => (
            <Card
              key={drug.id}
              title={drug.name}
              description={drug.price}
              info={drug.category}
              buttonText={
                role === "tenaga kesehatan"
                  ? "Prescribe"
                  : "Consult to be prescribed"
              }
              onClick={() => addDrug(drug.id)}
            />
          ))}
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            setPage={setPage}
          />
        </div>
      ) : (
        <span className="loading loading-spinner text-primary"></span>
      )}
    </section>
  );
}
