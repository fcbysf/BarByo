import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useFadeIn = (ref, dependencies = [], options = {}) => {
  useEffect(() => {
    if (!ref.current) return;

    const animation = gsap.fromTo(
      ref.current,
      { opacity: 0, y: options.y || 20 },
      {
        opacity: 1,
        y: 0,
        duration: options.duration || 0.6,
        ease: options.ease || "power3.out",
        delay: options.delay || 0,
        scrollTrigger:
          options.scrollTrigger !== false
            ? {
                trigger: ref.current,
                start: options.start || "top 85%",
                toggleActions: "play none none none",
              }
            : undefined,
      },
    );

    return () => {
      if (animation.scrollTrigger) animation.scrollTrigger.kill();
      animation.kill();
    };
  }, dependencies);
};

export const useStagger = (
  containerRef,
  selector,
  dependencies = [],
  options = {},
) => {
  useEffect(() => {
    if (!containerRef.current) return;

    // Slight timeout ensures DOM is fully rendered before querySelectorAll runs
    const timer = setTimeout(() => {
      const elements = containerRef.current.querySelectorAll(selector);
      if (!elements.length) return;

      const animation = gsap.fromTo(
        elements,
        { opacity: 0, y: options.y || 20 },
        {
          opacity: 1,
          y: 0,
          duration: options.duration || 0.5,
          stagger: options.stagger || 0.1,
          ease: options.ease || "power2.out",
          delay: options.delay || 0,
          scrollTrigger:
            options.scrollTrigger !== false
              ? {
                  trigger: containerRef.current,
                  start: options.start || "top 80%",
                  toggleActions: "play none none none",
                }
              : undefined,
        },
      );

      // Attach animation instance to element so we can kill it later
      containerRef.current._gsapAnim = animation;
    }, 10);

    return () => {
      clearTimeout(timer);
      const anim = containerRef.current?._gsapAnim;
      if (anim) {
        if (anim.scrollTrigger) anim.scrollTrigger.kill();
        anim.kill();
      }
    };
  }, dependencies);
};
