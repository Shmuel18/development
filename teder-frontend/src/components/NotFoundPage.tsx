import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

export default function NotFoundPage() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-black dark:text-white transition-colors duration-300 px-6 py-12 text-center"
      style={{ backgroundImage: "url('/bg-tech-wave.jpg')" }}
      dir="rtl"
    >
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full dark:bg-black dark:bg-opacity-60" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto bg-white/70 dark:bg-[#121826] backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-blue-600">
        <h1 className="text-6xl font-extrabold text-blue-600 dark:text-blue-400 mb-6">404</h1>
        <p className="text-xl mb-6">העמוד שחיפשת לא נמצא.</p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-lg transition"
        >
          <FaArrowRight /> חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
