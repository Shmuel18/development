import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSatellite } from "react-icons/fa";
import { GiDeliveryDrone } from "react-icons/gi";
import { FaWalkieTalkie, FaRadio } from "react-icons/fa6";
import { fetchDevices, DeviceFromApi } from "../api/api";
import { motion } from "framer-motion";
import { categories } from "../data/devicesData";

const categoryIcons: Record<string, React.ReactNode> = {
  לווינים: <FaSatellite />,
  רחפנים: <GiDeliveryDrone />,
  "מכשירי קשר": <FaWalkieTalkie />,
  "מערכות הפעלה": <FaRadio />,
};

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const categoryId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState<DeviceFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentCategory = categories.find((cat) => cat.id === categoryId);

  useEffect(() => {
    if (!categoryId) {
      setError("מזהה קטגוריה לא תקין.");
      setLoading(false);
      return;
    }

    const getDevices = async () => {
      setLoading(true);
      setError(null);
      try {
        const { devices: fetchedDevices } = await fetchDevices(
          categoryId,
          search
        );
        setDevices(fetchedDevices);
      } catch (err) {
        console.error("שגיאה בטעינת מכשירים מה-API:", err);
        setError("שגיאה בטעינת המכשירים. אנא נסה שנית מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };
    getDevices();
  }, [categoryId, search]);

  if (loading) {
    return (
      <div dir="rtl" className="text-center text-white py-10">
        <p className="text-xl">טוען מכשירים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" className="text-center text-red-500 py-10">
        <p className="text-xl">{error}</p>
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
            <span className="text-4xl text-blue-400">
              {currentCategory ? categoryIcons[currentCategory.name] : <FaSatellite />}
            </span>
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