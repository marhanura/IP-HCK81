import { BrowserRouter, Routes, Route } from "react-router";
import "./App.css";
import HomeLayout from "./layout/Home.layout";
import HomePage from "./pages/Home.page";
import DrugList from "./pages/DrugList.page";
import { Provider } from "react-redux";
import { store } from "./store";
import LoginPage from "./pages/Login.page";
import RegisterPage from "./pages/Register.page";
import LoginLayout from "./layout/Login.layout";
import DiseasesPage from "./pages/Diseases.page";
import UsersPage from "./pages/Users.page";
import AddDisease from "./pages/AddDisease.page";
import UserDetails from "./pages/UserDetails.page";
import DiseaseDetail from "./pages/DiseaseDetail.page";
import PaymentPage from "./pages/Payment.page";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/drugs" element={<DrugList />} />
            <Route path="/diseases" element={<DiseasesPage />} />
            <Route path="/diseases/add/:userId" element={<AddDisease />} />
            <Route path="/diseases/users/:userId" element={<UserDetails />} />
            <Route path="/diseases/:diseaseId" element={<DiseaseDetail />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/redeem-drugs/:diseaseId" element={<PaymentPage />} />
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
