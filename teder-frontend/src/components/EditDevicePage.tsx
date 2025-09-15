import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchDeviceById,
  updateDevice,
  uploadAttachments,
  fetchCategories,
  fetchSubcategories,
  DeviceFromApi,
  Category,
  Subcategory,
  NewDeviceData,
} from "../api/api";
import { useAuth } from "../context/AuthContext";

const EditDevicePage = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [device, setDevice] = useState<DeviceFromApi | null>(null);
  
  const [formData, setFormData] = useState<Partial<NewDeviceData>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    const getData = async () => {
      if (!deviceId) return;

      try {
        const [fetchedCategories, fetchedDevice] = await Promise.all([
          fetchCategories(),
          fetchDeviceById(deviceId)
        ]);
        
        setCategories(fetchedCategories);
        if (fetchedDevice) {
          setDevice(fetchedDevice);
          // Pre-populate form data
          setFormData({
            name: fetchedDevice.name,
            manufacturer: fetchedDevice.manufacturer,
            model: fetchedDevice.model,
            frequency_range: fetchedDevice.frequency_range,
            year: fetchedDevice.year,
            security_classification: fetchedDevice.security_classification,
            description: fetchedDevice.description,
            category_id: fetchedDevice.category_id,
            subcategory_id: fetchedDevice.subcategory_id,
          });
          
          // Fetch subcategories for the current device's category
          const fetchedSubcategories = await fetchSubcategories(fetchedDevice.category_id);
          setSubcategories(fetchedSubcategories);
        } else {
          setError("המכשיר לא נמצא.");
        }
        setLoading(false);
      } catch (err) {
        console.error("שגיאה בטעינת נתוני המכשיר:", err);
        setError("שגיאה בטעינת נתוני המכשיר.");
        setLoading(false);
      }
    };
    getData();
  }, [deviceId]);

  // Update subcategories when category changes
  useEffect(() => {
    const getSubcategories = async () => {
      if (formData.category_id) {
        try {
          const fetchedSubcategories = await fetchSubcategories(formData.category_id);
          setSubcategories(fetchedSubcategories);
          // Reset subcategory if it's not in the new list
          if (formData.subcategory_id && !fetchedSubcategories.some(sub => sub.id === formData.subcategory_id)) {
            setFormData(prev => ({ ...prev, subcategory_id: null }));
          }
        } catch (err) {
          console.error("שגיאה בטעינת תת-קטגוריות:", err);
        }
      }
    };
    getSubcategories();
  }, [formData.category_id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value === "" ? undefined : name === 'category_id' || name === 'subcategory_id' || name === 'year' ? parseInt(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!token || !deviceId) {
      setError("יש להתחבר כדי לעדכן מכשיר.");
      return;
    }

    try {
      await updateDevice(parseInt(deviceId), formData, token);

      if (selectedFiles && selectedFiles.length > 0) {
        await uploadAttachments(parseInt(deviceId), selectedFiles, token);
      }
      
      setSuccess(true);
      setTimeout(() => navigate(`/device/${deviceId}`), 2000);
    } catch (err) {
      console.error("שגיאה בעדכון מכשיר:", err);
      setError("שגיאה בעדכון המכשיר. אנא נסה שוב.");
    }
  };

  if (loading) {
    return <div className="text-center text-white py-4">טוען נתוני מכשיר...</div>;
  }
  
  if (error) {
    return <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</div>;
  }
  
  if (!device) {
      return null;
  }

  return (
    <div dir="rtl" className="relative min-h-screen p-8 bg-cover bg-center" style={{ backgroundImage: "url('/bg-tech-wave.jpg')" }}>
      <div className="bg-black bg-opacity-60 w-full h-full absolute inset-0 -z-10" />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">עריכת מכשיר: {device.name}</h1>
        
        <div className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-2xl">
          <form onSubmit={handleSubmit}>
            {error && <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</div>}
            {success && <div className="bg-green-500 text-white p-3 rounded mb-4 text-center">המכשיר עודכן בהצלחה! מועבר לדף המכשיר...</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="name" className="block text-white text-sm font-bold mb-2">שם המכשיר</label>
                <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required
                  className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label htmlFor="manufacturer" className="block text-white text-sm font-bold mb-2">יצרן</label>
                <input type="text" id="manufacturer" name="manufacturer" value={formData.manufacturer || ''} onChange={handleChange} required
                  className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label htmlFor="model" className="block text-white text-sm font-bold mb-2">דגם</label>
                <input type="text" id="model" name="model" value={formData.model || ''} onChange={handleChange} required
                  className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label htmlFor="frequency_range" className="block text-white text-sm font-bold mb-2">תדר פעולה</label>
                <input type="text" id="frequency_range" name="frequency_range" value={formData.frequency_range || ''} onChange={handleChange}
                  className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label htmlFor="year" className="block text-white text-sm font-bold mb-2">שנת ייצור</label>
                <input type="number" id="year" name="year" value={formData.year || ''} onChange={handleChange}
                  className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label htmlFor="security_classification" className="block text-white text-sm font-bold mb-2">סיווג ביטחוני</label>
                <input type="text" id="security_classification" name="security_classification" value={formData.security_classification || ''} onChange={handleChange}
                  className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label htmlFor="category_id" className="block text-white text-sm font-bold mb-2">קטגוריה</label>
                <select id="category_id" name="category_id" value={formData.category_id || ''} onChange={handleChange} required
                  className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="subcategory_id" className="block text-white text-sm font-bold mb-2">תת-קטגוריה</label>
                <select id="subcategory_id" name="subcategory_id" value={formData.subcategory_id || ''} onChange={handleChange}
                  className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">אין תת-קטגוריה</option>
                  {subcategories.map(subcat => (
                    <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-white text-sm font-bold mb-2">תיאור</label>
              <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange}
                className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div className="mb-4">
                <label htmlFor="attachments" className="block text-white text-sm font-bold mb-2">הוסף קבצים מצורפים חדשים</label>
                <input type="file" id="attachments" name="attachments" multiple onChange={handleFileChange}
                  className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              עדכן מכשיר
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditDevicePage;