import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import { useEffect, useState } from "react";
import { fetchDrugs } from "../features/drugs/drug.slice";
import Pagination from "../components/Pagination";
import Swal from "sweetalert2";
import { api } from "../helpers/api";
import axios from "axios";
import { useNavigate } from "react-router";

export default function DrugList() {
  const drugsList = useSelector((state) => state.drug.drugs);
  const dispatch = useDispatch();
  const diseaseId = localStorage.getItem("diseaseId");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  async function addDrug(drugId) {
    // e.preventDefault();
    try {
      if (!localStorage.getItem("diseaseId")) {
        localStorage.setItem("drugId", drugId);
        navigate("/diseases");
      }
      const response = await axios.post(
        `http://localhost:3000/diseases/${diseaseId}/${drugId}`,
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
    } catch (error) {
      console.log("🐄 - addDrug - error:", error);
      Swal.fire({ text: error.response.data.message, icon: "error" });
    }
  }

  useEffect(() => {
    dispatch(fetchDrugs());
  }, []);

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
      {drugsList.data ? (
        <div className="flex flex-wrap gap-4 justify-center">
          {drugsList.data.map((drug) => (
            <Card
              key={drug.id}
              title={drug.name}
              description={drug.price}
              info={drug.category}
              buttonText={
                role === "pasien" ? "Consult to be prescribed" : "Prescribe"
              }
              onClick={() => addDrug(drug.id)}
            />
          ))}
          <Pagination
            page={drugsList.currentPage}
            totalPages={drugsList.totalPages}
          />
        </div>
      ) : (
        <span className="loading loading-spinner text-primary"></span>
      )}
    </section>
  );
}
