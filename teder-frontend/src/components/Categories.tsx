import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSatellite } from "react-icons/fa";
import { GiDeliveryDrone } from "react-icons/gi";
import { FaWalkieTalkie, FaRadio } from "react-icons/fa6";

import { fetchCategories, Category } from "../api/api";

const categoryIcons: Record<string, React.ReactNode> = {
  לווינים: <FaSatellite />,
  רחפנים: <GiDeliveryDrone />,
  "מכשירי קשר": <FaWalkieTalkie />,
  "מערכות הפעלה": <FaRadio />,
};

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
      <div dir="rtl" className="text-center text-white py-10">
        <p className="text-xl">טוען קטגוריות...</p>
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
    <section className="py-10 px-4 text-center" dir="rtl">
      <h2 className="text-4xl font-bold text-white mb-12">קטגוריות</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {categories.map((cat, idx) => (
          <Link to={`/category/${cat.id}`} key={idx}>
            <div
              className="group border border-blue-600 hover:border-blue-400 hover:bg-blue-800 p-6 rounded-2xl bg-blue-950 text-white flex flex-col items-center transition-transform duration-300 transform hover:scale-105 shadow-xl"
            >
              <div className="text-5xl mb-4 text-blue-400 group-hover:text-white transition-colors">
                {categoryIcons[cat.name] || <FaSatellite />}
              </div>
              <p className="text-lg font-semibold tracking-tight">
                {cat.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;