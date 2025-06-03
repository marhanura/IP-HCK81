import { useDispatch, useSelector } from "react-redux";
import Card from "../components/Card";
import { useCallback, useEffect, useState } from "react";
import { fetchDrugs } from "../features/drugs/drug.slice";
import Pagination from "../components/Pagination";
import Swal from "sweetalert2";
import { api } from "../helpers/api";
import { useNavigate, useOutletContext } from "react-router";
import Loading from "../components/Loading";
import debounce from "lodash.debounce";

export default function DrugList() {
  const { drugs, totalPages, currentPage, loading } = useSelector(
    (state) => state.drug
  );
  const dispatch = useDispatch();
  const user = useOutletContext();
  const diseaseId = localStorage.getItem("diseaseId");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  async function addDrug(drug) {
    try {
      if (!user.role) {
        Swal.fire({
          text: "Please log in first",
          icon: "error",
          timer: 1500,
        });
        navigate("/login");
      } else if (user.role === "pasien") {
        if (drug.type === "Prescription") {
          await Swal.fire({
            title: "Prescription only",
            text: "Please consult with a doctor first",
            confirmButtonText: "Consult",
            showCancelButton: true,
            cancelButtonText: "Back",
            icon: "info",
            timer: 3000,
          }).then((result) => {
            if (result.isConfirmed) {
              navigate(`/diseases/add/${user.id}`);
            }
          });
        } else {
          Swal.fire({
            icon: "success",
            text: "Drug added to your cart",
            timer: 1500,
          });
        }
      } else if (!localStorage.getItem("diseaseId")) {
        Swal.fire({
          text: "Please select a disease first",
          icon: "warning",
        });
        localStorage.setItem("drugId", drug.id);
      } else {
        await api.post(
          `/diseases/${diseaseId}/${drug.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        localStorage.removeItem("diseaseId");
        await Swal.fire({
          text: "New drug added successfully",
          icon: "success",
          timer: 1500,
        });
        navigate(`/diseases/${diseaseId}`);
      }
    } catch (error) {
      Swal.fire({
        text: error.response.data.message,
        icon: "error",
        timer: 1500,
      });
    }
  }

  const debounceSearch = useCallback(
    debounce((search, page) => {
      dispatch(fetchDrugs({ search, page }));
    }, 500),
    []
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
  };

  useEffect(() => {
    debounceSearch(search, page);
    return () => {
      debounceSearch.cancel();
    };
  }, [search, page, debounceSearch]);

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
                onChange={handleSearch}
                className="w-70"
              />
            </label>
          </div>
          <button
            className="btn btn-neutral join-item shadow-none"
            type="submit"
          >
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
              description={Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(drug.price)}
              info={drug.category}
              buttonText="Get Drug"
              onClick={() => addDrug(drug)}
            />
          ))}
        </div>
      ) : (
        <Loading />
      )}
      <div className="flex justify-center m-5">
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          setPage={setPage}
        />
      </div>
    </section>
  );
}
