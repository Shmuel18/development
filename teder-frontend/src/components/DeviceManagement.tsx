import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { fetchDevices, deleteDevice, DeviceFromApi, fetchCategories, Category } from "../api/api";
import { useAuth } from "../context/AuthContext";

const DeviceManagement = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [devices, setDevices] = useState<DeviceFromApi[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // פונקציה כללית לטעינת מכשירים וקטגוריות
    const getDevicesAndCategories = async (categoryIdToFetch: number | null) => {
        setLoading(true);
        setError(null);
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const fetchedCategories = await fetchCategories();
            setCategories(fetchedCategories);

            // הגדרת קטגוריה ראשונה כברירת מחדל אם אין בחירה
            const idToUse = categoryIdToFetch || fetchedCategories[0]?.id;
            setSelectedCategoryId(idToUse);

            if (idToUse) {
                const result = await fetchDevices(idToUse);
                setDevices(result.devices);
            } else {
                setDevices([]);
            }
            
            setLoading(false);
        } catch (err) {
            console.error("שגיאה בטעינת נתונים:", err);
            setError("שגיאה בטעינת קטגוריות או מכשירים.");
            setLoading(false);
        }
    };

    useEffect(() => {
        getDevicesAndCategories(selectedCategoryId);
    }, [token, selectedCategoryId]);

    const handleDeleteDevice = async (id: number) => {
        if (!token || !window.confirm("האם אתה בטוח שברצונך למחוק מכשיר זה?")) return;
        try {
            await deleteDevice(id, token);
            // רענון הרשימה לאחר המחיקה
            if (selectedCategoryId) {
                getDevicesAndCategories(selectedCategoryId);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "שגיאה במחיקת מכשיר.");
        }
    };

    const handleEditDevice = (id: number) => {
        navigate(`/edit-device/${id}`);
    };

    if (loading) {
        return (
            <div dir="rtl" className="space-y-4 animate-pulse">
                <h2 className="text-2xl font-bold text-blue-300 mb-4">ניהול מכשירים קיימים</h2>
                
                {/* בורר קטגוריה - שלד */}
                <div className="mb-4">
                    <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
                    <div className="h-10 w-full bg-gray-700 rounded-lg"></div>
                </div>
                
                {/* רשימת מכשירים - שלד */}
                <ul className="space-y-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <li key={index} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg h-12">
                            <div className="h-4 w-1/2 bg-gray-600 rounded"></div>
                            <div className="flex space-x-2">
                                <div className="h-6 w-6 bg-gray-600 rounded-full"></div>
                                <div className="h-6 w-6 bg-gray-600 rounded-full"></div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    if (error) {
        return <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</div>;
    }

    return (
        <div dir="rtl" className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-300 mb-4">ניהול מכשירים קיימים</h2>
            
            {/* בורר קטגוריה */}
            <div className="mb-4">
                <label htmlFor="category-select" className="block text-white text-sm font-bold mb-2">בחר קטגוריה להצגה:</label>
                <select
                    id="category-select"
                    value={selectedCategoryId || ""}
                    onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
            
            {devices.length === 0 ? (
                <p className="text-gray-400 text-center">אין מכשירים בקטגוריה זו.</p>
            ) : (
                <ul className="space-y-2">
                    {devices.map(device => (
                        <li key={device.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                            <span className="text-lg">{device.name}</span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditDevice(device.id)}
                                    className="text-blue-400 hover:text-blue-200"
                                    title="ערוך מכשיר"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDeleteDevice(device.id)}
                                    className="text-red-400 hover:text-red-200"
                                    title="מחק מכשיר"
                                >
                                    <FaTrashAlt />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DeviceManagement;