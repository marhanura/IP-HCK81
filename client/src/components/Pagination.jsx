import { Link } from "react-router";

export default function Pagination({ page, totalPages, setPage }) {
  return (
    <div className="join">
      <button
        className="join-item btn"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        «
      </button>
      <button className="join-item btn" disabled>
        {page} of {totalPages}
      </button>
      <button
        className="join-item btn"
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
      >
        »
      </button>
    </div>
  );
}
