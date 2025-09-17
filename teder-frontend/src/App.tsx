import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import CategoryPage from "./components/CategoryPage";
import DevicePage from "./components/DevicePage";
import About from "./components/About";
import NotFoundPage from "./components/NotFoundPage";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import EditDevicePage from './components/EditDevicePage';
import SubcategoryPage from './components/SubcategoryPage';
import { useDarkMode } from "./hooks/useDarkMode";

function App() {
  const [darkMode] = useDarkMode();

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-cover bg-center bg-fixed text-white flex flex-col"
      style={{
        backgroundImage: "url('/bg-tech-wave.jpg')",
      }}
    >
      {/* שכבת הכהות תופעל רק במצב לילה */}
      {darkMode && <div className="bg-black bg-opacity-60 w-full h-full absolute inset-0 -z-10" />}

      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/subcategory/:id" element={<SubcategoryPage />} />
        <Route path="/device/:id" element={<DevicePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="/admin-register" element={<Register />} />
        <Route path="/edit-device/:deviceId" element={<EditDevicePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;