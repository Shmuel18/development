import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section
      className="relative text-white text-center py-16 px-6 w-full"
      dir="rtl"
    >
      <motion.div
        className="relative z-10 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 drop-shadow-xl">
          תדר
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          כל התדרים. כל הנתונים. במקום אחד.
        </p>

        {/* <div className="flex flex-wrap justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold transition"
          >
            🔍 חיפוש תדרים
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-md text-lg font-semibold transition"
          >
            📅 גישה לדו"חות
          </motion.button>
        </div> */}
      </motion.div>

      {/* גל SVG המקורי מתוך frequency-wave.svg
      <div className="mt-8 w-full mb-6">
        <img
          src="/src/assets/frequency-wave.svg"
          alt="Wave Divider"
          className="w-full h-28 object-cover opacity-80"
        />
      </div> */}
    </section>
  );
};

export default Hero;
