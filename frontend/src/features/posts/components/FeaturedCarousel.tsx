import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useFeaturedPosts } from "../hooks/useFeaturedPosts";

// Tamaño de cada slide: más alto en móvil, panorámico en pantallas medianas y grandes.
// El tope de altura evita que en pantallas enormes el slider ocupe más que la ventana.
const SLIDE_SIZE = "aspect-[4/3] md:aspect-[16/9] max-h-[70vh]";

export default function FeaturedCarousel() {
  const { data: posts, isLoading } = useFeaturedPosts();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const count = posts?.length ?? 0;

  function scrollToIndex(index: number, behavior: ScrollBehavior = "smooth") {
    const container = scrollRef.current;
    if (!container) return;
    const slideWidth = container.clientWidth;
    container.scrollTo({ left: slideWidth * index, behavior });
  }

  function goNext() {
    const nextIndex = activeIndex + 1 >= count ? 0 : activeIndex + 1;
    scrollToIndex(nextIndex);
  }

  function goPrev() {
    const prevIndex = activeIndex - 1 < 0 ? count - 1 : activeIndex - 1;
    scrollToIndex(prevIndex);
  }

  // Detecta el slide activo mientras el usuario hace swipe/scroll manual
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    function handleScroll() {
      const slideWidth = container!.clientWidth;
      const index = Math.round(container!.scrollLeft / slideWidth);
      setActiveIndex(index);
    }

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [count]);

  if (isLoading) {
    return (
      <div className={`${SLIDE_SIZE} mb-6 w-full animate-pulse rounded-xl bg-surface`} />
    );
  }

  if (!posts || posts.length === 0) return null;

  return (
    <div className="relative mb-6 group">
      <button
        onClick={goPrev}
        aria-label="Anterior"
        className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
      >
        <ChevronLeft size={22} />
      </button>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/item/${post.rankableItem.id}`}
            data-theme={post.category}
            className={`relative shrink-0 w-full ${SLIDE_SIZE} rounded-xl overflow-hidden snap-start`}
          >
            <img
              src={post.media[0]?.url ?? post.rankableItem.coverUrl}
              alt={post.rankableItem.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <div className="mb-1 flex items-center gap-1 text-xs text-white/90 md:text-sm">
                <Star size={14} className="text-primary" fill="currentColor" />
                {post.averageRating.toFixed(1)}
              </div>
              <h3 className="line-clamp-2 text-base font-semibold leading-tight text-white md:text-xl lg:text-2xl">
                {post.rankableItem.title}
              </h3>
              <p className="mt-0.5 text-xs text-white/70 md:text-sm">
                {post.rankableItem.creator.name}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={goNext}
        aria-label="Siguiente"
        className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {posts.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            aria-label={`Ir al destacado ${index + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}