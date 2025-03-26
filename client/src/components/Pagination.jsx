import { Link } from "react-router";

export default function Pagination({ page, totalPages, setPage }) {
  return (
    <div className="join">
      <button className="join-item btn">
        <Link
          className={`page-link text-danger ${page === 1 ? "disabled" : ""}`}
          onClick={() => {
            setPage(page - 1);
          }}
        >
          <span aria-hidden="true">«</span>
        </Link>
      </button>
      <button className="join-item btn">
        {page} of {totalPages}
      </button>
      <button className="join-item btn">
        <Link
          className={`page-link text-danger ${
            page === totalPages ? "disabled" : ""
          }`}
          disabled={page === totalPages ? true : false}
          onClick={() => {
            setPage(page + 1);
          }}
        >
          <span aria-hidden="true">»</span>
        </Link>
      </button>
    </div>
  );
}
