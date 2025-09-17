import { Device } from "../data/devicesData";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Category {
  id: number;
  name: string;
  image_url?: string;
}

export interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

export interface Attachment {
  id: number;
  file_name: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
}

export interface DeviceFromApi {
  id: number;
  name: string;
  manufacturer: string;
  model: string;
  frequency_range?: string;
  year?: number;
  security_classification?: string;
  description?: string;
  category_id: number;
  subcategory_id?: number;
  image_url?: string;
  attachments?: Attachment[];
}

export interface NewDeviceData {
  name: string;
  manufacturer: string;
  model: string;
  frequency_range?: string;
  year?: number;
  security_classification?: string;
  description?: string;
  category_id: number;
  subcategory_id?: number | null;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  role: 'viewer' | 'editor' | 'admin';
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_URL}/api/categories`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error("שגיאה בטעינת קטגוריות מה-API:", error);
    throw error;
  }
}

export async function fetchSubcategories(categoryId: number): Promise<Subcategory[]> {
    try {
        const response = await fetch(`${API_URL}/api/subcategories?categoryId=${categoryId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.subcategories || [];
    } catch (error) {
        console.error("שגיאה בטעינת תת-קטגוריות מה-API:", error);
        throw error;
    }
}

// ✅ חדש: פונקציה לקבלת תת-קטגוריה בודדת לפי ID שלה
export async function fetchSubcategoryById(subcategoryId: number): Promise<Subcategory | null> {
    try {
        const response = await fetch(`${API_URL}/api/subcategories/${subcategoryId}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`שגיאה בטעינת תת-קטגוריה עם ID ${subcategoryId} מה-API:`, error);
        throw error;
    }
}

export async function fetchDevices(
  categoryId: number,
  search: string = "",
  page: number = 1,
  limit: number = 20
): Promise<{ devices: DeviceFromApi[]; total: number }> {
  try {
    const response = await fetch(
      `${API_URL}/api/devices?categoryId=${categoryId}&search=${search}&page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return {
      devices: data.devices || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error("שגיאה בטעינת מכשירים מה-API:", error);
    throw error;
  }
}

export async function fetchDevicesBySubcategoryId(subcategoryId: number, search: string = ""): Promise<DeviceFromApi[]> {
  try {
    const response = await fetch(`${API_URL}/api/devices?subcategoryId=${subcategoryId}&search=${search}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.devices || [];
  } catch (error) {
    console.error(`שגיאה בטעינת מכשירים עבור תת-קטגוריה ${subcategoryId} מה-API:`, error);
    throw error;
  }
}

export async function fetchDeviceById(deviceId: string): Promise<DeviceFromApi | null> {
  try {
    const response = await fetch(`${API_URL}/api/devices/${deviceId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`שגיאה בטעינת מכשיר עם ID ${deviceId} מה-API:`, error);
    throw error;
  }
}

export async function createDevice(formData: FormData, token: string): Promise<DeviceFromApi> {
  try {
    const response = await fetch(`${API_URL}/api/devices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    return data.device;
  } catch (error) {
    console.error("שגיאה ביצירת מכשיר:", error);
    throw error;
  }
}

export async function uploadAttachments(deviceId: number, files: FileList, token: string): Promise<Attachment[]> {
    const formData = new FormData();
    for (const file of Array.from(files)) {
        formData.append('attachments', file);
    }
    
    try {
        const response = await fetch(`${API_URL}/api/devices/${deviceId}/attachments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.attachments;
    } catch (error) {
        console.error("שגיאה בהעלאת קבצים:", error);
        throw error;
    }
}

export async function deleteAttachment(deviceId: number, attachmentId: number, token: string): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/api/devices/${deviceId}/attachments/${attachmentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'שגיאה במחיקת קובץ מצורף.');
        }
    } catch (error) {
        console.error("שגיאה במחיקת קובץ מצורף:", error);
        throw error;
    }
}

export async function login(credentials: UserCredentials): Promise<{ token: string, user: User }> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'שם משתמש או סיסמה שגויים');
    }

    const data = await response.json();
    return { token: data.token, user: data.user };
  } catch (error) {
    console.error("שגיאת התחברות:", error);
    throw error;
  }
}

export async function register(credentials: UserCredentials): Promise<{ token: string, user: User }> {
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'שגיאה בהרשמה');
        }

        const data = await response.json();
        return { token: data.token, user: data.user };
    } catch (error) {
        console.error("שגיאת הרשמה:", error);
        throw error;
    }
}

export async function createCategory(name: string, imageFile: File | null, token: string): Promise<Category> {
  const formData = new FormData();
  formData.append('name', name);
  if (imageFile) {
    formData.append('categoryImage', imageFile);
  }

  try {
    const response = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'שגיאה ביצירת קטגוריה');
    }
    const data = await response.json();
    return data.category;
  } catch (error) {
    console.error("שגיאה ביצירת קטגוריה:", error);
    throw error;
  }
}

export async function updateCategory(id: number, name: string, imageFile: File | null, token: string): Promise<Category> {
    const formData = new FormData();
    formData.append('name', name);
    if (imageFile) {
        formData.append('categoryImage', imageFile);
    }
    
    try {
        const response = await fetch(`${API_URL}/api/categories/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'שגיאה בעדכון קטגוריה');
        }
        const data = await response.json();
        return data.category;
    } catch (error) {
        console.error("שגיאה בעדכון קטגוריה:", error);
        throw error;
    }
}

export async function deleteCategory(id: number, token: string): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/api/categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'שגיאה במחיקת קטגוריה');
        }
    } catch (error) {
        console.error("שגיאה במחיקת קטגוריה:", error);
        throw error;
    }
}

export async function createSubcategory(name: string, categoryId: number, token: string): Promise<Subcategory> {
  try {
    const response = await fetch(`${API_URL}/api/subcategories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, categoryId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'שגיאה ביצירת תת-קטגוריה');
    }
    const data = await response.json();
    return data.subcategory;
  } catch (error) {
    console.error("שגיאה ביצירת תת-קטגוריה:", error);
    throw error;
  }
}

export async function updateSubcategory(id: number, name: string, categoryId: number, token: string): Promise<Subcategory> {
    try {
        const response = await fetch(`${API_URL}/api/subcategories/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ name, categoryId }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'שגיאה בעדכון תת-קטגוריה');
        }
        const data = await response.json();
        return data.subcategory;
    } catch (error) {
        console.error("שגיאה בעדכון תת-קטגוריה:", error);
        throw error;
    }
}

export async function deleteSubcategory(id: number, token: string): Promise<void> {
    try {
        const response = await fetch(`${API_URL}/api/subcategories/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'שגיאה במחיקת תת-קטגוריה');
        }
    } catch (error) {
        console.error("שגיאה במחיקת תת-קטגוריה:", error);
        throw error;
    }
}

export async function updateDevice(deviceId: number, formData: FormData, token: string): Promise<DeviceFromApi> {
  try {
    const response = await fetch(`${API_URL}/api/devices/${deviceId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'שגיאה בעדכון מכשיר.');
    }
    const data = await response.json();
    return data.device;
  } catch (error) {
    console.error("שגיאה בעדכון מכשיר:", error);
    throw error;
  }
}

export async function deleteDevice(deviceId: number, token: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/devices/${deviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'שגיאה במחיקת מכשיר.');
    }
  } catch (error) {
    console.error("שגיאה במחיקת מכשיר:", error);
    throw error;
  }
}

export type { Device };