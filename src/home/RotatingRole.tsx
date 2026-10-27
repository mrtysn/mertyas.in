import { useEffect, useState } from "react";

const ROLES = ["backend", "CTO", "AI engineer", "researcher"];
const INTERVAL_MS = 2500;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const fullList = (
  <>
    {ROLES.map((role, i) => (
      <span key={role}>
        {i > 0 && " · "}
        <span className="text-primary">{role}</span>
      </span>
    ))}{" "}
    as a service
  </>
);

// Reduced motion, and a paused line, show the whole list: nothing depends on the animation.
// The rotation updates by itself for longer than five seconds, so it has a pause control
// (WCAG 2.2.2), and screen readers get the full list once instead of each word as it changes.
function RotatingRole() {
  const [index, setIndex] = useState(0);
  const [reduced] = useState(prefersReducedMotion);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % ROLES.length),
      INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [reduced, paused]);

  if (reduced) return <p>{fullList}</p>;

  return (
    <p>
      <span className="sr-only">{ROLES.join(", ")} as a service</span>
      <span aria-hidden="true">
        {paused ? (
          fullList
        ) : (
          <>
            <span className="text-primary">{ROLES[index]}</span> as a service
          </>
        )}
      </span>
      <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? "play rotating roles" : "pause rotating roles"}>
        {paused ? "play" : "pause"}
      </button>
    </p>
  );
}

export default RotatingRole;
