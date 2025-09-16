import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { fetchDevices, DeviceFromApi, fetchCategories, Category } from "../api/api";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const categoryId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState<DeviceFromApi[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      setError(null);
      if (!categoryId) {
        setError("מזהה קטגוריה לא תקין.");
        setLoading(false);
        return;
      }
      
      try {
        const [{ devices: fetchedDevices }] = await Promise.all([
          fetchDevices(categoryId, search),
        ]);
        setDevices(fetchedDevices);

        // יש לשקול להעביר את נתוני הקטגוריות מהקומפוננטה ההורה כדי למנוע קריאה מיותרת
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);

      } catch (err) {
        console.error("שגיאה בטעינת נתונים מה-API:", err);
        setError("שגיאה בטעינת הנתונים. אנא נסה שנית מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [categoryId, search]);

  const currentCategory = categories.find((cat) => cat.id === categoryId);

  if (loading) {
    return (
      <div
        className="relative min-h-screen bg-cover bg-center text-black dark:text-white transition-colors duration-300 px-6 py-12"
        style={{ backgroundImage: "url('/bg-tech-wave.jpg')" }}
        dir="rtl"
      >
        <div className="absolute inset-0 z-0 transition-opacity duration-300">
          <div className="w-full h-full dark:bg-black dark:bg-opacity-60" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <header className="flex flex-col md:flex-row items-center justify-between mb-6 gap-6">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 animate-pulse bg-gray-700 rounded-full"></span>
              <div className="h-8 w-48 animate-pulse bg-gray-700 rounded-lg"></div>
            </div>
            <div className="h-10 w-full max-w-sm animate-pulse bg-gray-700 rounded-xl"></div>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-white/70 backdrop-blur-md dark:bg-[#121826] rounded-2xl border border-blue-600 shadow-xl p-4 flex flex-col items-center text-center h-[350px]"
              >
                <div className="w-full h-40 sm:h-48 md:h-56 mb-4 bg-gray-700 rounded-lg"></div>
                <div className="h-6 w-3/4 mb-2 bg-gray-700 rounded-lg"></div>
                <div className="h-4 w-1/2 mb-2 bg-gray-700 rounded-lg"></div>
                <div className="h-4 w-1/3 mb-4 bg-gray-700 rounded-lg"></div>
                <div className="h-10 w-full bg-blue-600/50 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="relative min-h-screen text-white text-center px-4 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-tech-wave.jpg')" }}
        dir="rtl"
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-3xl font-bold mb-4">{error}</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-lg flex items-center gap-2"
          >
            <FaArrowRight className="transform rotate-180" /> חזור אחורה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-black dark:text-white transition-colors duration-300 px-6 py-12"
      style={{ backgroundImage: "url('/bg-tech-wave.jpg')" }}
      dir="rtl"
    >
      <div className="absolute inset-0 z-0 transition-opacity duration-300">
        <div className="w-full h-full dark:bg-black dark:bg-opacity-60" />
      </div>

      <div className="relative z-10">
        <header className="flex flex-col md:flex-row items-center justify-between mb-6 gap-6">
          <div className="flex items-center gap-3">
            {currentCategory?.image_url ? (
              <img
                src={`${API_URL}${currentCategory.image_url}`}
                alt={currentCategory.name}
                className="h-10 w-10 object-contain rounded-full"
              />
            ) : (
              <span className="text-4xl text-blue-400">?</span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-blue-700 dark:text-blue-300 drop-shadow-md">
              {currentCategory ? currentCategory.name : "קטגוריה"}
            </h1>
          </div>

          <input
            type="text"
            placeholder="🔍 חפש מכשיר לפי שם או תדר"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm bg-white/70 dark:bg-[#1a1f2e] backdrop-blur-md px-4 py-2 rounded-xl border border-blue-600 placeholder-gray-700 dark:placeholder-gray-400 text-black dark:text-white font-semibold"
          />
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {devices.map((device) => (
            <motion.div
              key={device.id}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate(`/device/${device.id}`)}
              className="bg-white/70 backdrop-blur-md dark:bg-[#121826] text-black dark:text-white rounded-2xl border border-blue-600 shadow-xl hover:shadow-2xl p-4 flex flex-col items-center text-center cursor-pointer transition duration-300"
            >
              <img
                src="https://dummyimage.com/150x150/000/fff&text=No+Image"
                alt={device.name}
                className="w-full h-40 sm:h-48 md:h-56 mb-4 rounded-lg object-cover border border-blue-500 shadow-md"
              />
              <h2 className="text-xl font-semibold mb-1 text-black dark:text-white">
                {device.name}
              </h2>
              {device.frequency_range && (
                <p className="text-base text-black dark:text-gray-300">
                  תדר: {device.frequency_range}
                </p>
              )}
              <p className="text-base text-black dark:text-gray-300 mb-2">
                {device.manufacturer}
              </p>

              <span className={`text-sm px-3 py-1 rounded-full mb-3 font-bold bg-green-500`}>
                פעיל
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/device/${device.id}`);
                }}
                className="mt-auto bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-xl transition duration-200"
              >
                פרטים נוספים
              </button>
            </motion.div>
          ))}
        </div>

        {devices.length === 0 && (
          <div className="text-center mt-10 text-gray-600 dark:text-gray-400">
            לא נמצאו מכשירים התואמים את החיפוש.
          </div>
        )}
      </div>
    </div>
  );
}