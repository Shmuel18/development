import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { HiDownload } from "react-icons/hi";
import { fetchDeviceById, fetchCategories, DeviceFromApi, Category } from "../api/api";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function DevicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<DeviceFromApi | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDeviceData = async () => {
      setLoading(true);
      setError(null);
      if (!id) {
        setError("מזהה מכשיר לא תקין.");
        setLoading(false);
        return;
      }

      try {
        const fetchedDevice = await fetchDeviceById(id);
        const fetchedCategories = await fetchCategories();
        
        setDevice(fetchedDevice);
        setCategories(fetchedCategories);
      } catch (err) {
        console.error(`שגיאה בטעינת מכשיר עם ID ${id} מה-API:`, err);
        setError("שגיאה בטעינת פרטי המכשיר. אנא נסה שנית מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };
    getDeviceData();
  }, [id]);

  const currentCategory = categories.find(cat => cat.id === device?.category_id);
  const deviceImageUrl = device?.image_url;

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

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-md dark:bg-[#121826]/80 border border-blue-600 rounded-3xl shadow-2xl p-8 animate-pulse"
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 flex-shrink-0">
                <div className="w-full h-[256px] bg-gray-700 rounded-2xl"></div>
              </div>

              <div className="w-full md:w-2/3">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
                  <div className="h-10 w-3/4 bg-gray-700 rounded-lg"></div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="h-6 w-full bg-gray-700 rounded-lg"></div>
                  <div className="h-6 w-5/6 bg-gray-700 rounded-lg"></div>
                  <div className="h-6 w-3/4 bg-gray-700 rounded-lg"></div>
                  <div className="h-6 w-1/2 bg-gray-700 rounded-lg"></div>
                </div>

                <div className="mb-6">
                  <div className="h-6 w-40 mb-2 bg-gray-700 rounded-lg"></div>
                  <div className="h-24 w-full bg-gray-700 rounded-lg"></div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="h-10 w-40 bg-blue-600/50 rounded-xl"></div>
                  <div className="h-10 w-40 bg-red-600/50 rounded-xl"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div
        className="relative min-h-screen text-white text-center px-4 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-tech-wave.jpg')" }}
        dir="rtl"
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-3xl font-bold mb-4">{error || "המכשיר לא נמצא."}</h2>
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

  const categoryImageUrl = currentCategory?.image_url;

  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-black dark:text-white transition-colors duration-300 px-6 py-12"
      style={{ backgroundImage: "url('/bg-tech-wave.jpg')" }}
      dir="rtl"
    >
      <div className="absolute inset-0 z-0 transition-opacity duration-300">
        <div className="w-full h-full dark:bg-black dark:bg-opacity-60" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-md dark:bg-[#121826]/80 border border-blue-600 rounded-3xl shadow-2xl p-8"
        >
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex-shrink-0">
              <img
                src={deviceImageUrl ? `${API_URL}${deviceImageUrl}` : "https://dummyimage.com/400x400/000/fff&text=No+Image"}
                alt={device.name}
                className="w-full h-auto rounded-2xl border border-blue-500 shadow-lg object-cover"
              />
            </div>

            <div className="w-full md:w-2/3">
              <div className="flex items-center gap-4 mb-4">
                {categoryImageUrl ? (
                    <img
                        src={`${API_URL}${categoryImageUrl}`}
                        alt={currentCategory?.name}
                        className="h-12 w-12 object-contain"
                    />
                ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center text-white">?</div>
                )}
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-blue-800 dark:text-blue-200 drop-shadow-lg">
                  {device.name}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-lg font-medium text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-black dark:text-white">יצרן:</span>
                  <span>{device.manufacturer}</span>
                </div>
                {device.model && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-black dark:text-white">דגם:</span>
                    <span>{device.model}</span>
                  </div>
                )}
                {device.frequency_range && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-black dark:text-white">תדר:</span>
                    <span>{device.frequency_range}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-black dark:text-white">קטגוריה:</span>
                  <span>{currentCategory?.name || "לא ידוע"}</span>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2 text-blue-700 dark:text-blue-300">תיאור</h2>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
                  {device.description}
                </p>
              </div>

              {device.attachments && device.attachments.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-3 text-blue-700 dark:text-blue-300">קבצים מצורפים</h2>
                  <div className="space-y-3">
                    {device.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={`${API_URL}/uploads/${attachment.file_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#1a1f2e] rounded-xl transition duration-200 hover:bg-blue-100 dark:hover:bg-blue-900 shadow-md"
                      >
                        <span className="flex items-center gap-3">
                          <HiDownload className="text-xl text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{attachment.original_name}</span>
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">({(attachment.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}