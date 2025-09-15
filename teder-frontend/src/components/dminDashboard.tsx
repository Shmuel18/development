import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createDevice, fetchCategories, NewDeviceData } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { categories as defaultCategories } from "../data/devicesData";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [formData, setFormData] = useState<NewDeviceData>({
    name: "",
    manufacturer: "",
    model: "",
    frequency_range: "",
    year: undefined,
    security_classification: "",
    description: "",
    category_id: defaultCategories[0]?.id || 0,
    subcategory_id: null,
  });

  const [categories, setCategories] = useState(defaultCategories);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        if (fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
          setFormData((prev) => ({
            ...prev,
            category_id: fetchedCategories[0].id,
          }));
        }
      } catch (err) {
        console.error("שגיאה בטעינת קטגוריות:", err);
      }
    };
    getCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value === "" ? undefined : name === 'category_id' || name === 'subcategory_id' || name === 'year' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!token) {
      setError("יש להתחבר כדי להוסיף מכשיר.");
      return;
    }

    try {
      const newDevice = await createDevice(formData, token);
      console.log("המכשיר נוסף בהצלחה:", newDevice);
      setSuccess(true);
      setFormData({
        name: "",
        manufacturer: "",
        model: "",
        frequency_range: "",
        year: undefined,
        security_classification: "",
        description: "",
        category_id: categories[0]?.id || 0,
        subcategory_id: null,
      });
      navigate(`/device/${newDevice.id}`);
    } catch (err) {
      console.error("שגיאה בהוספת מכשיר:", err);
      setError("שגיאה בהוספת המכשיר. אנא נסה שוב.");
    }
  };

  if (!user) {
    return (
      <div dir="rtl" className="text-center text-white py-10">
        <p className="text-xl">אין לך הרשאה לגשת לדף זה. אנא התחבר.</p>
        <button onClick={() => navigate("/login")} className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">
          עבור לדף התחברות
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="relative min-h-screen p-8 bg-cover bg-center" style={{ backgroundImage: "url('/bg-tech-wave.jpg')" }}>
      <div className="bg-black bg-opacity-60 w-full h-full absolute inset-0 -z-10" />
      <h1 className="text-4xl font-bold text-white mb-6 text-center">הוספת מכשיר חדש</h1>
      <form onSubmit={handleSubmit} className="bg-gray-800 bg-opacity-80 p-6 rounded-lg max-w-2xl mx-auto shadow-2xl">
        {error && <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</div>}
        {success && <div className="bg-green-500 text-white p-3 rounded mb-4 text-center">המכשיר נוסף בהצלחה!</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="name" className="block text-white text-sm font-bold mb-2">שם המכשיר</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
              className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="manufacturer" className="block text-white text-sm font-bold mb-2">יצרן</label>
            <input type="text" id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} required
              className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="model" className="block text-white text-sm font-bold mb-2">דגם</label>
            <input type="text" id="model" name="model" value={formData.model} onChange={handleChange} required
              className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="frequency_range" className="block text-white text-sm font-bold mb-2">תדר פעולה</label>
            <input type="text" id="frequency_range" name="frequency_range" value={formData.frequency_range} onChange={handleChange}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="year" className="block text-white text-sm font-bold mb-2">שנת ייצור</label>
            <input type="number" id="year" name="year" value={formData.year || ''} onChange={handleChange}
              className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="category_id" className="block text-white text-sm font-bold mb-2">קטגוריה</label>
            <select id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} required
              className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-white text-sm font-bold mb-2">תיאור</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange}
            className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          הוסף מכשיר
        </button>
      </form>
    </div>
  );
};

export default AdminDashboard;