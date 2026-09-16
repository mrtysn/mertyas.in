import { useState, useEffect } from "react";

const themes = { light: "light", dark: "dark" };
const THEME_KEY = "theme";

/*
  A theme flip changes colour on nearly every element at once. Anything carrying
  a colour transition — the bookmark status filters — would otherwise arrive
  150ms after the rest of the page had already changed, so the switch smears
  instead of snapping. Transitions are suppressed for the frame that applies it:
  add the rule, force a reflow so it is in effect, drop it on the next frame.
*/
function setTheme(theme: string) {
  const root = document.documentElement;
  const halt = document.createElement("style");
  halt.textContent = "*,*::before,*::after{transition:none !important}";
  document.head.appendChild(halt);
  root.setAttribute("data-theme", theme);
  void root.offsetHeight;
  requestAnimationFrame(() => halt.remove());
}

const getInitialTheme = () => {
  // Check localStorage first
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved;

  // Check system preference
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return themes.light;
  }

  // Default to dark
  return themes.dark;
};

function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState(getInitialTheme);

  const toggleTheme = () => {
    const newTheme = currentTheme === themes.light ? themes.dark : themes.light;
    setCurrentTheme(newTheme);
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  // Apply initial theme on mount
  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  const getEmoji = () => {
    return currentTheme === themes.light ? "🌞" : "🌚"; // Choose emojis based on theme
  };

  // A button, not a link: it goes nowhere, and an <a> without href takes no
  // focus, so the keyboard could not reach the switch at all.
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={
        currentTheme === themes.light
          ? "Switch to the dark theme"
          : "Switch to the light theme"
      }
    >
      {getEmoji()}
    </button>
  );
}

export default ThemeSelector;
