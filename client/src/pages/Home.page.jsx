import { Link, useOutletContext } from "react-router";
import Header from "../assets/header.png";
import Image1 from "../assets/main-image-1.png";
import Image2 from "../assets/main-image-2.png";
import Footer from "../components/Footer";

export default function HomePage() {
  const user = useOutletContext();

  return (
    <div className="flex flex-col w-screen bg-base-100">
      {/* Hero */}
      <div className="hero bg-[#1c3d70] min-h-screen w-full px-10">
        <div className="hero-content w-full flex-col lg:flex-row gap-25">
          <div className="w-2/3">
            <h1 className="text-4xl font-bold text-base-100">
              Expert care, trusted meds — all in one place.
            </h1>
            <p className="py-6 text-base-100">
              Zehat keeps your health simple and stress-free.
            </p>
            <a
              className="btn bg-[#f16634] shadow-none border-none mr-3 text-base-100"
              href={`/diseases/add/${user.id}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
              Consult
            </a>
            <a
              className="btn bg-[#f16634] shadow-none border-none mr-3 text-base-100 self-end"
              href="/drugs"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              Drug Store
            </a>
          </div>
          <div className="group relative w-100 lg:w-1/2 h-100">
            <div className="absolute bg-linear-to-bl from-[#1c3d70] from-15% to-gray-100 to-80% size-75 rounded-full z-0"></div>
            <img src={Header} className="absolute max-w-sm z-10" />
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex flex-col w-full py-8">
        <div className="w-full flex flex-col items-center p-8">
          {/* Main Content 1 */}
          <div className="flex flex-col lg:flex-row items-center self-start -mt-30 px-25 pt-15 gap-10 bg-base-200 rounded-3xl mb-10">
            <div className="group relative w-100 h-100">
              <div className="absolute bg-gradient-to-br from-[#1c3d70] from-15% to-base-200 to-80% size-80 rounded-full"></div>
              <img
                src={Image1}
                className="absolute size-100 z-10"
                alt="Consult Image"
              />
            </div>
            <div className="text-center lg:text-left">
              <p className="text-lg font-semibold text-[#1c3d70] mb-5">
                Consult to our doctor, anytime.
              </p>
              <a
                className="btn bg-[#f16634] shadow-none border-none mr-3 text-base-100"
                href={`/diseases/add/${user.id}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                  />
                </svg>
                Book Consultation
              </a>
            </div>
          </div>

          {/* Main Content 2 */}
          <div className="flex flex-col lg:flex-row items-center self-end px-25 pt-15 gap-10 bg-base-200 rounded-3xl my-5">
            <div className="text-center lg:text-right">
              <p className="text-lg font-semibold text-[#1c3d70] mb-5">
                Get your medicine, delivered to your door.
              </p>
              <a
                className="btn bg-[#f16634] shadow-none border-none mr-3 text-base-100 self-end"
                href="/drugs"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
                Shop Medicine
              </a>
            </div>
            <div className="group relative w-100 h-100">
              <div className="absolute bg-gradient-to-bl from-[#1c3d70] from-15% to-base-200 to-75% size-80 rounded-full right-0"></div>
              <img
                src={Image2}
                className="absolute size-100 z-10"
                alt="Shop Image"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
