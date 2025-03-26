import { Link } from "react-router";
import Image1 from "../assets/main-image-1.png";
import Image2 from "../assets/main-image-2.png";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col lg:flex-row">
      <div className="card bg-base-300 rounded-box grid h-100 grow place-items-center">
        <p>Consult to Our Doctor</p>
        <img src={Image1} alt="Main Image 1" className="h-80" />
      </div>
      <div className="divider lg:divider-horizontal"></div>
      <div className="card bg-base-300 rounded-box grid h-100 grow place-items-center">
        <Link to="/drugs">
          <p>See Our Drug Catalog</p>
          <img src={Image2} alt="Main Image 2" className="h-80" />
        </Link>
      </div>
    </div>
  );
}
