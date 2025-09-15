import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt, FaPlusCircle } from "react-icons/fa";
import { 
  fetchCategories, 
  fetchSubcategories, 
  createCategory, 
  createSubcategory, 
  updateCategory, 
  deleteCategory, 
  updateSubcategory, 
  deleteSubcategory, 
  Category, 
  Subcategory 
} from "../api/api";
import { useAuth } from "../context/AuthContext";

const CategoryManagement = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ניהול קטגוריות
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  
  // ניהול תת-קטגוריות
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [selectedCategoryIdForSub, setSelectedCategoryIdForSub] = useState<number | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<number | null>(null);
  const [editingSubcategoryName, setEditingSubcategoryName] = useState("");

  const getCategoriesAndSubcategories = async () => {
    try {
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
      
      const allSubcategories: Subcategory[] = [];
      for (const category of fetchedCategories) {
          const fetchedSubcategories = await fetchSubcategories(category.id);
          allSubcategories.push(...fetchedSubcategories);
      }
      setSubcategories(allSubcategories);
      setLoading(false);
    } catch (err) {
      console.error("שגיאה בטעינת קטגוריות ותת-קטגוריות:", err);
      setError("שגיאה בטעינת קטגוריות ותת-קטגוריות.");
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategoriesAndSubcategories();
  }, []);

  // פונקציות לניהול קטגוריות
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newCategoryName) {
        setError("יש למלא את שם הקטגוריה ולהיות מחובר.");
        return;
    }
    try {
        await createCategory(newCategoryName, token);
        setNewCategoryName("");
        setError(null);
        getCategoriesAndSubcategories();
    } catch (err) {
        console.error("שגיאה ביצירת קטגוריה:", err);
        setError(err instanceof Error ? err.message : "שגיאה ביצירת קטגוריה.");
    }
  };

  const handleUpdateCategory = async (id: number) => {
      if (!token || !editingCategoryName) return;
      try {
          await updateCategory(id, editingCategoryName, token);
          setEditingCategoryId(null);
          setEditingCategoryName("");
          setError(null);
          getCategoriesAndSubcategories();
      } catch (err) {
          console.error("שגיאה בעדכון קטגוריה:", err);
          setError(err instanceof Error ? err.message : "שגיאה בעדכון קטגוריה.");
      }
  };
  
  const handleDeleteCategory = async (id: number) => {
      if (!token || !window.confirm("האם אתה בטוח שברצונך למחוק קטגוריה זו? פעולה זו תמחק גם את כל המכשירים והתתי-קטגוריות המשויכים אליה.")) return;
      try {
          await deleteCategory(id, token);
          setError(null);
          getCategoriesAndSubcategories();
      } catch (err) {
          console.error("שגיאה במחיקת קטגוריה:", err);
          setError(err instanceof Error ? err.message : "שגיאה במחיקת קטגוריה.");
      }
  };

  // פונקציות לניהול תת-קטגוריות
  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedCategoryIdForSub || !newSubcategoryName) {
      setError("יש למלא את כל השדות ולהיות מחובר.");
      return;
    }
    try {
      await createSubcategory(newSubcategoryName, selectedCategoryIdForSub, token);
      setNewSubcategoryName("");
      setError(null);
      getCategoriesAndSubcategories();
    } catch (err) {
      console.error("שגיאה ביצירת תת-קטגוריה:", err);
      setError(err instanceof Error ? err.message : "שגיאה ביצירת תת-קטגוריה.");
    }
  };
  
  const handleUpdateSubcategory = async (id: number, categoryId: number) => {
      if (!token || !editingSubcategoryName) return;
      try {
          await updateSubcategory(id, editingSubcategoryName, categoryId, token);
          setEditingSubcategoryId(null);
          setEditingSubcategoryName("");
          setError(null);
          getCategoriesAndSubcategories();
      } catch (err) {
          console.error("שגיאה בעדכון תת-קטגוריה:", err);
          setError(err instanceof Error ? err.message : "שגיאה בעדכון תת-קטגוריה.");
      }
  };
  
  const handleDeleteSubcategory = async (id: number) => {
      if (!token || !window.confirm("האם אתה בטוח שברצונך למחוק תת-קטגוריה זו?")) return;
      try {
          await deleteSubcategory(id, token);
          setError(null);
          getCategoriesAndSubcategories();
      } catch (err) {
          console.error("שגיאה במחיקת תת-קטגוריה:", err);
          setError(err instanceof Error ? err.message : "שגיאה במחיקת תת-קטגוריה.");
      }
  };

  if (loading) {
    return <div className="text-center text-white py-4">טוען נתונים...</div>;
  }
  
  return (
    <div dir="rtl" className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-6">ניהול קטגוריות ותת-קטגוריות</h2>
      {error && <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</div>}

      {/* יצירה וניהול של קטגוריות */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-blue-300 mb-4">יצירת קטגוריה חדשה</h3>
        <form onSubmit={handleCreateCategory} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="שם קטגוריה חדשה"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
            title="הוסף קטגוריה"
          >
            <FaPlusCircle />
          </button>
        </form>
        
        <h3 className="text-2xl font-bold text-blue-300 mb-4">קטגוריות קיימות</h3>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
              {editingCategoryId === cat.id ? (
                <input
                  type="text"
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  onBlur={() => handleUpdateCategory(cat.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateCategory(cat.id);
                    if (e.key === 'Escape') setEditingCategoryId(null);
                  }}
                  className="bg-gray-800 text-white p-1 rounded w-full"
                  autoFocus
                />
              ) : (
                <span className="text-lg">{cat.name}</span>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                      setEditingCategoryId(cat.id);
                      setEditingCategoryName(cat.name);
                  }}
                  className="text-blue-400 hover:text-blue-200"
                  title="ערוך קטגוריה"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="text-red-400 hover:text-red-200"
                  title="מחק קטגוריה"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* יצירה וניהול של תת-קטגוריות */}
      <div>
        <h3 className="text-2xl font-bold text-blue-300 mb-4">יצירת תת-קטגוריה חדשה</h3>
        <form onSubmit={handleCreateSubcategory} className="flex flex-wrap gap-2 mb-6">
          <input
            type="text"
            placeholder="שם תת-קטגוריה"
            value={newSubcategoryName}
            onChange={(e) => setNewSubcategoryName(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={selectedCategoryIdForSub || ""}
            onChange={(e) => setSelectedCategoryIdForSub(parseInt(e.target.value))}
            className="px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">בחר קטגוריה</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="p-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
            title="הוסף תת-קטגוריה"
          >
            <FaPlusCircle />
          </button>
        </form>
      
        <h3 className="text-2xl font-bold text-blue-300 mb-4">תת-קטגוריות קיימות</h3>
        <ul className="space-y-2">
          {subcategories.map((subcat) => (
            <li key={subcat.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
              {editingSubcategoryId === subcat.id ? (
                <input
                  type="text"
                  value={editingSubcategoryName}
                  onChange={(e) => setEditingSubcategoryName(e.target.value)}
                  onBlur={() => handleUpdateSubcategory(subcat.id, subcat.category_id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateSubcategory(subcat.id, subcat.category_id);
                    if (e.key === 'Escape') setEditingSubcategoryId(null);
                  }}
                  className="bg-gray-800 text-white p-1 rounded w-full"
                  autoFocus
                />
              ) : (
                <span className="text-lg">
                  {subcat.name} <span className="text-sm text-gray-400">({categories.find(c => c.id === subcat.category_id)?.name})</span>
                </span>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                      setEditingSubcategoryId(subcat.id);
                      setEditingSubcategoryName(subcat.name);
                  }}
                  className="text-blue-400 hover:text-blue-200"
                  title="ערוך תת-קטגוריה"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteSubcategory(subcat.id)}
                  className="text-red-400 hover:text-red-200"
                  title="מחק תת-קטגוריה"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryManagement;