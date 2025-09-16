import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchCategories, Category } from "../api/api";
import { motion } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        if (fetchedCategories.length === 0) {
          setError("לא נמצאו קטגוריות להצגה.");
        } else {
          setCategories(fetchedCategories);
        }
      } catch (err) {
        console.error("שגיאה בטעינת קטגוריות מה-API:", err);
        setError("שגיאה בטעינת הקטגוריות. אנא נסה שנית מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };
    getCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-10 px-4 text-center" dir="rtl">
        <h2 className="text-4xl font-bold text-white mb-12">קטגוריות</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse group border border-gray-600 p-6 rounded-2xl bg-gray-950 text-white flex flex-col items-center shadow-xl h-48"
            >
              <div className="h-24 w-24 mb-4 bg-gray-700 rounded-full"></div>
              <div className="h-4 w-3/4 bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </section>
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
    <section className="py-10 px-4 text-center" dir="rtl">
      <h2 className="text-4xl font-bold text-white mb-12">קטגוריות</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {categories.map((cat, idx) => (
          <Link to={`/category/${cat.id}`} key={idx}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group border border-blue-600 hover:border-blue-400 p-6 rounded-2xl bg-blue-950 text-white flex flex-col items-center transition-transform duration-300 transform hover:scale-105 shadow-xl"
            >
              <div className="h-24 w-24 mb-4">
                {cat.image_url ? (
                  <img
                    src={`${API_URL}${cat.image_url}`}
                    alt={cat.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center text-gray-300">
                    אין תמונה
                  </div>
                )}
              </div>
              <p className="text-lg font-semibold tracking-tight">
                {cat.name}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;