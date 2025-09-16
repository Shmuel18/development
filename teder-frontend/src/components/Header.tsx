import { FaBars, FaTimes } from "react-icons/fa";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi"; // אייקונים חדשים
import { Link } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";
import { useState } from "react";

const Header = () => {
  const [darkMode, setDarkMode] = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="bg-[#0b1120] bg-opacity-95 text-white py-4 px-6 shadow-md flex justify-between items-center sticky top-0 z-50 border-b border-blue-800"
      dir="rtl"
    >
      <div className="flex items-center gap-4">
        <Link to="/" className="transform transition-transform duration-300 hover:scale-110">
          <img src="/Logo.png" alt="Teder Logo" className="h-12 w-auto" />
        </Link>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-xl p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-300"
          title={darkMode ? "מצב יום" : "מצב לילה"}
        >
          {darkMode ? <HiOutlineSun /> : <HiOutlineMoon />}
        </button>
      </div>

      <nav className="hidden md:flex items-center gap-4">
        <Link
          to="/about"
          className="text-lg hover:text-blue-400 transition-colors duration-300"
        >
          אודות
        </Link>
      </nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-xl">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 right-0 w-full bg-[#0b1120] bg-opacity-95 border-t border-blue-800 py-4 flex flex-col items-center space-y-4">
          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            className="text-lg hover:text-blue-400 transition-colors duration-300"
          >
            אודות
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;