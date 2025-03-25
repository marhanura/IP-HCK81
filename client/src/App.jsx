import { BrowserRouter, Routes, Route } from "react-router";
import "./App.css";
import HomeLayout from "./layout/Home.layout";
import HomePage from "./pages/Home.page";
import { store } from "./store";

function App() {
  return (
    // <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeLayout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    // </Provider>
  );
}

export default App;
