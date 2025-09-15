import { FaSun, FaMoon, FaUser, FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [darkMode, setDarkMode] = useDarkMode();
  const { user, logout } = useAuth();

  return (
    <header
      className="bg-[#0b1120] bg-opacity-95 text-white py-4 px-6 shadow-md flex justify-between items-center sticky top-0 z-50 border-b border-blue-800"
      dir="rtl"
    >
      <div className="flex items-center gap-4">
        <Link to="/" className="transform transition-transform duration-300 hover:scale-110">
          <img src="/logo.svg" alt="תדר לוגו" className="h-12 w-auto" />
        </Link>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-xl p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-300"
          title={darkMode ? "מצב יום" : "מצב לילה"}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm font-semibold hidden md:block">שלום, {user.username}</span>
            <Link
              to="/admin"
              className="text-lg hover:text-blue-400 transition-colors duration-300 flex items-center gap-2"
              title="לוח בקרה"
            >
              <FaUser />
              <span className="hidden md:inline">ניהול</span>
            </Link>
            <button
              onClick={logout}
              className="text-lg p-2 rounded-full bg-red-600 hover:bg-red-500 transition-colors duration-300"
              title="התנתקות"
            >
              <FaSignOutAlt />
            </button>
          </>
        ) : (
          <Link
            to="/about"
            className="text-lg hover:text-blue-400 transition-colors duration-300"
          >
            אודות
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;