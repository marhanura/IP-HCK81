import Logo from "../assets/logo-plus.png";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative">
        <div className="flex items-center justify-center z-10 relative">
          <img src={Logo} alt="Loading..." className="h-8" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="loading loading-ring loading-sm h-15 w-15"></span>
        </div>
      </div>
    </div>
  );
}
