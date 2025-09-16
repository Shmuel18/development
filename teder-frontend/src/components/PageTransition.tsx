import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <>
      {/* אנימציה של המעבר עצמו - מופיעה לפני יציאת הדף הישן */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[999] bg-black flex items-center justify-center pointer-events-none"
      >
        <motion.img
          src="/Logo.png"
          alt="Teder Logo"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 2, opacity: 1 }}
          transition={{ duration: 0.2, type: "tween" }}
          className="w-32 h-32"
        />
      </motion.div>

      {/* אנימציה של תוכן הדף החדש */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default PageTransition;