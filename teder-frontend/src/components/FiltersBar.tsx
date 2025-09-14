// import { FaSearch } from "react-icons/fa";

// type FiltersBarProps = {
//   search: string;
//   onSearch: (value: string) => void;
//   activeCategory?: string;
//   onCategoryChange?: (value: string) => void;
//   hideCategories?: boolean;
// };

// const categories = ["הכול", "לוויינים", "רחפנים", "רדיו", "ציוד שטח"];

// const FiltersBar = ({
//   search,
//   onSearch,
//   activeCategory = "הכול",
//   onCategoryChange,
//   hideCategories = false,
// }: FiltersBarProps) => {
//   return (
//     <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white py-4 px-6 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4" dir="rtl">
//       {/* כפתורי קטגוריות */}
//       {!hideCategories && onCategoryChange && (
//         <div className="flex flex-wrap gap-3 justify-end">
//           {categories.map((cat) => (
//             <button
//               key={cat}
//               onClick={() => onCategoryChange(cat)}
//               className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
//                 activeCategory === cat
//                   ? "bg-blue-600 border-blue-500 shadow-md"
//                   : "bg-transparent border-gray-500 hover:bg-blue-700"
//               }`}
//             >
//               {cat}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* שורת חיפוש */}
//       <div className="flex items-center gap-2 bg-[#121826] border border-blue-500 px-3 py-2 rounded-xl w-full md:max-w-sm">
//         <FaSearch className="text-blue-400 text-lg" />
//         <input
//           type="text"
//           placeholder="חיפוש לפי שם או תדר..."
//           value={search}
//           onChange={(e) => onSearch(e.target.value)}
//           className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm text-right"
//         />
//       </div>
//     </div>
//   );
// };

// export default FiltersBar;
