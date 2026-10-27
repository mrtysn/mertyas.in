import { useEffect, useState } from "react";

const ROLES = ["backend", "CTO", "AI engineer", "researcher"];
const INTERVAL_MS = 2500;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Reduced motion gets the whole list, so nothing depends on the animation.
function RotatingRole() {
  const [index, setIndex] = useState(0);
  const [still] = useState(prefersReducedMotion);

  useEffect(() => {
    if (still) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % ROLES.length),
      INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [still]);

  if (still) {
    return (
      <p>
        {ROLES.map((role, i) => (
          <span key={role}>
            {i > 0 && " · "}
            <span className="text-primary">{role}</span>
          </span>
        ))}{" "}
        as a service
      </p>
    );
  }

  return (
    <p aria-label={`${ROLES.join(", ")} as a service`}>
      <span className="text-primary" aria-hidden="true">
        {ROLES[index]}
      </span>{" "}
      <span aria-hidden="true">as a service</span>
    </p>
  );
}

export default RotatingRole;
