import { Link } from "react-router";
import Image1 from "../assets/main-image-1.png";
import Image2 from "../assets/main-image-2.png";

export default function HomePage() {
  const userId = localStorage.getItem("userId");

  return (
    <div className="flex w-full flex-col lg:flex-row my-5">
      <div className="card bg-base-200 rounded-box grid h-100 grow place-items-center m-5">
        <h1 className="text-2xl m-5 text-center">Consult to Our Doctor</h1>
        <Link to={userId ? `/diseases/add/${userId}` : `/login`}>
          <img src={Image1} alt="Main Image 1" className="h-80" />
        </Link>
      </div>
      <div className="divider lg:divider-horizontal"></div>
      <div className="card bg-base-200 rounded-box grid h-100 grow place-items-center m-5">
        <Link to="/drugs">
          <h1 className="text-2xl m-5 text-center">See Our Drug Catalogue</h1>
          <img src={Image2} alt="Main Image 2" className="h-80" />
        </Link>
      </div>
    </div>
  );
}
