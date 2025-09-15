import { Device } from "../data/devicesData";

const API_URL = 'http://localhost:3000/api';

export interface Category {
  id: number;
  name: string;
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
    const response = await fetch(`${API_URL}/categories`);
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

export async function fetchDevices(
  categoryId: number,
  search: string = "",
  page: number = 1,
  limit: number = 20
): Promise<{ devices: DeviceFromApi[]; total: number }> {
  try {
    const response = await fetch(
      `${API_URL}/devices?categoryId=${categoryId}&search=${search}&page=${page}&limit=${limit}`
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

export async function fetchDeviceById(deviceId: string): Promise<DeviceFromApi | null> {
  try {
    const response = await fetch(`${API_URL}/devices/${deviceId}`);
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

export async function createDevice(deviceData: NewDeviceData, token: string): Promise<DeviceFromApi> {
  try {
    const response = await fetch(`${API_URL}/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(deviceData),
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

export async function login(credentials: UserCredentials): Promise<{ token: string, user: User }> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
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
        const response = await fetch(`${API_URL}/auth/register`, {
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

export type { Device };