import Hero from "./Hero";
import Categories from "./Categories";

export default function HomePage() {
  return (
    <section
      className="relative bg-center bg-cover w-full text-black dark:text-white transition-colors duration-300"
      style={{
        backgroundImage: "url('/bg-tech-wave.jpg')",
      }}
      dir="rtl"
    >
      {/* רק במצב כהה נוסיף שכבת כהות */}
      <div className="absolute inset-0 z-0 transition-opacity duration-300">
        <div className="w-full h-full dark:bg-black dark:bg-opacity-60" />
      </div>

      {/* Hero ו-Categories */}
      <div className="relative z-10">
        <Hero />
        <Categories />
      </div>
    </section>
  );
}
