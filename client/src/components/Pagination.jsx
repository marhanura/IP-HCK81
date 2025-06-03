import { Link } from "react-router";

export default function Pagination({ page, totalPages, setPage }) {
  return (
    <div className="join mx-auto my-5">
      <button
        className="join-item btn text-white shadow-none bg-[#1c3d70]"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        «
      </button>
      <button className="join-item btn btn-disabled text-base-content">
        {page} of {totalPages}
      </button>
      <button
        className="join-item btn text-white shadow-none bg-[#1c3d70]"
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
      >
        »
      </button>
    </div>
  );
}
