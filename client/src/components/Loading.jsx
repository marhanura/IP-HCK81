import Logo from "../assets/logo-plus.png";

export default function Loading() {
  return (
    <span className="loading loading-spinner loading-xl">
      <img src={Logo} alt="Loading..." className="h-10" />
    </span>
  );
}
