import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaArrowRight, FaFilePdf } from "react-icons/fa";
import { motion } from "framer-motion";
import { fetchDeviceById, DeviceFromApi } from "../api/api";
import { categories } from "../data/devicesData";

const API_URL = 'http://localhost:3000';

export default function DevicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [device, setDevice] = useState<DeviceFromApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("מזהה מכשיר לא תקין.");
      setLoading(false);
      return;
    }

    const getDevice = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedDevice = await fetchDeviceById(id);
        if (!fetchedDevice) {
          setError("המכשיר לא נמצא.");
        } else {
          setDevice(fetchedDevice);
        }
      } catch (err) {
        console.error(`שגיאה בטעינת מכשיר עם ID ${id} מה-API:`, err);
        setError("שגיאה בטעינת פרטי המכשיר. אנא נסה שנית מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };
    getDevice();
  }, [id]);

  if (loading) {
    return (
      <div dir="rtl" className="text-center text-white py-10">
        <p className="text-xl">טוען פרטי מכשיר...</p>
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
            <FaArrowRight /> חזור אחורה
          </button>
        </div>
      </div>
    );
  }

  if (!device) {
    return null;
  }

  const categoryName = categories.find(cat => cat.id === device.category_id)?.name || "קטגוריה לא ידועה";
  const pdfAttachments = device.attachments?.filter(att => att.mime_type === 'application/pdf');

  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-black dark:text-white transition-colors duration-300 px-6 py-12"
      style={{ backgroundImage: "url('/bg-tech-wave.jpg')" }}
      dir="rtl"
    >
      <div className="absolute inset-0 z-0 transition-opacity duration-300">
        <div className="w-full h-full dark:bg-black dark:bg-opacity-60" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 backdrop-blur-md dark:bg-[#121826] text-black dark:text-white rounded-3xl shadow-2xl p-8 border border-blue-800"
        >
          <div className="flex flex-col md:flex-row items-center gap-10">
            <img
              src="https://dummyimage.com/256x256/000/fff&text=No+Image"
              alt={device.name}
              className="w-64 h-64 object-contain rounded-2xl border border-blue-600 shadow-md"
            />

            <div className="flex-1 text-right">
              <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-4 drop-shadow">
                {device.name}
              </h1>
              <div className="space-y-2 text-lg text-black dark:text-gray-200">
                <p>
                  יצרן: <span className="font-semibold text-black dark:text-white">{device.manufacturer}</span>
                </p>
                {device.frequency_range && (
                  <p>
                    תדר פעולה: <span className="font-semibold text-black dark:text-white">{device.frequency_range}</span>
                  </p>
                )}
                {device.year && (
                  <p>
                    שנת ייצור: <span className="font-semibold text-black dark:text-white">{device.year}</span>
                  </p>
                )}
              </div>

              <span
                className={`inline-block text-sm font-bold px-4 py-1 rounded-full mt-4 bg-green-500`}
              >
                פעיל
              </span>

              <p className="mt-6 text-base text-black dark:text-gray-200 leading-relaxed">
                {device.description || `מכשיר זה נבדק במסגרת המחקר ונמצא בקטגוריית "${categoryName}". ניתן לעיין בתיעוד נוסף על אופן פעולתו והשימוש בו בשטח.`}
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  to={`/category/${device.category_id}`}
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl text-white text-sm flex items-center gap-2"
                >
                  <FaArrowRight /> חזור לקטגוריה
                </Link>

                {pdfAttachments && pdfAttachments.length > 0 && (
                  <a
                    href={`${API_URL}/uploads/${pdfAttachments[0].file_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded-xl text-white text-sm flex items-center gap-2"
                  >
                    <FaFilePdf /> הצג דוח PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}