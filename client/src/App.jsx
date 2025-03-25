import { BrowserRouter, Routes, Route } from "react-router";
import "./App.css";
import HomeLayout from "./layout/Home.layout";
import HomePage from "./pages/Home.page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
