export interface Device {
  id: number;
  name: string;
  category: string;
  frequency?: string;
  manufacturer: string;
  status: "פעיל" | "ממתין לבדיקה" | "לא בשימוש";
  image: string;
}

export const categories = [
  { id: 1, name: "לווינים" },
  { id: 2, name: "רחפנים" },
  { id: 3, name: "מכשירי קשר" },
  { id: 4, name: "מערכות הפעלה" },
];

export const devicesData: Device[] = [];