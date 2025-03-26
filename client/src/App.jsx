import { BrowserRouter, Routes, Route } from "react-router";
import "./App.css";
import HomeLayout from "./layout/Home.layout";
import HomePage from "./pages/Home.page";
import DrugList from "./pages/DrugList.page";
import { Provider } from "react-redux";
import { store } from "./store";
import LoginLayout from "./layout/Login.layout";
import LoginPage from "./pages/Login.page";
import RegisterPage from "./pages/Register.page";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/drugs" element={<DrugList />} />
          </Route>
          <Route path="/" element={<LoginLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
