import {  FaSun, FaMoon } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";

const Header = () => {
  const [darkMode, setDarkMode] = useDarkMode();

  return (
    <header
      className="bg-[#0b1120] bg-opacity-95 text-white py-4 px-6 shadow-md flex justify-between items-center sticky top-0 z-50 border-b border-blue-800"
      dir="rtl"
    >
      <div className="flex items-center gap-4">
        <Link to="/" className="transform transition-transform duration-300 hover:scale-110">
          <img src="/logo.svg" alt="תדר לוגו" className="h-12 w-auto" />
        </Link>

        {/* <button
          className="text-xl p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors duration-300"
          title="הוסף פריט חדש"
        >
          <FaPlus />
        </button> */}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-xl p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-300"
          title={darkMode ? "מצב יום" : "מצב לילה"}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {/* קישור לדף אודות */}
      <Link
        to="/about"
        className="text-lg hover:text-blue-400 transition-colors duration-300"
      >
        אודות
      </Link>
    </header>
  );
};

export default Header;