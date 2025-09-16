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

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          כל התדרים. כל הנתונים. במקום אחד.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default Hero;