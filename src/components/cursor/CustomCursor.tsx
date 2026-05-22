import { useEffect, useRef } from "react";

const TRAIL_DOTS = 4;

function CustomCursor() {
  const trailRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLSpanElement[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const positionsRef = useRef(
    Array.from({ length: TRAIL_DOTS }, () => ({ x: 0, y: 0 }))
  );

  useEffect(() => {
    const trail = trailRef.current;

    if (!trail || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    document.body.classList.add("cursor-trail-enabled");

    const moveTrail = (event: MouseEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
      trail.classList.add("is-visible");
    };

    const animateTrail = () => {
      const positions = positionsRef.current;
      positions[0].x += (mouseRef.current.x - positions[0].x) * 0.52;
      positions[0].y += (mouseRef.current.y - positions[0].y) * 0.52;

      for (let index = 1; index < positions.length; index += 1) {
        positions[index].x += (positions[index - 1].x - positions[index].x) * 0.5;
        positions[index].y += (positions[index - 1].y - positions[index].y) * 0.5;
      }

      dotsRef.current.forEach((dot, index) => {
        const scale = 1 - index * 0.08;
        dot.style.transform = `translate3d(${positions[index].x}px, ${positions[index].y}px, 0) translate(-50%, -50%) scale(${scale})`;
        dot.style.opacity = `${1 - index * 0.1}`;
      });

      requestAnimationFrame(animateTrail);
    };

    const animationFrame = requestAnimationFrame(animateTrail);
    window.addEventListener("mousemove", moveTrail);

    return () => {
      document.body.classList.remove("cursor-trail-enabled");
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("mousemove", moveTrail);
    };
  }, []);

  return (
    <div className="cursor-trail" ref={trailRef} aria-hidden="true">
      {Array.from({ length: TRAIL_DOTS }).map((_, index) => (
        <span
          key={index}
          ref={(element) => {
            if (element) {
              dotsRef.current[index] = element;
            }
          }}
        />
      ))}
    </div>
  );
}

export default CustomCursor;
