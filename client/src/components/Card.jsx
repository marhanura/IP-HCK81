import { Link } from "react-router";

export default function Card({
  title,
  description,
  info,
  buttonText,
  linkTo,
  onClick,
  buttonText2,
  linkTo2,
}) {
  return (
    <div className="card bg-base-100 w-96 card-border">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
        <p>{info}</p>
        <div className="card-actions justify-end">
          <Link to={linkTo}>
            <button
              className={`btn shadow-none ${
                buttonText === "Drugs Redeemed" ? "btn-disabled" : "btn-accent"
              }`}
              onClick={onClick}
            >
              {buttonText}
            </button>
          </Link>
          {buttonText2 ? (
            <Link to={linkTo2}>
              <button className="btn btn-secondary">{buttonText2}</button>
            </Link>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}
