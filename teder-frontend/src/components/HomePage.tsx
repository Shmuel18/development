import Hero from "./Hero";
import Categories from "./Categories";

export default function HomePage() {
  return (
    <section
      className="relative w-full"
      dir="rtl"
    >
      <div className="relative z-10">
        <Hero />
        <Categories />
      </div>
    </section>
  );
}