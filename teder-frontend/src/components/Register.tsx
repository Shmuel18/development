import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register as registerApi, UserCredentials } from "../api/api";
import { motion } from "framer-motion";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const credentials: UserCredentials = { username, password };
      const { token, user } = await registerApi(credentials);
      login({ token, user });
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאת הרשמה לא ידועה.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="relative min-h-screen p-8 bg-cover bg-center" style={{ backgroundImage: "url('/bg-tech-wave.jpg')" }}>
      <div className="bg-black bg-opacity-60 w-full h-full absolute inset-0 -z-10" />
      <div className="flex justify-center items-center h-screen">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-2xl w-full max-w-md"
        >
          <h1 className="text-4xl font-bold text-white text-center mb-6">הרשמה</h1>
          {error && <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="username">
                שם משתמש
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
                סיסמה
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-white bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "מרשם..." : "הירשם"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;