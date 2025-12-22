import { useState, useEffect } from "react";

const themes = { light: "light", dark: "dark" };
const THEME_KEY = "theme";

function setTheme(theme: string) {
  document.documentElement.setAttribute("data-theme", theme);
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

  return <a onClick={toggleTheme}>{getEmoji()}</a>;
}

export default ThemeSelector;
