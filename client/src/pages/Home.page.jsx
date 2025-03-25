import DrugCard from "../components/DrugCard";

export default function HomePage() {
  return (
    <div>
      <h1>Home Page</h1>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        <DrugCard />
      </div>
    </div>
  );
}
