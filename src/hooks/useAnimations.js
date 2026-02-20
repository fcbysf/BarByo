import { useEffect } from "react";
import gsap from "gsap";

export const useFadeIn = (ref, dependencies = [], options = {}) => {
  useEffect(() => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: options.y || 20 },
      {
        opacity: 1,
        y: 0,
        duration: options.duration || 0.6,
        ease: options.ease || "power3.out",
        delay: options.delay || 0,
      },
    );
  }, dependencies); // Re-run animation when dependencies change
};

export const useStagger = (
  containerRef,
  selector,
  dependencies = [],
  options = {},
) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll(selector);
    if (!elements.length) return;

    gsap.fromTo(
      elements,
      { opacity: 0, y: options.y || 20 },
      {
        opacity: 1,
        y: 0,
        duration: options.duration || 0.5,
        stagger: options.stagger || 0.05,
        ease: options.ease || "power2.out",
        delay: options.delay || 0,
      },
    );
  }, dependencies);
};
